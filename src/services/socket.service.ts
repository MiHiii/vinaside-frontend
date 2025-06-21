import { io, Socket } from 'socket.io-client';

const WS_URL = 'http://localhost:8080';

interface MessageData {
  _id?: string;
  id?: string;
  content: string;
  sender_id?: { _id?: string } | string;
  senderId?: string;
  receiver_id?: { _id?: string } | string;
  receiverId?: string;
  conversation_id?: string;
  conversationId?: string;
  sent_at?: string;
  createdAt?: string;
  is_read?: string | boolean;
}

interface NormalizedMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
}

interface SocketError extends Error {
  description?: string;
  context?: unknown;
  type?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: NormalizedMessage) => void)[] = [];
  private readHandlers: ((data: { messageId: string }) => void)[] = [];
  private userOnlineHandlers: ((userId: string) => void)[] = [];
  private userOfflineHandlers: ((userId: string) => void)[] = [];
  private userId: string | null = null;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;

  connect(token: string, userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      console.log('Socket already connected for user:', userId);
      return;
    }

    if (this.socket && this.userId !== userId) {
      console.log('Disconnecting previous socket connection for different user');
      this.disconnect();
    }

    this.userId = userId;
    this.connectionAttempts++;

    console.log(`🔄 Attempting to connect to WebSocket (attempt ${this.connectionAttempts})`);
    console.log('🔗 WebSocket URL:', `${WS_URL}/ws/messages`);
    console.log('👤 User ID:', userId);

    this.socket = io(`${WS_URL}/ws/messages`, {
      auth: { token },
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('🔌 Socket ID:', this.socket?.id);
      this.connectionAttempts = 0;
      this.joinRoom(userId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server. Reason:', reason);
    });

    this.socket.on('connect_error', (error: SocketError) => {
      console.error('🚫 Socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description || 'No description',
        context: error.context || 'No context',
        type: error.type || 'Unknown type',
      });
    });

    this.socket.on('error', (error) => {
      console.error('⚠️ Socket error:', error);
    });

    this.socket.on('new_message', (message: MessageData) => {
      console.log('📨 Raw socket message received:', message);

      try {
        let senderId = '';
        let receiverId = '';

        if (typeof message.sender_id === 'object' && message.sender_id?._id) {
          senderId = message.sender_id._id;
        } else if (typeof message.sender_id === 'string') {
          senderId = message.sender_id;
        } else if (message.senderId) {
          senderId = message.senderId;
        }

        if (typeof message.receiver_id === 'object' && message.receiver_id?._id) {
          receiverId = message.receiver_id._id;
        } else if (typeof message.receiver_id === 'string') {
          receiverId = message.receiver_id;
        } else if (message.receiverId) {
          receiverId = message.receiverId;
        }

        const normalizedMessage: NormalizedMessage = {
          id: message._id || message.id || `temp_${Date.now()}`,
          content: message.content || '',
          senderId,
          receiverId,
          conversationId: message.conversation_id || message.conversationId || '',
          createdAt: message.sent_at || message.createdAt || new Date().toISOString(),
          isRead: message.is_read === 'read' || message.is_read === true,
        };

        console.log('📋 Normalized message:', normalizedMessage);
        console.log('👤 Current user ID:', this.userId);
        console.log('✉️ Message from:', normalizedMessage.senderId, 'to:', normalizedMessage.receiverId);

        const isRelevantMessage =
          normalizedMessage.senderId === this.userId || normalizedMessage.receiverId === this.userId;

        console.log('🎯 Is message relevant?', isRelevantMessage);

        if (isRelevantMessage) {
          console.log('📤 Broadcasting message to handlers. Handler count:', this.messageHandlers.length);
          this.messageHandlers.forEach((handler, index) => {
            try {
              handler(normalizedMessage);
              console.log(`✅ Handler ${index} executed successfully`);
            } catch (error) {
              console.error(`❌ Error in message handler ${index}:`, error);
            }
          });
        } else {
          console.log('⏭️ Message skipped - not relevant for current user');
        }
      } catch (error) {
        console.error('❌ Error processing new message:', error);
      }
    });

    this.socket.on('message_read', (data) => {
      console.log('✅ Message read event:', data);
      this.readHandlers.forEach((handler) => handler(data));
    });

    this.socket.on('user_online', ({ userId: onlineUserId }: { userId: string }) => {
      console.log(`👤 User ${onlineUserId} is online`);
      this.userOnlineHandlers.forEach((handler) => handler(onlineUserId));
    });

    this.socket.on('user_offline', ({ userId: offlineUserId }: { userId: string }) => {
      console.log(`👤 User ${offlineUserId} is offline`);
      this.userOfflineHandlers.forEach((handler) => handler(offlineUserId));
    });

    this.socket.on('reconnect', (attempt) => {
      console.log('🔄 Reconnected after', attempt, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('🔄 Reconnection attempt:', attempt);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.connectionAttempts = 0;
    }
  }

  sendMessage(message: { content: string; receiverId: string }) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected - cannot send message');
      return;
    }

    const messageData = {
      sender_id: this.userId,
      receiver_id: message.receiverId,
      content: message.content,
    };

    console.log('📤 Sending message via socket:', messageData);
    this.socket.emit('send_message', messageData);
  }

  onNewMessage(handler: (message: NormalizedMessage) => void) {
    console.log('📝 Registering new message handler. Total handlers:', this.messageHandlers.length + 1);
    this.messageHandlers.push(handler);
    return () => {
      console.log('🗑️ Removing message handler');
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onMessageRead(handler: (data: { messageId: string }) => void) {
    this.readHandlers.push(handler);
    return () => {
      this.readHandlers = this.readHandlers.filter((h) => h !== handler);
    };
  }

  public onUserOnline(callback: (userId: string) => void) {
    console.log('📝 Registering user online handler. Total handlers:', this.userOnlineHandlers.length + 1);
    this.userOnlineHandlers.push(callback);
    return () => {
      console.log('🗑️ Removing user online handler');
      this.userOnlineHandlers = this.userOnlineHandlers.filter((h) => h !== callback);
    };
  }

  public onUserOffline(callback: (userId: string) => void) {
    console.log('📝 Registering user offline handler. Total handlers:', this.userOfflineHandlers.length + 1);
    this.userOfflineHandlers.push(callback);
    return () => {
      console.log('🗑️ Removing user offline handler');
      this.userOfflineHandlers = this.userOfflineHandlers.filter((h) => h !== callback);
    };
  }

  public markMessageAsRead(messageId: string) {
    if (this.socket && this.socket.connected) {
      console.log('✅ Marking message as read via socket:', messageId);
      this.socket.emit('mark_message_read', { messageId });
    } else {
      console.warn('⚠️ Socket not connected, cannot mark message as read');
    }
  }

  public joinRoom(userId: string) {
    if (this.socket && userId) {
      console.log('🏠 Joining room for user:', userId);
      this.socket.emit('join_room', { userId });
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public forceReconnect(token: string, userId: string) {
    console.log('🔄 Force reconnecting...');
    this.disconnect();
    setTimeout(() => {
      this.connect(token, userId);
    }, 1000);
  }

  // Listen for reaction updates
  onReactionUpdate(callback: (data: { messageId: string; reactions: unknown[] }) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected, cannot listen for reaction updates');
      return () => {};
    }

    console.log('📝 Registering reaction update handler');

    this.socket.on('reaction_update', (data) => {
      console.log('🎉 Reaction update received:', data);
      callback(data);
    });

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off('reaction_update');
        console.log('🧹 Reaction update handler removed');
      }
    };
  }
}

const socketService = new SocketService();
export default socketService;
