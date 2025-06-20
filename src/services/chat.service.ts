import { api } from '@/services/api';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

class ChatService {
  async getUsers() {
    const response = await api.get(`/users`);
    return response.data;
  }

  async getConversations(userId: string) {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  }

  async getConversation(user1: string, user2: string): Promise<Message[]> {
    const response = await api.get(`/messages/conversation?user1=${user1}&user2=${user2}`);

    const data = response.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.messages)) return data.messages;

    if (data && typeof data.data === 'object') {
      return Object.values(data.data).map((msg: any) => ({
        id: msg._id,
        content: msg.content,
        senderId: msg.sender_id._id || msg.sender_id,
        receiverId: msg.receiver_id._id || msg.receiver_id,
        conversationId: msg.conversation_id || '',
        createdAt: msg.createdAt || msg.sent_at,
        isRead: msg.is_read === 'read' || msg.is_read === true,
        ...msg
      }));
    }
    return [];
  }

  async sendMessage(receiverId: string, content: string) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await api.post(
      `/messages`,
      { content, sender_id: user._id, receiver_id: receiverId },
    );
    return response.data;
  }

  async markMessageAsRead(messageId: string) {
    const response = await api.patch(
      `/messages/${messageId}/read`,
      {},
    );
    return response.data;
  }

  async markConversationAsRead(userId: string, otherUserId: string) {
    const response = await api.patch(
      `/messages/conversation/read?userId=${userId}&otherUserId=${otherUserId}`,
      {},
    );
    return response.data;
  }

  async getUnreadCount(userId: string) {
    const response = await api.get(`/messages/unread/${userId}`);
    return response.data;
  }
}

const chatService = new ChatService();
export default chatService;