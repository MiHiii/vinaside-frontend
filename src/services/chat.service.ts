import { api } from '@/services/api';
import { User } from '@/types/user';

// User info that comes with messages
export interface MessageUser {
  _id: string;
  username: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  senderInfo?: MessageUser; // Full sender info from API
  receiverInfo?: MessageUser; // Full receiver info from API
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  isRecalled?: boolean;
  recalledAt?: string;
  reactions?: MessageReaction[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
    senderId: string;
  }; // Reply/quoted message info
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userInfo?: MessageUser; // Full user info from API
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
    sender_id: MessageUser | string;
    receiver_id: MessageUser | string;
    content: string;
    sent_at: string;
    is_read: string;
    createdAt: string;
    updatedAt: string;
    reply_to?: {
      message_id: string;
      content: string;
      sender_id: string;
      sender_name: string;
      sent_at?: string;
    };
  };
  message: string;
}

// New conversations response shape from /messages/conversations
interface ConversationsResponseNew {
  success: boolean;
  data: Array<{
    _id: string; // other user id
    lastMessage?: {
      _id: string;
      content: string;
      senderId: string;
      type?: string;
      sent_at: string;
    };
    unreadCount?: number;
    user: {
      name: string;
      email: string;
      avatar_url?: string;
    };
    lastMessageAt?: string;
    unreadCounts?: Record<string, number>;
  }>;
  statusCode?: number;
  message: string;
}

interface AvailableUsersResponse {
  success: boolean;
  data: Array<{
    _id: string;
    username: string;
    email: string;
    avatar_url?: string;
    name: string;
    role: string;
    lastMessageAt?: string;
  }>;
  message: string;
}

interface PropertyStaffResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar_url: string;
    is_online: boolean;
    last_seen: string;
  }>;
  statusCode: number;
  message: string;
}

interface ConversationMessage {
  _id: string;
  content: string;
  sender_id: MessageUser | string;
  receiver_id: MessageUser | string;
  conversation_id?: string;
  sent_at: string;
  createdAt?: string;
  is_read: string | boolean;
  is_recalled?: boolean;
  recalled_at?: string;
  reply_to?: {
    message_id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    sent_at?: string;
  };
  reactions?: Array<{
    _id?: string;
    user_id: MessageUser | string;
    reaction_type: string;
    emoji?: string;
    created_at: string;
  }>;
}

class ChatService {
  private conversationUserCache: Record<
    string,
    {
      _id: string;
      name: string;
      email?: string;
      avatar_url?: string;
    }
  > = {};
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

  // Lấy danh sách staff của property
  async getPropertyStaff(propertyId: string) {
    try {
      const response = await api.get<PropertyStaffResponse>(
        `/property-staff-assignment/public/property/${propertyId}/staff-info`,
      );
      console.log('👥 Property staff API response:', response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data };
      }

      return { success: false, data: [], message: 'No staff found' };
    } catch (error) {
      console.error('❌ Error fetching property staff:', error);
      throw error;
    }
  }

  // Lấy danh sách cuộc hội thoại của user hiện tại
  async getConversations() {
    try {
      const response = await api.get<ConversationsResponseNew>(`/messages/conversations`);
      console.log('💬 Conversations API response:', response.data);

      // Normalize to internal Conversation[] shape expected by UI
      if (response.data?.success && Array.isArray(response.data.data)) {
        const myId = this.getCurrentUserId();

        const normalized = response.data.data.map((item) => {
          const otherUserId = item._id;

          // Cache sidebar user info from conversations payload
          if (otherUserId && item.user) {
            this.conversationUserCache[otherUserId] = {
              _id: otherUserId,
              name: item.user.name,
              email: item.user.email,
              avatar_url: item.user.avatar_url,
            };
          }

          const normalizedLastMessage: Message | undefined = item.lastMessage
            ? {
                id: item.lastMessage._id,
                content: item.lastMessage.content,
                senderId: item.lastMessage.senderId,
                receiverId: item.lastMessage.senderId === myId ? otherUserId : myId,
                conversationId: '',
                createdAt: item.lastMessage.sent_at || item.lastMessageAt || '',
                isRead: (item.unreadCounts && myId
                  ? (item.unreadCounts[myId] || 0) === 0
                  : (item.unreadCount || 0) === 0) as boolean,
              }
            : undefined;

          const unreadCountForMe = item.unreadCounts && myId ? item.unreadCounts[myId] || 0 : item.unreadCount || 0;

          return {
            id: otherUserId,
            participants: [myId, otherUserId].filter(Boolean),
            lastMessage: normalizedLastMessage,
            unreadCount: unreadCountForMe,
          } as Conversation;
        });

        // Sort by lastMessageAt desc if available
        normalized.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        return normalized;
      }

      // Fallback for backward compatibility
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  }

  // Expose cached users derived from conversations
  getConversationUsers(): Array<{
    _id: string;
    name: string;
    email?: string;
    avatar_url?: string;
  }> {
    return Object.values(this.conversationUserCache);
  }

  // Lấy cuộc hội thoại giữa user hiện tại và user khác
  async getConversation(otherUserId: string, limit?: number, offset?: number): Promise<Message[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('otherUserId', otherUserId);

      // Add pagination parameters if provided
      if (limit !== undefined) {
        params.append('limit', limit.toString());
      } else {
        // Default to a higher limit to get more messages
        params.append('limit', '500');
      }

      if (offset !== undefined) {
        params.append('offset', offset.toString());
      }

      // Add page parameter as alternative to offset
      if (offset !== undefined && limit !== undefined) {
        const page = Math.floor(offset / limit) + 1;
        params.append('page', page.toString());
      }

      const response = await api.get(`/messages/conversation?${params.toString()}`);
      console.log('📨 Conversation messages API response:', response.data);

      const data = response.data;

      // Handle new API format
      if (data?.success && Array.isArray(data.data)) {
        return data.data.map(
          (
            msg: ConversationMessage & {
              is_recalled?: boolean;
              recalled_at?: string;
            },
          ) => ({
            id: msg._id,
            content: msg.content,
            senderId: typeof msg.sender_id === 'object' ? msg.sender_id._id : msg.sender_id,
            receiverId: typeof msg.receiver_id === 'object' ? msg.receiver_id._id : msg.receiver_id,
            senderInfo: typeof msg.sender_id === 'object' ? msg.sender_id : undefined,
            receiverInfo: typeof msg.receiver_id === 'object' ? msg.receiver_id : undefined,
            conversationId: msg.conversation_id || '',
            createdAt: msg.sent_at || msg.createdAt || '',
            isRead: msg.is_read === 'read' || msg.is_read === true,
            isRecalled: msg.is_recalled || false,
            recalledAt: msg.recalled_at || undefined,
            replyTo: msg.reply_to
              ? {
                  messageId: msg.reply_to.message_id,
                  content: msg.reply_to.content,
                  senderName: msg.reply_to.sender_name || 'Người dùng',
                  senderId: msg.reply_to.sender_id,
                }
              : undefined,
            reactions:
              msg.reactions?.map((reaction) => ({
                emoji: reaction.emoji || this.getEmojiFromReactionType(reaction.reaction_type || 'like'),
                userId: typeof reaction.user_id === 'object' ? reaction.user_id._id : reaction.user_id,
                userInfo: typeof reaction.user_id === 'object' ? reaction.user_id : undefined,
                userName: typeof reaction.user_id === 'object' ? reaction.user_id.name : '',
                createdAt: reaction.created_at,
                type: (reaction.reaction_type as ReactionType) || ReactionType.LIKE,
              })) || [],
          }),
        );
      }

      // Fallback for backward compatibility
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;

      return [];
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
      throw error;
    }
  }

  // Lấy tin nhắn cuối cùng cho một cuộc hội thoại
  async getLastMessage(otherUserId: string): Promise<Message | null> {
    try {
      // Fetch only the last message by using limit=1 and getting the last item
      const messages = await this.getConversation(otherUserId, 1, 0);
      return messages.length > 0 ? messages[messages.length - 1] : null;
    } catch (error) {
      console.error('❌ Error fetching last message:', error);
      return null;
    }
  }

  // Load more messages (older messages) for pagination
  async loadMoreMessages(otherUserId: string, beforeMessageId?: string, limit: number = 50): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      params.append('otherUserId', otherUserId);
      params.append('limit', limit.toString());

      if (beforeMessageId) {
        params.append('before', beforeMessageId);
      }

      const response = await api.get(`/messages/conversation?${params.toString()}`);
      console.log('📨 Load more messages API response:', response.data);

      const data = response.data;

      // Handle new API format (same as getConversation)
      if (data?.success && Array.isArray(data.data)) {
        return data.data.map(
          (
            msg: ConversationMessage & {
              is_recalled?: boolean;
              recalled_at?: string;
            },
          ) => ({
            id: msg._id,
            content: msg.content,
            senderId: typeof msg.sender_id === 'object' ? msg.sender_id._id : msg.sender_id,
            receiverId: typeof msg.receiver_id === 'object' ? msg.receiver_id._id : msg.receiver_id,
            senderInfo: typeof msg.sender_id === 'object' ? msg.sender_id : undefined,
            receiverInfo: typeof msg.receiver_id === 'object' ? msg.receiver_id : undefined,
            conversationId: msg.conversation_id || '',
            createdAt: msg.sent_at || msg.createdAt || '',
            isRead: msg.is_read === 'read' || msg.is_read === true,
            isRecalled: msg.is_recalled || false,
            recalledAt: msg.recalled_at || undefined,
            replyTo: msg.reply_to
              ? {
                  messageId: msg.reply_to.message_id,
                  content: msg.reply_to.content,
                  senderName: msg.reply_to.sender_name || 'Người dùng',
                  senderId: msg.reply_to.sender_id,
                }
              : undefined,
            reactions:
              msg.reactions?.map((reaction) => ({
                emoji: reaction.emoji || this.getEmojiFromReactionType(reaction.reaction_type || 'like'),
                userId: typeof reaction.user_id === 'object' ? reaction.user_id._id : reaction.user_id,
                userInfo: typeof reaction.user_id === 'object' ? reaction.user_id : undefined,
                userName: typeof reaction.user_id === 'object' ? reaction.user_id.name : '',
                createdAt: reaction.created_at,
                type: (reaction.reaction_type as ReactionType) || ReactionType.LIKE,
              })) || [],
          }),
        );
      }

      return [];
    } catch (error) {
      console.error('❌ Error loading more messages:', error);
      throw error;
    }
  }

  // Tạo tin nhắn mới - Updated to match new API (no senderId required)
  async sendMessage(receiverId: string, content: string, replyToMessageId?: string, propertyId?: string) {
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
      ...(replyToMessageId && { reply_to_message_id: replyToMessageId }),
      // ...(propertyId && { property_id: propertyId }), // Commented out - no longer needed
    };

    console.log('📤 Sending message with payload:', payload);
    console.log('📤 API endpoint:', '/messages');

    try {
      const response = await api.post<SendMessageResponse>(`/messages`, payload);
      console.log('✅ Send message success:', response.data);

      // Return normalized response
      if (response.data?.success && response.data.data) {
        const responseData = response.data.data;
        return {
          success: true,
          data: {
            _id: responseData._id,
            content: responseData.content,
            sender_id: typeof responseData.sender_id === 'object' ? responseData.sender_id._id : responseData.sender_id,
            receiver_id:
              typeof responseData.receiver_id === 'object' ? responseData.receiver_id._id : responseData.receiver_id,
            senderInfo: typeof responseData.sender_id === 'object' ? responseData.sender_id : undefined,
            receiverInfo: typeof responseData.receiver_id === 'object' ? responseData.receiver_id : undefined,
            sent_at: responseData.sent_at,
            is_read: responseData.is_read,
            createdAt: responseData.createdAt,
            reply_to: responseData.reply_to
              ? {
                  message_id: responseData.reply_to.message_id,
                  content: responseData.reply_to.content,
                  sender_id: responseData.reply_to.sender_id,
                  sender_name: responseData.reply_to.sender_name,
                  sent_at: responseData.reply_to.sent_at,
                }
              : undefined,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error('❌ Send message failed:', error);
      const axiosError = error as {
        response?: { data: unknown; status: number; statusText: string };
      };
      if (axiosError.response) {
        console.error('❌ Error response data:', axiosError.response.data);
        console.error('❌ Error status:', axiosError.response.status);
        console.error('❌ Error status text:', axiosError.response.statusText);

        // Try to extract meaningful error message
        const errorData = axiosError.response.data as {
          message?: string;
          errors?: unknown;
        };
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
          return {
            success: true,
            message: `${successCount} messages marked as read`,
          };
        } else {
          console.warn(`⚠️ ${successCount} messages marked as read, ${failureCount} failed`);
          return {
            success: true,
            message: `${successCount}/${results.length} messages marked as read`,
          };
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
  // Thu hồi tin nhắn - Updated for new API
  async deleteMessage(messageId: string) {
    try {
      const response = await api.post(`/messages/${messageId}/recall`);
      console.log('✅ Message recalled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error recalling message:', error);
      throw error;
    }
  }

  // Legacy method name for backward compatibility
  async recallMessage(messageId: string) {
    return this.deleteMessage(messageId);
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
    // Handle undefined or null reactionType
    if (!reactionType || typeof reactionType !== 'string') {
      return '👍'; // Default emoji
    }

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
