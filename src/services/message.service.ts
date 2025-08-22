import { api } from '@/services/api';
import {
  MessageWithUI,
  ConversationUI,
  CreateMessageDto,
  MessageResponse,
  ReactionType,
  ToggleReactionResponse,
  UpdateMessageDto,
  AddReactionDto,
} from '@/types/message';

class MessageService {
  // Debug helper to check auth status
  private checkAuthStatus() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    console.log('🔐 Auth Status:', {
      hasToken: !!token,
      tokenLength: token?.length,
      hasUser: !!user,
      userRole: this.getUserRole(),
    });
    return { token, user };
  }

  // Get conversations list (UI-optimized) - Matches API docs exactly
  async getConversations(ui_for: 'guest' | 'staff' = 'guest'): Promise<ConversationUI[]> {
    try {
      this.checkAuthStatus();
      console.log('📥 Fetching conversations for:', ui_for);

      const response = await api.get<ConversationUI[] | { success: boolean; data: ConversationUI[] }>(
        `/messages/conversations?ui_for=${ui_for}`,
      );

      // API docs show direct array response, not wrapped in success/data
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback for wrapped response format
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedData = response.data as { success: boolean; data: ConversationUI[] };
        if (Array.isArray(wrappedData.data)) {
          return wrappedData.data;
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages in a conversation - Updated to match API docs exactly
  async getConversationMessages(
    conversationId: string,
    limit?: number,
    page?: number,
    ui_for: 'guest' | 'staff' = 'guest',
  ): Promise<MessageWithUI[]> {
    try {
      this.checkAuthStatus();
      console.log('📨 Fetching messages for conversation:', conversationId, 'ui_for:', ui_for);

      const params = new URLSearchParams({
        conversationId,
        ui_for,
      });

      if (limit) params.append('limit', limit.toString());
      if (page) params.append('page', page.toString());

      const response = await api.get<MessageWithUI[] | { success: boolean; data: MessageWithUI[] }>(
        `/messages/conversation?${params.toString()}`,
      );

      // API docs show direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback for wrapped response format
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedData = response.data as { success: boolean; data: MessageWithUI[] };
        if (Array.isArray(wrappedData.data)) {
          return wrappedData.data;
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching conversation messages:', error);
      throw error;
    }
  }

  // Send new message
  async sendMessage(data: CreateMessageDto): Promise<MessageResponse> {
    try {
      const response = await api.post<{ success: boolean; data: MessageResponse }>('/messages', data);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to send message');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId: string): Promise<{ ok: boolean }> {
    try {
      const response = await api.patch<{ ok: boolean }>(`/messages/conversation/read?conversationId=${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
      throw error;
    }
  }

  // Toggle reaction
  async toggleReaction(messageId: string, type: ReactionType): Promise<ToggleReactionResponse> {
    try {
      const response = await api.post<ToggleReactionResponse>(`/messages/${messageId}/reactions/toggle/${type}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling reaction:', error);
      throw error;
    }
  }

  // Add reaction
  async addReaction(messageId: string, data: AddReactionDto): Promise<MessageResponse> {
    try {
      const response = await api.post<{ success: boolean; data: MessageResponse }>(
        `/messages/${messageId}/reactions`,
        data,
      );

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to add reaction');
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
      throw error;
    }
  }

  // Remove reaction
  async removeReaction(messageId: string, type: ReactionType): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ success: boolean; data: MessageResponse }>(
        `/messages/${messageId}/reactions/${type}`,
      );

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to remove reaction');
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
      throw error;
    }
  }

  // Recall message
  async recallMessage(messageId: string): Promise<MessageResponse> {
    try {
      const response = await api.post<{ success: boolean; data: MessageResponse }>(`/messages/${messageId}/recall`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to recall message');
    } catch (error) {
      console.error('❌ Error recalling message:', error);
      throw error;
    }
  }

  // Update message
  async updateMessage(messageId: string, data: UpdateMessageDto): Promise<MessageResponse> {
    try {
      const response = await api.patch<{ success: boolean; data: MessageResponse }>(`/messages/${messageId}`, data);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to update message');
    } catch (error) {
      console.error('❌ Error updating message:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ success: boolean; data: MessageResponse }>(`/messages/${messageId}`);

      if (response.data?.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to delete message');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  }

  // Helper to get current user role
  getUserRole(): 'guest' | 'staff' {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const role = user?.role;
        return role === 'admin' || role === 'staff' ? 'staff' : 'guest';
      }
    } catch {
      console.warn('Could not determine user role');
    }
    return 'guest';
  }

  // Helper to get current user ID
  getCurrentUserId(): string {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user?._id || '';
      }
    } catch {
      console.warn('Could not get current user ID');
    }
    return '';
  }
}

const messageService = new MessageService();
export default messageService;
