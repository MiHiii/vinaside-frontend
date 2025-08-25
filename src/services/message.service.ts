import { api } from "@/services/api";
import socketService from "./socket.service";
import { processMessagesList } from "@/helper/message.helper";
import {
  MessageWithUI,
  ConversationUI,
  CreateMessageDto,
  MessageResponse,
  ReactionType,
  ToggleReactionResponse,
  UpdateMessageDto,
  AddReactionDto,
} from "@/types/message";

class MessageService {
  private messageCache: Map<string, MessageWithUI[]> = new Map();
  private conversationCache: Map<string, ConversationUI[]> = new Map();
  private lastFetchTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  // Debug helper to check auth status
  private checkAuthStatus() {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    const userObj = user ? JSON.parse(user) : null;
    console.log("🔐 Auth Status:", {
      hasToken: !!token,
      tokenLength: token?.length,
      hasUser: !!user,
      userRole: this.getUserRole(),
      userId: userObj?._id,
    });
    return { token, user, userObj };
  }

  // Check if cache is still valid
  private isCacheValid(key: string): boolean {
    const lastFetch = this.lastFetchTime.get(key);
    if (!lastFetch) return false;
    return Date.now() - lastFetch < this.CACHE_DURATION;
  }

  // Get conversations list (UI-optimized) with cache
  async getConversations(
    ui_for: "guest" | "staff" | "admin" = "guest"
  ): Promise<ConversationUI[]> {
    try {
      this.checkAuthStatus();
      console.log("📥 Fetching conversations for:", ui_for);

      // Check cache first
      const cacheKey = `conversations_${ui_for}`;
      if (this.isCacheValid(cacheKey)) {
        const cached = this.conversationCache.get(cacheKey);
        if (cached && (cached as ConversationUI[]).length > 0) {
          console.log(
            "📥 [message.service] Using cached conversations:",
            (cached as ConversationUI[]).length
          );
          return cached as ConversationUI[];
        }
      }

      // Ensure we have a valid token
      const { token } = this.checkAuthStatus();
      if (!token) {
        console.error("❌ No token available for API call");
        throw new Error("Authentication required");
      }

      const apiUrl = `/messages/conversations?ui_for=${ui_for}`;
      console.log("🌐 [message.service] Making API call to:", apiUrl);

      const response = await api.get<{
        success: boolean;
        data: ConversationUI[];
      }>(apiUrl);

      console.log("📥 API Response:", response.data);
      console.log("📥 Response status:", response.status);

      let conversations: ConversationUI[] = [];

      // Handle the response format from your example: { success: true, data: [...] }
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        "success" in response.data
      ) {
        const wrappedData = response.data as {
          success: boolean;
          data: ConversationUI[];
        };
        if (wrappedData.success && Array.isArray(wrappedData.data)) {
          console.log(
            "✅ Wrapped response, returning",
            wrappedData.data.length,
            "conversations"
          );
          conversations = wrappedData.data;
        }
      } else if (Array.isArray(response.data)) {
        conversations = response.data;
      } else {
        console.warn("⚠️ Unexpected response format, returning empty array");
        return [];
      }

      // Update cache
      this.conversationCache.set(cacheKey, conversations);
      this.lastFetchTime.set(cacheKey, Date.now());

      return conversations;
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      throw error;
    }
  }

  // Get messages in a conversation with cache and WebSocket integration
  async getConversationMessages(
    conversationId: string,
    limit?: number,
    page?: number,
    ui_for: "guest" | "staff" | "admin" = "guest"
  ): Promise<MessageWithUI[]> {
    try {
      this.checkAuthStatus();
      console.log(
        "📨 Fetching messages for conversation:",
        conversationId,
        "ui_for:",
        ui_for
      );

      // Check cache first
      const cacheKey = `messages_${conversationId}_${ui_for}`;
      if (this.isCacheValid(cacheKey)) {
        const cached = this.messageCache.get(cacheKey);
        if (cached && (cached as MessageWithUI[]).length > 0) {
          console.log(
            "📨 [message.service] Using cached messages:",
            (cached as MessageWithUI[]).length
          );
          return cached as MessageWithUI[];
        }
      }

      // Get current user ID for admin/staff API calls
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id;

      const params = new URLSearchParams({
        conversationId,
        ui_for,
      });

      if (limit) params.append("limit", limit.toString());
      if (page) params.append("page", page.toString());

      console.log("🔍 [message.service] API Parameters:", {
        conversationId,
        ui_for,
        limit,
        page,
        userId: ui_for === "admin" || ui_for === "staff" ? userId : "N/A",
      });

      // Use different endpoint for admin/staff vs guest
      let apiUrl: string;
      if (ui_for === "admin" || ui_for === "staff") {
        console.log(
          "🧪 [message.service] Trying guest endpoint for admin/staff as workaround..."
        );
        apiUrl = `/messages/conversation?${params.toString()}`;
        console.log(
          "👑 [message.service] Admin/Staff using guest endpoint:",
          apiUrl
        );
        console.log("👑 [message.service] User ID for admin/staff:", userId);
      } else {
        apiUrl = `/messages/conversation?${params.toString()}`;
        console.log("👤 [message.service] Guest API call:", apiUrl);
      }

      const response = await api.get<{
        success: boolean;
        data: MessageWithUI[];
      }>(apiUrl);

      console.log(
        "📥 [message.service] API Response for conversation:",
        response.data
      );
      console.log(
        "📥 [message.service] API Response type:",
        typeof response.data,
        Array.isArray(response.data) ? "Array" : "Object"
      );

      let messages: MessageWithUI[] = [];

      // Handle the response format: { success: boolean, data: MessageWithUI[] }
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        "success" in response.data
      ) {
        const wrappedData = response.data as {
          success: boolean;
          data: MessageWithUI[];
        };

        console.log(
          "📊 [message.service] Wrapped data success:",
          wrappedData.success
        );
        console.log(
          "📊 [message.service] Wrapped data length:",
          wrappedData.data?.length
        );

        if (wrappedData.success && Array.isArray(wrappedData.data)) {
          console.log(
            "✅ [message.service] Wrapped response, returning",
            wrappedData.data.length,
            "messages"
          );

          // Process messages to fix sender_id and UI data
          messages = processMessagesList(wrappedData.data, userId);
        } else if (!wrappedData.success) {
          console.error("❌ [message.service] API returned success: false");
          return [];
        }
      } else if (Array.isArray(response.data)) {
        // Process direct array response
        messages = processMessagesList(
          response.data as MessageWithUI[],
          userId
        );
      } else {
        console.warn(
          "⚠️ [message.service] Unexpected response format, returning empty array"
        );
        return [];
      }

      // Update cache
      this.messageCache.set(cacheKey, messages);
      this.lastFetchTime.set(cacheKey, Date.now());

      // Also update socket service cache
      messages.forEach((message) => {
        // Note: updateMessageCache is private, so we'll rely on socket events instead
        // The socket service will handle caching through its event listeners
      });

      return messages;
    } catch (error) {
      console.error("❌ Error fetching conversation messages:", error);
      throw error;
    }
  }

  // Get messages from cache first, then API if needed
  async getMessagesOptimized(
    conversationId: string,
    ui_for: "guest" | "staff" | "admin" = "guest"
  ): Promise<MessageWithUI[]> {
    // Try socket cache first
    const socketCachedMessages =
      socketService.getCachedMessages(conversationId);
    if (socketCachedMessages.length > 0) {
      console.log(
        "📨 [message.service] Using socket cached messages:",
        socketCachedMessages.length
      );
      return socketCachedMessages;
    }

    // Try local cache
    const cacheKey = `messages_${conversationId}_${ui_for}`;
    if (this.isCacheValid(cacheKey)) {
      const cached = this.messageCache.get(cacheKey);
      if (cached && cached.length > 0) {
        console.log(
          "📨 [message.service] Using local cached messages:",
          cached.length
        );
        return cached;
      }
    }

    // Fallback to API call
    console.log("📨 [message.service] Cache miss, fetching from API...");
    return this.getConversationMessages(conversationId, 50, 1, ui_for);
  }

  // Send new message
  async sendMessage(data: CreateMessageDto): Promise<MessageResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        data: MessageResponse;
      }>("/messages", data);

      if (response.data?.success && response.data.data) {
        // Clear cache for this conversation to force refresh
        const cacheKey = `messages_${
          data.conversation_id
        }_${this.getUserRole()}`;
        this.messageCache.delete(cacheKey);
        this.lastFetchTime.delete(cacheKey);

        return response.data.data;
      }

      throw new Error("Failed to send message");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  }

  // Mark conversation as read
  async markConversationAsRead(
    conversationId: string
  ): Promise<{ ok: boolean }> {
    try {
      const response = await api.patch<{ ok: boolean }>(
        `/messages/conversation/read?conversationId=${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error marking conversation as read:", error);
      throw error;
    }
  }

  // Toggle reaction
  async toggleReaction(
    messageId: string,
    type: ReactionType
  ): Promise<ToggleReactionResponse> {
    try {
      const response = await api.post<ToggleReactionResponse>(
        `/messages/${messageId}/reactions/toggle/${type}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error toggling reaction:", error);
      throw error;
    }
  }

  // Add reaction
  async addReaction(
    messageId: string,
    data: AddReactionDto
  ): Promise<MessageResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        data: MessageResponse;
      }>(`/messages/${messageId}/reactions`, data);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Failed to add reaction");
    } catch (error) {
      console.error("❌ Error adding reaction:", error);
      throw error;
    }
  }

  // Remove reaction
  async removeReaction(
    messageId: string,
    type: ReactionType
  ): Promise<MessageResponse> {
    try {
      const response = await api.delete<{
        success: boolean;
        data: MessageResponse;
      }>(`/messages/${messageId}/reactions/${type}`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Failed to remove reaction");
    } catch (error) {
      console.error("❌ Error removing reaction:", error);
      throw error;
    }
  }

  // Recall message
  async recallMessage(messageId: string): Promise<MessageResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        data: MessageResponse;
      }>(`/messages/${messageId}/recall`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Failed to recall message");
    } catch (error) {
      console.error("❌ Error recalling message:", error);
      throw error;
    }
  }

  // Update message
  async updateMessage(
    messageId: string,
    data: UpdateMessageDto
  ): Promise<MessageResponse> {
    try {
      const response = await api.patch<{
        success: boolean;
        data: MessageResponse;
      }>(`/messages/${messageId}`, data);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Failed to update message");
    } catch (error) {
      console.error("❌ Error updating message:", error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{
        success: boolean;
        data: MessageResponse;
      }>(`/messages/${messageId}`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error("Failed to delete message");
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      throw error;
    }
  }

  // Clear cache for a specific conversation
  clearConversationCache(conversationId: string, ui_for: string) {
    const cacheKey = `messages_${conversationId}_${ui_for}`;
    this.messageCache.delete(cacheKey);
    this.lastFetchTime.delete(cacheKey);
    console.log(
      "🗑️ [message.service] Cleared cache for conversation:",
      conversationId
    );
  }

  // Clear all cache
  clearAllCache() {
    this.messageCache.clear();
    this.conversationCache.clear();
    this.lastFetchTime.clear();
    console.log("🗑️ [message.service] Cleared all cache");
  }

  // Test function to debug API calls
  async testApiCalls() {
    try {
      console.log("🧪 [message.service] Testing API calls...");

      const token = localStorage.getItem("access_token");
      const user = this.getCurrentUserId();
      console.log("🧪 [message.service] Token:", token ? "Present" : "Missing");
      console.log("🧪 [message.service] User ID:", user);

      // Test conversations API for different roles
      const roles: ("guest" | "staff" | "admin")[] = [
        "guest",
        "staff",
        "admin",
      ];

      for (const role of roles) {
        console.log(
          `🧪 [message.service] Testing conversations API for role: ${role}`
        );
        try {
          const conversations = await this.getConversations(role);
          console.log(
            `✅ [message.service] Successfully loaded ${conversations.length} conversations for ${role}`
          );

          // Test conversation messages API for first conversation
          if (conversations.length > 0) {
            const firstConversation = conversations[0];
            console.log(
              `🧪 [message.service] Testing conversation messages API for conversation: ${firstConversation._id}`
            );
            try {
              const messages = await this.getConversationMessages(
                firstConversation._id,
                10,
                1,
                role
              );
              console.log(
                `✅ [message.service] Successfully loaded ${messages.length} messages for conversation ${firstConversation._id} with role ${role}`
              );
            } catch (error) {
              console.error(
                `❌ [message.service] Failed to load messages for conversation ${firstConversation._id} with role ${role}:`,
                error
              );
            }
          }
        } catch (error) {
          console.error(
            `❌ [message.service] Failed to load conversations for ${role}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("❌ [message.service] Test API calls error:", error);
    }
  }

  // Enhanced test function to debug all API calls and endpoints
  async testAllApiMethods() {
    try {
      console.log("🧪 [message.service] Testing ALL API methods...");

      const token = localStorage.getItem("access_token");
      const userString = localStorage.getItem("user");
      const userObj = userString ? JSON.parse(userString) : null;

      console.log("🧪 [message.service] Auth info:", {
        hasToken: !!token,
        tokenLength: token?.length,
        userId: userObj?._id,
        userRole: userObj?.role,
      });

      // Test conversations API for admin
      console.log("🧪 [message.service] Testing admin conversations...");
      try {
        const adminConversations = await this.getConversations("admin");
        console.log(
          `✅ [message.service] Admin conversations: ${adminConversations.length}`
        );

        if (adminConversations.length > 0) {
          const testConv = adminConversations[0];
          console.log(
            `🧪 [message.service] Testing conversation: ${testConv._id}`
          );
          console.log(
            `🧪 [message.service] Conversation messageCount: ${testConv.messageCount}`
          );

          // Test multiple API endpoints for the same conversation
          const endpoints = [
            { name: "admin", ui_for: "admin" as const },
            { name: "staff", ui_for: "staff" as const },
            { name: "guest", ui_for: "guest" as const },
          ];

          for (const endpoint of endpoints) {
            try {
              console.log(
                `🔬 [message.service] Testing ${endpoint.name} endpoint...`
              );
              const messages = await this.getConversationMessages(
                testConv._id,
                10,
                1,
                endpoint.ui_for
              );
              console.log(
                `📨 [message.service] ${endpoint.name} endpoint: ${messages.length} messages`
              );
              if (messages.length > 0) {
                console.log(`📨 [message.service] First message:`, messages[0]);
              }
            } catch (error) {
              console.error(
                `❌ [message.service] ${endpoint.name} endpoint failed:`,
                error
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "❌ [message.service] Admin conversations failed:",
          error
        );
      }
    } catch (error) {
      console.error("❌ [message.service] Test all API methods error:", error);
    }
  }

  getUserRole(): "guest" | "staff" | "admin" {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        const role = user?.role;
        // Return the actual role from user data
        if (role === "admin" || role === "staff" || role === "guest") {
          return role;
        }
      }
    } catch {
      console.warn("Could not determine user role");
    }
    return "guest";
  }

  // Helper to get current user ID
  getCurrentUserId(): string {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        return user?._id || "";
      }
    } catch {
      console.warn("Could not get current user ID");
    }
    return "";
  }
}

const messageService = new MessageService();
export default messageService;
