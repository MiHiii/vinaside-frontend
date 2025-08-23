import { api } from "./api";
import { io, Socket } from "socket.io-client";

export interface BotMessage {
  type: "text" | "listings";
  text?: string;
  header?: string;
  meta?: {
    dateRange?: string;
    guests?: number;
    city?: string;
    total?: number;
  };
  items?: Array<{
    id: string;
    title: string;
    pricePerNight: number;
    address?: string;
    tags?: string[];
    imageUrl?: string;
    detailUrl?: string;
  }>;
  cta?: {
    label: string;
    action: "HOLD" | "DETAIL";
    payload?: any;
  };
}

export interface ChatbotMessage {
  _id: string;
  content: string;
  reply: string | BotMessage;
  createdAt: string;
  user_id?: string;
}

export interface SendMessageRequest {
  content: string;
  user_id?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: BotMessage;
  statusCode?: number;
  message?: string;
}

export interface ConversationResponse {
  success: boolean;
  data: ChatbotMessage[];
  statusCode?: number;
  message?: string;
}

class ChatbotService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: ChatbotMessage) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private reconnectTimeout: number | null = null;
  private maxReconnectAttempts = 3;
  private reconnectAttempts = 0;
  private userId: string | null = null;

  // Gửi tin nhắn qua API
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const requestData = {
        content: data.content,
        user_id: data.user_id,
      };
      const response = await api.post("/chatbot/message", requestData);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Kết nối Socket.IO cho realtime chat
  connectWebSocket(userId?: string) {
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId || null;
    this.reconnectAttempts++;

    const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

    this.socket = io(`${WS_URL}/ws/chatbot`, {
      transports: ["websocket"],
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
      query: { userId: userId || "anonymous" },
    });

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus(true);

      // Join room với userId
      if (userId) {
        this.socket?.emit("join_room", { userId });
      }
    });

    this.socket.on("disconnect", () => {
      this.notifyConnectionStatus(false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Chatbot Socket.IO connection error:", error);
      this.notifyConnectionStatus(false);
    });

    this.socket.on("error", (error) => {
      console.error("Chatbot Socket.IO error:", error);
      this.notifyConnectionStatus(false);
    });

    // Nhận tin nhắn mới từ server
    this.socket.on("receive_message", (data) => {
      try {
        const message: ChatbotMessage = {
          _id: data._id || Date.now().toString(),
          content: data.content || "", // Giữ nguyên content gốc
          reply: data.reply || data.message || data.data || "", // Reply từ bot
          createdAt: data.createdAt || new Date().toISOString(),
          user_id: data.user_id || this.userId,
        };
        this.notifyMessageListeners(message);
      } catch (error) {
        console.error("Error parsing receive_message:", error);
      }
    });

    // Nhận tin nhắn mới (fallback)
    this.socket.on("new_message", (data) => {
      try {
        const message: ChatbotMessage = {
          _id: data._id || data.id || Date.now().toString(),
          content: data.content || "", // Giữ nguyên content gốc
          reply: data.reply || data.message || data.data || "", // Reply từ bot
          createdAt:
            data.createdAt || data.timestamp || new Date().toISOString(),
          user_id: data.user_id || this.userId,
        };
        this.notifyMessageListeners(message);
      } catch (error) {
        console.error("Error parsing new_message:", error);
      }
    });

    this.socket.on("reconnect", () => {
      this.notifyConnectionStatus(true);
    });

    this.socket.on("reconnect_attempt", () => {
      // Silent reconnect attempt
    });

    this.socket.on("reconnect_failed", () => {
      this.notifyConnectionStatus(false);
    });
  }

  // Gửi tin nhắn qua Socket.IO (chỉ dùng cho realtime, không dùng cho gửi tin nhắn chính)
  sendMessageViaWebSocket(content: string) {
    if (this.socket && this.socket.connected) {
      const messageData = {
        userId: this.userId,
        message: content,
        timestamp: new Date().toISOString(),
      };
      this.socket.emit("send_message", messageData);
    }
  }

  // Đăng ký listener cho tin nhắn mới
  onMessage(callback: (message: ChatbotMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Đăng ký listener cho trạng thái kết nối
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Thông báo cho các listeners
  private notifyMessageListeners(message: ChatbotMessage) {
    this.messageCallbacks.forEach((callback) => callback(message));
  }

  private notifyConnectionStatus(connected: boolean) {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  // Ngắt kết nối Socket.IO
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.userId = null;
    this.reconnectAttempts = 0;
  }

  // Kiểm tra trạng thái kết nối
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Lấy thông tin trạng thái kết nối
  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      socketId: this.socket?.id || null,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name || "unknown",
    };
  }
}

export const chatbotService = new ChatbotService();
