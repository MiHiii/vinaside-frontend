import { api } from '@/services/api';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName?: string;
  createdAt: string;
  type: ReactionType;
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export interface AddReactionDto {
  messageId: string;
  reactionType: ReactionType;
}

export interface RemoveReactionDto {
  messageId: string;
  reactionType: ReactionType;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ApiUser {
  _id: string;
  name: string;
  avatar?: string;
  [key: string]: unknown;
}

// Response interfaces based on API documentation
interface SendMessageResponse {
  success: boolean;
  data: {
    _id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    sent_at: string;
    is_read: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface ConversationsResponse {
  success: boolean;
  data: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
      avatar?: string;
      name?: string;
    };
    lastMessage?: {
      _id: string;
      content: string;
      sent_at: string;
      is_read: string;
    };
    unreadCount: number;
  }>;
  message: string;
}

interface AvailableUsersResponse {
  success: boolean;
  data: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    name: string;
    role: string;
    lastMessageAt?: string;
  }>;
  message: string;
}

interface ConversationMessage {
  _id: string;
  content: string;
  sender_id: { _id: string } | string;
  receiver_id: { _id: string } | string;
  conversation_id?: string;
  sent_at: string;
  createdAt?: string;
  is_read: string | boolean;
  reactions?: Array<{
    _id?: string;
    user_id: string;
    reaction_type: string;
    emoji?: string;
    created_at: string;
  }>;
}

class ChatService {
  // Lấy danh sách người dùng có thể nhắn tin
  async getUsers() {
    try {
      const response = await api.get<AvailableUsersResponse>(`/messages/available-users`);
      console.log('👥 Available users API response:', response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data };
      }

      // Fallback for backward compatibility
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching available users:', error);
      throw error;
    }
  }

  // Lấy danh sách cuộc hội thoại của user hiện tại
  async getConversations() {
    try {
      const response = await api.get<ConversationsResponse>(`/messages/conversations`);
      console.log('💬 Conversations API response:', response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Fallback for backward compatibility
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  }

  // Lấy cuộc hội thoại giữa user hiện tại và user khác
  async getConversation(otherUserId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/messages/conversation?otherUserId=${otherUserId}`);
      console.log('📨 Conversation messages API response:', response.data);

      const data = response.data;

      // Handle new API format
      if (data?.success && Array.isArray(data.data)) {
        return data.data.map((msg: ConversationMessage) => ({
          id: msg._id,
          content: msg.content,
          senderId: typeof msg.sender_id === 'object' ? msg.sender_id._id : msg.sender_id,
          receiverId: typeof msg.receiver_id === 'object' ? msg.receiver_id._id : msg.receiver_id,
          conversationId: msg.conversation_id || '',
          createdAt: msg.sent_at || msg.createdAt || '',
          isRead: msg.is_read === 'read' || msg.is_read === true,
          reactions:
            msg.reactions?.map((reaction) => ({
              emoji: reaction.emoji || this.getEmojiFromReactionType(reaction.reaction_type),
              userId: reaction.user_id,
              userName: '', // Will be populated if needed
              createdAt: reaction.created_at,
              type: reaction.reaction_type as ReactionType,
            })) || [],
        }));
      }

      // Fallback for backward compatibility
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.messages)) return data.messages;

      if (data && typeof data.data === 'object') {
        return Object.values(data.data).map((msg: unknown) => {
          const message = msg as ApiUser;
          return {
            id: message._id,
            content: message.content as string,
            senderId:
              typeof message.sender_id === 'object'
                ? (message.sender_id as { _id: string })._id
                : (message.sender_id as string),
            receiverId:
              typeof message.receiver_id === 'object'
                ? (message.receiver_id as { _id: string })._id
                : (message.receiver_id as string),
            conversationId: (message.conversation_id as string) || '',
            createdAt: (message.createdAt as string) || (message.sent_at as string),
            isRead: message.is_read === 'read' || message.is_read === true,
            ...message,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
      throw error;
    }
  }

  // Tạo tin nhắn mới - Updated to match new API (no senderId required)
  async sendMessage(receiverId: string, content: string) {
    // Validate input
    if (!receiverId || !receiverId.trim()) {
      throw new Error('Receiver ID is required');
    }
    if (!content || !content.trim()) {
      throw new Error('Message content is required');
    }

    const payload = {
      receiver_id: receiverId.trim(),
      content: content.trim(),
    };

    console.log('📤 Sending message with payload:', payload);
    console.log('📤 API endpoint:', '/messages');

    try {
      const response = await api.post<SendMessageResponse>(`/messages`, payload);
      console.log('✅ Send message success:', response.data);

      // Return normalized response
      if (response.data?.success && response.data.data) {
        return {
          success: true,
          data: {
            _id: response.data.data._id,
            content: response.data.data.content,
            sender_id: response.data.data.sender_id,
            receiver_id: response.data.data.receiver_id,
            sent_at: response.data.data.sent_at,
            is_read: response.data.data.is_read,
            createdAt: response.data.data.createdAt,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error('❌ Send message failed:', error);
      const axiosError = error as { response?: { data: unknown; status: number; statusText: string } };
      if (axiosError.response) {
        console.error('❌ Error response data:', axiosError.response.data);
        console.error('❌ Error status:', axiosError.response.status);
        console.error('❌ Error status text:', axiosError.response.statusText);

        // Try to extract meaningful error message
        const errorData = axiosError.response.data as { message?: string; errors?: unknown };
        if (errorData?.message) {
          console.error('❌ Backend error message:', errorData.message);
        }
        if (errorData?.errors) {
          console.error('❌ Validation errors:', errorData.errors);
        }
      }
      throw error;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessageAsRead(messageId: string) {
    try {
      const response = await api.patch(`/messages/${messageId}/read`, {});
      console.log('✅ Message marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      throw error;
    }
  }

  // Đánh dấu cuộc hội thoại đã đọc
  async markConversationAsRead(otherUserId: string, currentUserId?: string) {
    try {
      // First, get the conversation to find unread messages
      const messages = await this.getConversation(otherUserId);

      // Get current user ID
      const myUserId = currentUserId || this.getCurrentUserId();
      if (!myUserId) {
        console.warn('⚠️ Cannot mark as read: current user ID not available');
        return { success: false, message: 'Current user ID not available' };
      }

      // Find ALL unread messages that we received (not sent)
      const unreadMessages = messages
        .filter((msg) => !msg.isRead && msg.receiverId === myUserId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort oldest first

      if (unreadMessages.length > 0) {
        console.log(`📊 Found ${unreadMessages.length} unread messages to mark as read`);

        // Mark all unread messages as read
        const markReadPromises = unreadMessages.map(async (message) => {
          try {
            const response = await api.patch(`/messages/${message.id}/read`, {});
            console.log(`✅ Message ${message.id} marked as read`);
            return response.data;
          } catch (error) {
            console.error(`❌ Failed to mark message ${message.id} as read:`, error);
            return { success: false, messageId: message.id };
          }
        });

        // Wait for all mark-as-read operations to complete
        const results = await Promise.allSettled(markReadPromises);

        const successCount = results.filter((result) => result.status === 'fulfilled').length;
        const failureCount = results.length - successCount;

        if (failureCount === 0) {
          console.log(`✅ All ${successCount} messages marked as read successfully`);
          return { success: true, message: `${successCount} messages marked as read` };
        } else {
          console.warn(`⚠️ ${successCount} messages marked as read, ${failureCount} failed`);
          return { success: true, message: `${successCount}/${results.length} messages marked as read` };
        }
      } else {
        console.log('ℹ️ No unread messages to mark as read');
        return { success: true, message: 'No unread messages' };
      }
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
      throw error;
    }
  }

  // Helper method to get current user ID from token or context
  private getCurrentUserId(): string {
    // This should be implemented based on how you store current user info
    // For now, we'll try to get it from localStorage or return empty string
    try {
      const authState = localStorage.getItem('auth');
      if (authState) {
        const parsed = JSON.parse(authState);
        return parsed.user?._id || '';
      }
    } catch {
      console.warn('Could not get current user ID from localStorage');
    }
    return '';
  }

  // Lấy số tin nhắn chưa đọc
  async getUnreadCount() {
    try {
      const response = await api.get(`/messages/unread-count`);
      console.log('📊 Unread count:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  }

  // Lấy thông tin 1 tin nhắn
  async getMessage(messageId: string) {
    try {
      const response = await api.get(`/messages/${messageId}`);
      console.log('📨 Message details:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching message:', error);
      throw error;
    }
  }

  // Cập nhật tin nhắn
  async updateMessage(messageId: string, content: string) {
    try {
      const response = await api.patch(`/messages/${messageId}`, { content });
      console.log('✅ Message updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating message:', error);
      throw error;
    }
  }

  // Xóa tin nhắn
  async deleteMessage(messageId: string) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      console.log('✅ Message deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  }

  // Thêm reaction vào tin nhắn
  async addReaction(addReactionDto: AddReactionDto) {
    try {
      const response = await api.post(`/messages/reactions/add`, addReactionDto);
      console.log('👍 Reaction added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
      throw error;
    }
  }

  // Xóa reaction khỏi tin nhắn
  async removeReaction(removeReactionDto: RemoveReactionDto) {
    try {
      const response = await api.post(`/messages/reactions/remove`, removeReactionDto);
      console.log('👎 Reaction removed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
      throw error;
    }
  }

  // Toggle reaction (Recommended method)
  async toggleReaction(messageId: string, reactionType: ReactionType) {
    try {
      const response = await api.post(`/messages/${messageId}/reactions/toggle/${reactionType}`);
      console.log('🔄 Reaction toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling reaction:', error);
      throw error;
    }
  }

  private getEmojiFromReactionType(reactionType: string): string {
    const emojiMap: Record<string, string> = {
      like: '👍',
      love: '❤️',
      laugh: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😡',
    };
    return emojiMap[reactionType.toLowerCase()] || '👍';
  }
}

const chatService = new ChatService();
export default chatService;
