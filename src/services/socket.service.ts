import { io, Socket } from 'socket.io-client';
import { MessageWithUI, ConversationUpdateV2 } from '@/types/message';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

// Legacy notification types
interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: MessageWithUI) => void)[] = [];
  private reactionUpdateHandlers: ((message: MessageWithUI) => void)[] = [];
  private conversationUpdateHandlers: ((data: ConversationUpdateV2) => void)[] = [];
  private messageRecallHandlers: ((message: MessageWithUI) => void)[] = [];
  private notificationHandlers: ((notification: NotificationData) => void)[] = [];
  private notificationHandlersV2: ((notification: NotificationData) => void)[] = [];
  public notificationSocket: Socket | null = null;
  private notificationUserId: string | null = null;
  private userId: string | null = null;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;

  connect(token: string, userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;
    this.connectionAttempts++;

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.connectionAttempts = 0;
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Socket connection error:', error);
    });

    // V2 API Events - Match backend event names exactly
    this.socket.on('New Message', (message: MessageWithUI) => {
      console.log('📨 New message received:', message);
      this.notifyMessageListeners(message);
    });

    this.socket.on('Reaction Update', (message: MessageWithUI) => {
      console.log('👍 Reaction update received:', message);
      this.notifyReactionUpdateListeners(message);
    });

    this.socket.on('Message Recalled', (message: MessageWithUI) => {
      console.log('🗑️ Message recalled:', message);
      this.notifyMessageRecallListeners(message);
    });

    this.socket.on('ConversationUpdateV2', (data: ConversationUpdateV2) => {
      console.log('💬 Conversation update v2 received:', data);
      this.notifyConversationUpdateListeners(data);
    });

    // Legacy event names for backward compatibility
    this.socket.on('new_message', (message: MessageWithUI) => {
      console.log('📨 Legacy new message received:', message);
      this.notifyMessageListeners(message);
    });

    this.socket.on('reaction_update', (message: MessageWithUI) => {
      console.log('👍 Legacy reaction update received:', message);
      this.notifyReactionUpdateListeners(message);
    });

    this.socket.on('message_recalled', (message: MessageWithUI) => {
      console.log('🗑️ Legacy message recalled:', message);
      this.notifyMessageRecallListeners(message);
    });

    this.socket.on('conversation_update_v2', (data: ConversationUpdateV2) => {
      console.log('💬 Legacy conversation update v2 received:', data);
      this.notifyConversationUpdateListeners(data);
    });

    // Legacy notification events (keep old behavior)
    this.socket.on('notification', (notification: NotificationData) => {
      this.notificationHandlers.forEach((handler) => handler(notification));
    });
  }

  // Legacy notification methods (keep exactly as before)
  connectNotification(token: string, userId: string) {
    if (this.notificationSocket?.connected && this.notificationUserId === userId) {
      return;
    }
    if (this.notificationSocket && this.notificationUserId !== userId) {
      this.disconnectNotification();
    }
    this.notificationUserId = userId;
    this.notificationSocket = io(`${WS_URL}/ws/notifications`, {
      auth: { token },
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });
    this.notificationSocket.on('connect', () => {
      this.notificationSocket?.emit('join_notifications', { userId });
    });
    this.notificationSocket.on('new_notification', (notification: NotificationData) => {
      this.notificationHandlersV2.forEach((handler) => handler(notification));
    });
    this.notificationSocket.on('unread_count_updated', () => {
      // Có thể gọi hàm cập nhật badge ở đây nếu muốn
    });
  }

  disconnectNotification() {
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
      this.notificationUserId = null;
    }
  }

  onNewNotification(handler: (notification: NotificationData) => void) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  onNewNotificationV2(handler: (notification: NotificationData) => void) {
    this.notificationHandlersV2.push(handler);
    return () => {
      this.notificationHandlersV2 = this.notificationHandlersV2.filter((h) => h !== handler);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.connectionAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketStatus() {
    return {
      connected: this.socket?.connected || false,
      userId: this.userId,
      connectionAttempts: this.connectionAttempts,
    };
  }

  forceReconnect(token: string, userId: string) {
    console.log('🔄 Force reconnecting socket...');
    this.disconnect();
    setTimeout(() => {
      this.connect(token, userId);
    }, 1000);
  }

  // Join conversation room for real-time updates
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('🏠 Joining conversation room:', conversationId);
      this.socket.emit('join_conversation', { conversationId });
    } else {
      console.warn('⚠️ Socket not connected, cannot join conversation');
    }
  }

  // Leave conversation room
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log('🚪 Leaving conversation room:', conversationId);
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Join user room for general messages
  joinUserRoom(userId: string) {
    if (this.socket?.connected) {
      console.log('🏠 Joining user room:', `user_${userId}`);
      this.socket.emit('join_room', { room: `user_${userId}` });
    } else {
      console.warn('⚠️ Socket not connected, cannot join user room');
    }
  }

  // Join admin room for admin-specific updates
  joinAdminRoom() {
    if (this.socket?.connected) {
      console.log('🏠 Joining admin room');
      this.socket.emit('join_room', { room: 'admin' });
    } else {
      console.warn('⚠️ Socket not connected, cannot join admin room');
    }
  }

  // Event handlers registration
  onNewMessage(handler: (message: MessageWithUI) => void) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onReactionUpdate(handler: (message: MessageWithUI) => void) {
    this.reactionUpdateHandlers.push(handler);
    return () => {
      const index = this.reactionUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.reactionUpdateHandlers.splice(index, 1);
      }
    };
  }

  onConversationUpdate(handler: (data: ConversationUpdateV2) => void) {
    this.conversationUpdateHandlers.push(handler);
    return () => {
      const index = this.conversationUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.conversationUpdateHandlers.splice(index, 1);
      }
    };
  }

  onMessageRecall(handler: (message: MessageWithUI) => void) {
    this.messageRecallHandlers.push(handler);
    return () => {
      const index = this.messageRecallHandlers.indexOf(handler);
      if (index > -1) {
        this.messageRecallHandlers.splice(index, 1);
      }
    };
  }

  // Notify handlers
  private notifyMessageListeners(message: MessageWithUI) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ Error in message handler:', error);
      }
    });
  }

  private notifyReactionUpdateListeners(message: MessageWithUI) {
    this.reactionUpdateHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ Error in reaction update handler:', error);
      }
    });
  }

  private notifyConversationUpdateListeners(data: ConversationUpdateV2) {
    this.conversationUpdateHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error('❌ Error in conversation update handler:', error);
      }
    });
  }

  private notifyMessageRecallListeners(message: MessageWithUI) {
    this.messageRecallHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ Error in message recall handler:', error);
      }
    });
  }
}

const socketService = new SocketService();

// Expose for debugging in development
if (import.meta.env.DEV) {
  (window as any).socketService = socketService;
}

export default socketService;
