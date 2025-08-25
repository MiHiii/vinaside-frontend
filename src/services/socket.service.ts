import { io, Socket } from "socket.io-client";
import { MessageWithUI, ConversationUpdateV2 } from "@/types/message";
import { processMessageUI } from "@/helper/message.helper";

// Base WebSocket URL - Backend đang chạy trên http://localhost:8080
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
  private conversationListUpdateHandlers: ((data: any) => void)[] = [];
  private messageRecallHandlers: ((message: MessageWithUI) => void)[] = [];
  private notificationHandlers: ((notification: NotificationData) => void)[] =
    [];
  private notificationHandlersV2: ((notification: NotificationData) => void)[] =
    [];
  public notificationSocket: Socket | null = null;
  private notificationUserId: string | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;
  private processedMessages: Set<string> = new Set();
  private messageCache: Map<string, MessageWithUI[]> = new Map(); // Cache messages by conversation
  private conversationCache: Map<string, any> = new Map(); // Cache conversations
  private isInitialized: boolean = false;

  connect(token: string, userId: string, userRole: string = "guest") {
    // Prevent multiple connections for the same user
    if (
      this.socket?.connected &&
      this.userId === userId &&
      this.userRole === userRole &&
      this.isInitialized
    ) {
      console.log(
        "🔄 [SocketService] Already connected and initialized for user:",
        userId
      );
      return;
    }

    // Disconnect if connecting for different user or role
    if (this.socket && (this.userId !== userId || this.userRole !== userRole)) {
      this.disconnect();
    }

    // Clear existing handlers to prevent duplicates
    this.messageHandlers = [];
    this.reactionUpdateHandlers = [];
    this.conversationUpdateHandlers = [];
    this.messageRecallHandlers = [];

    this.userId = userId;
    this.userRole = userRole;
    this.connectionAttempts++;

    this.socket = io(`${WS_URL}/ws/messages`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    // Setup event listeners only once
    this.setupEventListeners();

    this.socket.on("connect", () => {
      this.connectionAttempts = 0;
      this.isInitialized = true;

      // Emit connection confirmation
      if (this.socket?.id) {
        this.socket.emit("connection_confirmed", {
          userId: this.userId,
          userRole: this.userRole,
          socketId: this.socket.id,
          timestamp: new Date().toISOString(),
        });

        // Join admin_broadcast room if user is admin or staff
        if (this.userRole === "admin" || this.userRole === "staff") {
          console.log(
            "👑 [SocketService] Admin/Staff joining admin_broadcast room for:",
            this.userRole
          );

          // Join all admin rooms
          this.socket.emit("admin_join_all_rooms", {
            userId: this.userId,
            userRole: this.userRole,
            socketId: this.socket.id,
            timestamp: new Date().toISOString(),
          });

          // Join specific admin room
          this.socket.emit("join_admin_room", {
            userId: this.userId,
            userRole: this.userRole,
            socketId: this.socket.id,
            timestamp: new Date().toISOString(),
          });

          console.log(
            "✅ [CHECKLIST] Admin/Staff joined admin_broadcast and admin_room"
          );
        } else {
          // Guest chỉ join room riêng
          console.log("🔍 [SocketService] Guest joining regular room");
          this.socket.emit("join_room", {
            userId: this.userId,
            userRole: this.userRole,
            socketId: this.socket.id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    this.socket.on("disconnect", () => {
      this.isInitialized = false;
      // Auto-reconnection on disconnect
      if (this.userId) {
        setTimeout(() => {
          this.connect(token, this.userId!, this.userRole!);
        }, 1000);
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("❌ [SocketService] Socket connection error:", error);
      this.isInitialized = false;

      // Auto-reconnection logic
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        console.log("🔄 [SocketService] Attempting auto-reconnection...");
        setTimeout(() => {
          this.connect(token, this.userId!, this.userRole!);
        }, 2000);
      } else {
        console.error("❌ [SocketService] Max reconnection attempts reached");
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Unified message handler for all message events
    const handleMessageEvent = (eventName: string, data: any) => {
      console.log(`✅ [SocketService] Received '${eventName}' event:`, data);

      // Convert backend data format to MessageWithUI
      const rawMessage = {
        _id: data.message?._id || data.messageId || data._id,
        conversation_id:
          data.message?.conversation_id ||
          data.conversationId ||
          data.conversation_id,
        property_id:
          data.message?.property_id ||
          data.propertyId ||
          data.property_id ||
          "",
        guest_id: data.message?.guest_id || data.guestId || data.guest_id || "",
        content: data.content || data.message?.content,
        sender_id: data.senderId || data.message?.sender_id || data.sender_id,
        sent_at: data.sent_at || data.timestamp || data.message?.sent_at,
        is_read: data.is_read || data.isRead || data.message?.is_read || "sent",
        reactions: data.message?.reactions || data.reactions || [],
        reply_to: data.message?.reply_to || data.reply_to,
        is_recalled: data.message?.is_recalled || data.is_recalled || false,
        ui_for: (this.userRole || "guest") as "guest" | "staff" | "admin",
        ui: {
          mine: false,
          show_sender_meta: true,
          sender_display_name:
            data.senderName || data.sender_display_name || "Unknown",
          sender_avatar_url:
            data.senderAvatar || data.sender_avatar_url || null,
        },
      };

      // Process message using helper function
      const message = processMessageUI(rawMessage, this.userId || "");

      // Prevent duplicate notifications
      const messageKey = `${message._id}-${message.sent_at}`;
      if (this.processedMessages.has(messageKey)) {
        console.log(
          "⚠️ [SocketService] Duplicate message detected, skipping:",
          messageKey
        );
        return;
      }

      this.processedMessages.add(messageKey);
      // Clean up old message keys after 5 seconds
      setTimeout(() => {
        this.processedMessages.delete(messageKey);
      }, 5000);

      // Update message cache
      this.updateMessageCache(message);

      this.notifyMessageListeners(message);
    };

    // Listen for all message events
    const messageEvents = [
      "new_message",
      "admin_new_message",
      "staff_new_message",
      "admin_broadcast_new_message",
      "guest_new_message",
    ];

    messageEvents.forEach((eventName) => {
      this.socket!.on(eventName, (data: any) => {
        handleMessageEvent(eventName, data);
      });
    });

    // Unified conversation update handler
    const handleConversationUpdate = (eventName: string, data: any) => {
      console.log(`✅ [SocketService] Received '${eventName}' event:`, data);

      const conversationUpdate: ConversationUpdateV2 = {
        conversationId: data.conversationId || data.conversation_id,
        lastMessage: data.lastMessage || null,
        lastMessageAt:
          data.lastMessageAt ||
          data.last_message_at ||
          new Date().toISOString(),
        unreadCount: data.unreadCount || data.unread_count || 0,
        isAdminUpdate: eventName.toLowerCase().includes("admin"),
      };

      // Update conversation cache
      this.updateConversationCache(conversationUpdate);

      this.notifyConversationUpdateListeners(conversationUpdate);
    };

    // Listen for all conversation update events
    const conversationEvents = [
      "conversation_update_v2",
      "conversation_updated",
      "admin_conversation_update",
      "staff_conversation_update",
      "admin_broadcast_conversation_update",
      "conversation_list_update",
    ];

    conversationEvents.forEach((eventName) => {
      this.socket!.on(eventName, (data: any) => {
        handleConversationUpdate(eventName, data);
      });
    });

    // Reaction update handler
    this.socket.on("reaction_update", (data: any) => {
      console.log("✅ [SocketService] Received 'reaction_update' event:", data);

      const message: MessageWithUI = {
        _id: data.messageId || data._id,
        conversation_id: data.conversationId || data.conversation_id,
        property_id: data.propertyId || data.property_id || "",
        guest_id: data.guestId || data.guest_id || "",
        content: data.content || "",
        sender_id: data.senderId || data.sender_id || "",
        sent_at: data.timestamp || data.sent_at,
        is_read: data.isRead || data.is_read || false,
        reactions: data.reactions || [],
        ui_for: (this.userRole || "guest") as "guest" | "staff" | "admin",
        ui: {
          mine: false,
          show_sender_meta: true,
          sender_display_name: "Unknown",
          sender_avatar_url: null,
        },
      };

      // Update message cache
      this.updateMessageCache(message);

      this.notifyReactionUpdateListeners(message);
    });

    // Message recall handler
    this.socket.on("message_recalled", (data: any) => {
      console.log(
        "✅ [SocketService] Received 'message_recalled' event:",
        data
      );

      const message: MessageWithUI = {
        _id: data.messageId || data._id,
        conversation_id: data.conversationId || data.conversation_id,
        property_id: data.propertyId || data.property_id || "",
        guest_id: data.guestId || data.guest_id || "",
        content: data.content || "[Tin nhắn đã được thu hồi]",
        sender_id: data.senderId || data.sender_id || "",
        sent_at: data.timestamp || data.sent_at,
        is_read: data.isRead || data.is_read || false,
        reactions: data.reactions || [],
        is_recalled: true,
        ui_for: (this.userRole || "guest") as "guest" | "staff" | "admin",
        ui: {
          mine: false,
          show_sender_meta: true,
          sender_display_name: "Unknown",
          sender_avatar_url: null,
        },
      };

      // Update message cache
      this.updateMessageCache(message);

      this.notifyMessageRecallListeners(message);
    });

    // User status events
    this.socket.on("user_online", (data: any) => {
      console.log("✅ [SocketService] User online:", data.userId);
    });

    this.socket.on("user_offline", (data: any) => {
      console.log("✅ [SocketService] User offline:", data.userId);
    });

    // Room join confirmations
    this.socket.on("admin_room_joined", (data: any) => {
      console.log("👑 [SocketService] Successfully joined admin room:", data);
    });

    this.socket.on("admin_broadcast_room_joined", (data: any) => {
      console.log(
        "📡 [SocketService] Successfully joined admin_broadcast room:",
        data
      );
    });

    this.socket.on("admin_broadcast_joined", (data: any) => {
      console.log("📡 [SocketService] Admin broadcast joined confirmed:", data);
    });

    this.socket.on("admin_online", (data: any) => {
      console.log("🔍 [SocketService] Admin online event:", data);
    });

    this.socket.on("connection_confirmed", (data: any) => {
      console.log("🔍 [SocketService] Connection confirmed:", data);
    });

    this.socket.on("admin_joined_all_rooms", (data: any) => {
      console.log(
        "👑 [SocketService] Admin successfully joined all rooms:",
        data
      );
    });

    // Test event listener
    this.socket.on("test_response", (data) => {
      console.log("🧪 [SocketService] Received test response:", data);
    });

    this.socket.on("pong", (data) => {
      console.log("🏓 [SocketService] Received pong:", data);
    });

    // Legacy notification events
    this.socket.on("notification", (notification: NotificationData) => {
      this.notificationHandlers.forEach((handler) => handler(notification));
    });

    // Debug: Listen to all events
    this.socket.onAny((eventName: string, ...args: any[]) => {
      console.log("🔍 [SocketService] ANY EVENT:", eventName, args);
    });
  }

  // Cache management methods
  private updateMessageCache(message: MessageWithUI) {
    const conversationId = message.conversation_id;
    if (!this.messageCache.has(conversationId)) {
      this.messageCache.set(conversationId, []);
    }

    const messages = this.messageCache.get(conversationId)!;
    const existingIndex = messages.findIndex((m) => m._id === message._id);

    if (existingIndex >= 0) {
      messages[existingIndex] = message;
    } else {
      messages.push(message);
      // Sort by sent_at
      messages.sort(
        (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
      );
    }
  }

  private updateConversationCache(update: ConversationUpdateV2) {
    this.conversationCache.set(update.conversationId, {
      ...this.conversationCache.get(update.conversationId),
      ...update,
      lastUpdated: new Date().toISOString(),
    });
  }

  // Public cache access methods
  getCachedMessages(conversationId: string): MessageWithUI[] {
    return this.messageCache.get(conversationId) || [];
  }

  getCachedConversation(conversationId: string): any {
    return this.conversationCache.get(conversationId);
  }

  clearCache() {
    this.messageCache.clear();
    this.conversationCache.clear();
    this.processedMessages.clear();
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
    this.userRole = null;
    this.connectionAttempts = 0;
    this.isInitialized = false;
    this.clearCache();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketStatus() {
    return {
      connected: this.socket?.connected || false,
      userId: this.userId,
      userRole: this.userRole,
      connectionAttempts: this.connectionAttempts,
      isInitialized: this.isInitialized,
    };
  }

  forceReconnect(token: string, userId: string, userRole: string = "guest") {
    console.log("🔄 Force reconnecting socket...");
    this.disconnect();
    setTimeout(() => {
      this.connect(token, userId, userRole);
    }, 1000);
  }

  // Test function to verify connection
  testConnection() {
    console.log("🧪 [SocketService] Testing connection...");
    console.log("🧪 [SocketService] Connection status:", {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      url: `${WS_URL}/ws/messages`,
      path: "/socket.io",
      userRole: this.userRole,
      userId: this.userId,
      isInitialized: this.isInitialized,
    });

    if (this.socket?.connected) {
      console.log("✅ [SocketService] Socket is connected!");
      return true;
    } else {
      console.log("❌ [SocketService] Socket is not connected!");
      return false;
    }
  }

  // Test function to emit a test message
  emitTestMessage(conversationId: string) {
    if (this.socket?.connected) {
      console.log(
        "🧪 [SocketService] Emitting test message to conversation:",
        conversationId
      );

      // Test connection confirmation
      this.socket.emit("connection_confirmed", {
        userId: this.userId,
        userRole: this.userRole,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      // Test message
      this.socket.emit("test_message", {
        conversationId,
        message: "Test message from frontend",
        timestamp: new Date().toISOString(),
      });

      // Test ping
      this.socket.emit("ping", {
        userId: this.userId,
        userRole: this.userRole,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      // Test admin room join
      if (conversationId === "admin_broadcast_join") {
        this.socket.emit("admin_join_all_rooms", {
          userId: this.userId,
          userRole: this.userRole,
          socketId: this.socket.id,
          timestamp: new Date().toISOString(),
        });

        this.socket.emit("join_admin_room", {
          userId: this.userId,
          userRole: this.userRole,
          socketId: this.socket.id,
          timestamp: new Date().toISOString(),
        });

        console.log(
          "👑 [SocketService] Emitted admin_join_all_rooms and join_admin_room for:",
          this.userRole
        );
      }

      console.log("✅ [SocketService] Test events emitted successfully");
    } else {
      console.warn("⚠️ Socket not connected, cannot emit test message");
    }
  }

  // Force join admin_broadcast room for admin/staff
  joinAdminBroadcastRoom() {
    if (
      this.socket?.connected &&
      (this.userRole === "admin" || this.userRole === "staff")
    ) {
      console.log(
        "📡 [SocketService] Force joining admin_broadcast room for:",
        this.userRole
      );

      this.socket.emit("join_admin_broadcast", {
        userId: this.userId,
        userRole: this.userRole,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      this.socket.emit("admin_join_all_rooms", {
        userId: this.userId,
        userRole: this.userRole,
        socketId: this.socket.id,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ [SocketService] Admin broadcast room join requests sent");
    } else {
      console.warn(
        "⚠️ [SocketService] Cannot join admin_broadcast room - not connected or not admin/staff"
      );
    }
  }

  // Get socket connection status
  getConnectionStatus() {
    const status = {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id,
      userId: this.userId,
      userRole: this.userRole,
      connectionAttempts: this.connectionAttempts,
      isInitialized: this.isInitialized,
    };

    console.log("🔍 [SocketService] Socket status:", status);
    return status;
  }

  // Debug function to check all registered event listeners
  debugEventListeners() {
    console.log("🔍 [SocketService] Debug Event Listeners:");
    console.log("📨 Message handlers:", this.messageHandlers.length);
    console.log(
      "💬 Conversation update handlers:",
      this.conversationUpdateHandlers.length
    );
    console.log(
      "😀 Reaction update handlers:",
      this.reactionUpdateHandlers.length
    );
    console.log(
      "🗑️ Message recall handlers:",
      this.messageRecallHandlers.length
    );
    console.log("🔔 Notification handlers:", this.notificationHandlers.length);
    console.log(
      "🔔 Notification V2 handlers:",
      this.notificationHandlersV2.length
    );
    console.log("💾 Cached conversations:", this.conversationCache.size);
    console.log("💾 Cached message conversations:", this.messageCache.size);
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

  onConversationUpdateV2(handler: (data: ConversationUpdateV2) => void) {
    console.log(
      "📝 [SocketService] Registering conversation update v2 handler"
    );
    if (this.socket) {
      this.socket.on("conversation_update_v2", handler);
    }
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

  onConversationListUpdate(handler: (data: ConversationUpdateV2) => void) {
    console.log(
      "📝 [SocketService] Registering conversation list update handler, total handlers:",
      this.conversationListUpdateHandlers.length + 1
    );
    this.conversationListUpdateHandlers.push(handler);
    return () => {
      const index = this.conversationListUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.conversationListUpdateHandlers.splice(index, 1);
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

  private notifyConversationListUpdateListeners(data: ConversationUpdateV2) {
    console.log(
      "📢 [SocketService] Notifying",
      this.conversationListUpdateHandlers.length,
      "conversation list update handlers"
    );
    this.conversationListUpdateHandlers.forEach((handler, index) => {
      try {
        console.log(
          "📢 [SocketService] Calling conversation list update handler",
          index + 1
        );
        handler(data);
      } catch (error) {
        console.error(
          "❌ [SocketService] Error in conversation list update handler:",
          error
        );
      }
    });
  }
}

const socketService = new SocketService();

export default socketService;
