import { io, Socket } from "socket.io-client";

const WS_URL = "http://localhost:8080";

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
  reply_to?: {
    message_id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    sent_at?: string;
  };
}

interface NormalizedMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
    senderId: string;
  };
}

interface SocketError extends Error {
  description?: string;
  context?: unknown;
  type?: string;
}

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
  private messageHandlers: ((message: NormalizedMessage) => void)[] = [];
  private readHandlers: ((data: { messageId: string }) => void)[] = [];
  private userOnlineHandlers: ((userId: string) => void)[] = [];
  private userOfflineHandlers: ((userId: string) => void)[] = [];
  private messageRecallHandlers: ((data: {
    messageId: string;
    content: string;
    is_recalled: boolean;
    recalled_at: string;
  }) => void)[] = [];
  private notificationHandlers: ((notification: NotificationData) => void)[] =
    [];
  private userId: string | null = null;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;
  public notificationSocket: Socket | null = null;
  private notificationUserId: string | null = null;
  private notificationHandlersV2: ((notification: NotificationData) => void)[] =
    [];

  connect(token: string, userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;
    this.connectionAttempts++;

    this.socket = io(`${WS_URL}/ws/messages`, {
      auth: { token },
      transports: ["websocket"],
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      this.connectionAttempts = 0;
      this.joinRoom(userId);
    });

    this.socket.on("disconnect", () => {
      // Disconnected
    });

    this.socket.on("connect_error", (error: SocketError) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket.on("new_message", (message: MessageData) => {
      try {
        let senderId = "";
        let receiverId = "";

        if (typeof message.sender_id === "object" && message.sender_id?._id) {
          senderId = message.sender_id._id;
        } else if (typeof message.sender_id === "string") {
          senderId = message.sender_id;
        } else if (message.senderId) {
          senderId = message.senderId;
        }

        if (
          typeof message.receiver_id === "object" &&
          message.receiver_id?._id
        ) {
          receiverId = message.receiver_id._id;
        } else if (typeof message.receiver_id === "string") {
          receiverId = message.receiver_id;
        } else if (message.receiverId) {
          receiverId = message.receiverId;
        }

        // Process reply data if present
        let replyToData = undefined;
        if (message.reply_to) {
          replyToData = {
            messageId: message.reply_to.message_id,
            content: message.reply_to.content,
            senderName: message.reply_to.sender_name || "Người dùng",
            senderId: message.reply_to.sender_id,
          };
        }

        const normalizedMessage: NormalizedMessage = {
          id: message._id || message.id || `temp_${Date.now()}`,
          content: message.content || "",
          senderId,
          receiverId,
          conversationId:
            message.conversation_id || message.conversationId || "",
          createdAt:
            message.sent_at || message.createdAt || new Date().toISOString(),
          isRead: message.is_read === "read" || message.is_read === true,
          replyTo: replyToData,
        };

        const isRelevantMessage =
          normalizedMessage.senderId === this.userId ||
          normalizedMessage.receiverId === this.userId;

        if (isRelevantMessage) {
          this.messageHandlers.forEach((handler, index) => {
            try {
              handler(normalizedMessage);
            } catch (error) {
              console.error(`Error in message handler ${index}:`, error);
            }
          });
        }
      } catch (error) {
        console.error("Error processing new message:", error);
      }
    });

    this.socket.on("message_read", (data) => {
      this.readHandlers.forEach((handler) => handler(data));
    });

    this.socket.on("message_recalled", (data) => {
      this.messageRecallHandlers.forEach((handler) => handler(data));
    });

    this.socket.on(
      "user_online",
      ({ userId: onlineUserId }: { userId: string }) => {
        this.userOnlineHandlers.forEach((handler) => handler(onlineUserId));
      }
    );

    this.socket.on(
      "user_offline",
      ({ userId: offlineUserId }: { userId: string }) => {
        this.userOfflineHandlers.forEach((handler) => handler(offlineUserId));
      }
    );

    this.socket.on("reconnect", () => {
      // Reconnected successfully
    });

    this.socket.on("reconnect_attempt", () => {
      // Attempting to reconnect
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed after all attempts");
    });

    this.socket.onAny(() => {
      // Event received
    });

    this.socket.on("user_joined_room", () => {
      // User joined room
    });

    this.socket.on("connect_timeout", () => {
      console.error("Socket connection timeout");
    });

    this.socket.on("notification", (notification: NotificationData) => {
      this.notificationHandlers.forEach((handler) => handler(notification));
    });
  }

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
    // (Tùy chọn) Lắng nghe các event khác như unread_count_updated
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.connectionAttempts = 0;
    }
  }

  sendMessage(message: {
    content: string;
    receiverId: string;
    replyToMessageId?: string;
  }) {
    if (!this.socket?.connected) {
      console.error("Socket not connected - cannot send message");
      return;
    }

    const messageData = {
      sender_id: this.userId,
      receiver_id: message.receiverId,
      content: message.content,
      ...(message.replyToMessageId && {
        reply_to_message_id: message.replyToMessageId,
      }),
    };

    this.socket.emit("send_message", messageData);
  }

  onNewMessage(handler: (message: NormalizedMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
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
    this.userOnlineHandlers.push(callback);
    return () => {
      this.userOnlineHandlers = this.userOnlineHandlers.filter(
        (h) => h !== callback
      );
    };
  }

  public onUserOffline(callback: (userId: string) => void) {
    this.userOfflineHandlers.push(callback);
    return () => {
      this.userOfflineHandlers = this.userOfflineHandlers.filter(
        (h) => h !== callback
      );
    };
  }

  public markMessageAsRead(messageId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("mark_message_read", { messageId });
    }
  }

  public joinRoom(userId: string) {
    if (this.socket && userId) {
      this.socket.once("room_joined", () => {
        // Successfully joined room
      });
      this.socket.once("room_join_error", (error) => {
        console.error("Room join error:", error);
      });
      this.socket.emit("join_room", { userId });
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  onReactionUpdate(
    callback: (data: { messageId: string; reactions: unknown[] }) => void
  ): () => void {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on("reaction_update", (data) => {
      callback(data);
    });

    return () => {
      if (this.socket) {
        this.socket.off("reaction_update");
      }
    };
  }

  onMessageRecall(
    callback: (data: {
      messageId: string;
      content: string;
      is_recalled: boolean;
      recalled_at: string;
    }) => void
  ): () => void {
    this.messageRecallHandlers.push(callback);
    return () => {
      this.messageRecallHandlers = this.messageRecallHandlers.filter(
        (h) => h !== callback
      );
    };
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

  public getSocketStatus() {
    return {
      connected: this.socket?.connected || false,
      socketId: this.socket?.id || null,
      userId: this.userId,
      handlerCount: this.messageHandlers.length,
      connectionAttempts: this.connectionAttempts,
      transport: this.socket?.io?.engine?.transport?.name || "unknown",
    };
  }

  public forceReconnect(token: string, userId: string) {
    this.disconnect();
    setTimeout(() => {
      this.connect(token, userId);
    }, 1000);
  }
}

const socketService = new SocketService();

// Expose debug methods globally for testing
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).socketDebug = {
    getStatus: () => socketService.getSocketStatus(),
    forceReconnect: (token: string, userId: string) =>
      socketService.forceReconnect(token, userId),
    isConnected: () => socketService.isConnected(),
  };
}

export default socketService;
