import { io, Socket } from "socket.io-client";
import { MessageWithUI, ConversationUpdateV2 } from "@/types/message";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

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
  private conversationUpdateHandlers: ((data: ConversationUpdateV2) => void)[] =
    [];
  private messageRecallHandlers: ((message: MessageWithUI) => void)[] = [];
  private notificationHandlers: ((notification: NotificationData) => void)[] =
    [];
  private notificationHandlersV2: ((notification: NotificationData) => void)[] =
    [];
  public notificationSocket: Socket | null = null;
  private notificationUserId: string | null = null;
  private userId: string | null = null;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;

  connect(token: string, userId: string) {
    console.log("🔌 [SocketService] Attempting to connect...");
    console.log("✅ [CHECKLIST] JWT token length:", token.length);
    console.log("✅ [CHECKLIST] User ID:", userId);

    // Prevent multiple connections for the same user
    if (this.socket?.connected && this.userId === userId) {
      console.log("🔄 [SocketService] Already connected for user:", userId);
      return;
    }

    // Disconnect if connecting for different user
    if (this.socket && this.userId !== userId) {
      console.log("🔄 [SocketService] Disconnecting for different user");
      this.disconnect();
    }

    // Clear existing handlers to prevent duplicates
    this.messageHandlers = [];
    this.reactionUpdateHandlers = [];
    this.conversationUpdateHandlers = [];
    this.messageRecallHandlers = [];

    this.userId = userId;
    this.connectionAttempts++;

    console.log("🔌 [SocketService] Creating new socket connection...");

    // Create new socket with proper configuration
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true, // Force new connection to ensure clean state
    });

    // Setup event listeners only once
    this.setupEventListeners();

    this.socket.on("connect", () => {
      this.connectionAttempts = 0;
      console.log("✅ [CHECKLIST] Socket kết nối thành công");
      console.log("🔍 [SocketService] Socket ID:", this.socket?.id);
      console.log("🔍 [SocketService] User ID:", this.userId);

      // Emit connection confirmation
      if (this.socket?.id) {
        this.socket.emit("connection_confirmed", {
          userId: this.userId,
          socketId: this.socket.id,
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ [CHECKLIST] Socket disconnected");
      console.log("❌ [SocketService] Socket disconnected");

      // Auto-reconnection on disconnect
      if (this.userId) {
        console.log("🔄 [CHECKLIST] Auto-reconnecting on disconnect...");
        setTimeout(() => {
          this.connect(token, this.userId!);
        }, 1000);
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("❌ [CHECKLIST] Socket connection error:", error);
      console.error("❌ [SocketService] Socket connection error:", error);

      // Auto-reconnection logic
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        console.log("🔄 [CHECKLIST] Attempting auto-reconnection...");
        setTimeout(() => {
          this.connect(token, this.userId!);
        }, 2000);
      } else {
        console.error("❌ [CHECKLIST] Max reconnection attempts reached");
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Backend Events - Match exactly with backend
    this.socket.on("new_message", (data: any) => {
      console.log("✅ [CHECKLIST] Nhận được 'new_message' event");
      console.log("📨 [SocketService] Received 'new_message' event:", data);

      // Convert backend data format to MessageWithUI
      const message: MessageWithUI = {
        _id: data.message._id || data.messageId,
        conversation_id: data.message.conversation_id || data.conversationId,
        property_id: data.message.property_id || data.propertyId || "",
        guest_id: data.message.guest_id || data.guestId || "",
        content: data.content,
        sender_id: data.senderId,
        sent_at: data.sent_at || data.timestamp,
        is_read: data.is_read || data.isRead,
        reactions: data.message.reactions || [],
        ui_for: "guest", // Will be set by useMessages
        ui: {
          mine: false,
          show_sender_meta: true,
          sender_display_name: data.senderName || "Unknown",
          sender_avatar_url: data.senderAvatar || null,
        },
      };

      this.notifyMessageListeners(message);
    });

    this.socket.on("conversation_updated", (data: any) => {
      console.log("✅ [CHECKLIST] Nhận được 'conversation_updated' event");
      console.log(
        "💬 [SocketService] Received 'conversation_updated' event:",
        data
      );

      // Convert to ConversationUpdateV2 format
      const conversationUpdate: ConversationUpdateV2 = {
        conversationId: data.conversationId,
        lastMessage: data.lastMessage || "",
        lastMessageAt: data.lastMessageAt || new Date().toISOString(),
        unreadCount: data.unreadCount || 0,
      };

      this.notifyConversationUpdateListeners(conversationUpdate);
    });

    this.socket.on("reaction_update", (data: any) => {
      console.log("✅ [CHECKLIST] Nhận được 'reaction_update' event");
      console.log("😀 [SocketService] Received 'reaction_update' event:", data);

      // Convert to MessageWithUI format
      const message: MessageWithUI = {
        _id: data.messageId,
        conversation_id: data.conversationId,
        property_id: data.propertyId || "",
        guest_id: data.guestId || "",
        content: data.content || "",
        sender_id: data.senderId || "",
        sent_at: data.timestamp,
        is_read: data.isRead || false,
        reactions: data.reactions || [],
        ui_for: "guest", // Will be set by useMessages
        ui: {
          mine: false,
          show_sender_meta: true,
          sender_display_name: "Unknown",
          sender_avatar_url: null,
        },
      };

      this.notifyReactionUpdateListeners(message);
    });

    // User status events
    this.socket.on("user_online", (data: any) => {
      console.log("✅ [CHECKLIST] User online:", data.userId);
    });

    this.socket.on("user_offline", (data: any) => {
      console.log("✅ [CHECKLIST] User offline:", data.userId);
    });

    // Debug: Listen to all events
    this.socket.onAny((eventName: string, ...args: any[]) => {
      console.log(
        "🔍 [SocketService] Received event:",
        eventName,
        "with args:",
        args
      );

      // Handle any message-like events that might have been missed
      if (eventName.toLowerCase().includes("message") && args[0]) {
        const message = args[0];
        if (message._id && message.conversation_id) {
          console.log(
            "📨 [SocketService] Detected message event via onAny:",
            eventName
          );
          this.notifyMessageListeners(message);
        }
      }

      // Handle any reaction-like events
      if (eventName.toLowerCase().includes("reaction") && args[0]) {
        const message = args[0];
        if (message._id && message.conversation_id) {
          console.log(
            "😀 [SocketService] Detected reaction event via onAny:",
            eventName
          );
          this.notifyReactionUpdateListeners(message);
        }
      }

      // Handle any conversation-like events
      if (eventName.toLowerCase().includes("conversation") && args[0]) {
        console.log(
          "💬 [SocketService] Detected conversation event via onAny:",
          eventName
        );
        const data = args[0];
        if (data.conversationId) {
          const conversationUpdate: ConversationUpdateV2 = {
            conversationId: data.conversationId,
            lastMessage: data.lastMessage || "",
            lastMessageAt: data.lastMessageAt || new Date().toISOString(),
            unreadCount: data.unreadCount || 0,
          };
          this.notifyConversationUpdateListeners(conversationUpdate);
        }
      }
    });

    // Test event listener to verify socket is working
    this.socket.on("test_response", (data) => {
      console.log("🧪 [SocketService] Received test response:", data);
    });

    // Connection confirmation event
    this.socket.on("connection_confirmed", (data) => {
      console.log("✅ [CHECKLIST] Nhận được connection_confirmed event:", data);
    });

    // Ping/pong test
    this.socket.on("pong", (data) => {
      console.log("🏓 [SocketService] Received pong:", data);
    });

    // Listen for any event to debug
    this.socket.onAny((eventName: string, ...args: any[]) => {
      console.log("🔍 [SocketService] ANY EVENT:", eventName, args);
    });

    // Legacy notification events (keep old behavior)
    this.socket.on("notification", (notification: NotificationData) => {
      this.notificationHandlers.forEach((handler) => handler(notification));
    });
  }

  // Legacy notification methods (keep exactly as before)
  connectNotification(token: string, userId: string) {
    if (
      this.notificationSocket?.connected &&
      this.notificationUserId === userId
    ) {
      return;
    }
    if (this.notificationSocket && this.notificationUserId !== userId) {
      this.disconnectNotification();
    }
    this.notificationUserId = userId;
    this.notificationSocket = io(`${WS_URL}/ws/notifications`, {
      auth: { token },
      transports: ["websocket"],
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });
    this.notificationSocket.on("connect", () => {
      this.notificationSocket?.emit("join_notifications", { userId });
    });
    this.notificationSocket.on(
      "new_notification",
      (notification: NotificationData) => {
        this.notificationHandlersV2.forEach((handler) => handler(notification));
      }
    );
    this.notificationSocket.on("unread_count_updated", () => {
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
      this.notificationHandlers = this.notificationHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  onNewNotificationV2(handler: (notification: NotificationData) => void) {
    this.notificationHandlersV2.push(handler);
    return () => {
      this.notificationHandlersV2 = this.notificationHandlersV2.filter(
        (h) => h !== handler
      );
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
    console.log("🔄 Force reconnecting socket...");
    this.disconnect();
    setTimeout(() => {
      this.connect(token, userId);
    }, 1000);
  }

  // Note: Room joining is handled automatically by server based on auth token
  // No need to manually join rooms

  // Test function to emit a test message
  emitTestMessage(conversationId: string) {
    if (this.socket?.connected) {
      console.log("🧪 [CHECKLIST] Running socket test...");
      console.log(
        "🧪 [SocketService] Emitting test message to conversation:",
        conversationId
      );

      // Test connection confirmation
      this.socket.emit("connection_confirmed", {
        userId: this.userId,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      // Test message
      this.socket.emit("test_message", {
        conversationId,
        message: "Test message from frontend",
        timestamp: new Date().toISOString(),
      });

      // Also emit to backend test endpoint
      this.socket.emit("test_socket", {
        conversationId,
        userId: this.userId,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      // Test ping to check if socket is responsive
      this.socket.emit("ping", {
        userId: this.userId,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ [CHECKLIST] Test events emitted successfully");
    } else {
      console.warn("⚠️ Socket not connected, cannot emit test message");
    }
  }

  // Get socket connection status
  getConnectionStatus() {
    const status = {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id,
      userId: this.userId,
      connectionAttempts: this.connectionAttempts,
    };

    console.log("🔍 [CHECKLIST] Socket status:", status);
    return status;
  }

  // Event handlers registration
  onNewMessage(handler: (message: MessageWithUI) => void) {
    console.log(
      "📝 [SocketService] Registering new message handler, total handlers:",
      this.messageHandlers.length + 1
    );
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
        console.log(
          "🗑️ [SocketService] Removed message handler, remaining:",
          this.messageHandlers.length
        );
      }
    };
  }

  onReactionUpdate(handler: (message: MessageWithUI) => void) {
    console.log(
      "📝 [SocketService] Registering reaction update handler, total handlers:",
      this.reactionUpdateHandlers.length + 1
    );
    this.reactionUpdateHandlers.push(handler);
    return () => {
      const index = this.reactionUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.reactionUpdateHandlers.splice(index, 1);
      }
    };
  }

  onConversationUpdate(handler: (data: ConversationUpdateV2) => void) {
    console.log(
      "📝 [SocketService] Registering conversation update handler, total handlers:",
      this.conversationUpdateHandlers.length + 1
    );
    this.conversationUpdateHandlers.push(handler);
    return () => {
      const index = this.conversationUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.conversationUpdateHandlers.splice(index, 1);
      }
    };
  }

  onMessageRecall(handler: (message: MessageWithUI) => void) {
    console.log(
      "📝 [SocketService] Registering message recall handler, total handlers:",
      this.messageRecallHandlers.length + 1
    );
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
    console.log(
      "📢 [SocketService] Notifying",
      this.messageHandlers.length,
      "message handlers for message:",
      message._id
    );
    this.messageHandlers.forEach((handler, index) => {
      try {
        console.log("📢 [SocketService] Calling message handler", index + 1);
        handler(message);
      } catch (error) {
        console.error("❌ [SocketService] Error in message handler:", error);
      }
    });
  }

  private notifyReactionUpdateListeners(message: MessageWithUI) {
    console.log(
      "📢 [SocketService] Notifying",
      this.reactionUpdateHandlers.length,
      "reaction update handlers for message:",
      message._id
    );
    this.reactionUpdateHandlers.forEach((handler, index) => {
      try {
        console.log(
          "📢 [SocketService] Calling reaction update handler",
          index + 1
        );
        handler(message);
      } catch (error) {
        console.error(
          "❌ [SocketService] Error in reaction update handler:",
          error
        );
      }
    });
  }

  private notifyConversationUpdateListeners(data: ConversationUpdateV2) {
    this.conversationUpdateHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error("❌ Error in conversation update handler:", error);
      }
    });
  }

  private notifyMessageRecallListeners(message: MessageWithUI) {
    this.messageRecallHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error("❌ Error in message recall handler:", error);
      }
    });
  }
}

const socketService = new SocketService();

export default socketService;
