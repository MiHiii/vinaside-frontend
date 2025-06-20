import { io, Socket } from 'socket.io-client';

const WS_URL = "http://localhost:8080";

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  private readHandlers: ((data: { messageId: string }) => void)[] = [];
  private userId: string | null = null;

  connect(token: string, userId: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;

    this.socket = io(`${WS_URL}/ws/messages`, {
      auth: { token, userId },
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.joinRoom(userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('new_message', (message) => {
      console.log('Raw socket message:', message);
      
      // Normalize message data
      const normalizedMessage = {
        id: message._id || message.id,
        content: message.content,
        senderId: message.sender_id?._id || message.sender_id || message.senderId,
        receiverId: message.receiver_id?._id || message.receiver_id || message.receiverId,
        conversationId: message.conversation_id || message.conversationId || '',
        createdAt: message.sent_at || message.createdAt || new Date().toISOString(),
        isRead: message.is_read === 'read' || message.is_read === true
      };

      // Chỉ xử lý tin nhắn liên quan đến user hiện tại
      if (normalizedMessage.senderId === this.userId || normalizedMessage.receiverId === this.userId) {
        this.messageHandlers.forEach(handler => handler(normalizedMessage));
      }
    });

    this.socket.on('message_read', (data) => {
      console.log('Message read:', data);
      this.readHandlers.forEach(handler => handler(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  sendMessage(message: { content: string; receiverId: string }) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    console.log('Sending message via socket:', { ...message, senderId: this.userId });
    this.socket.emit('send_message', { ...message, senderId: this.userId });
  }

  onNewMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onMessageRead(handler: (data: { messageId: string }) => void) {
    this.readHandlers.push(handler);
    return () => {
      this.readHandlers = this.readHandlers.filter(h => h !== handler);
    };
  }

  public onUserOnline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  public onUserOffline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  public markMessageAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit('mark_message_read', { messageId });
    }
  }

  public joinRoom(userId: string) {
    if (this.socket && userId) {
      console.log('Joining room for user:', userId);
      this.socket.on('connect', () => {
        this.joinRoom(userId);
      });
    }
  }
}

const socketService = new SocketService();
export default socketService;
