/**
 * Property-Based Messaging System Types
 * Based on new API documentation where guest messages with property
 * and all staff with message.manage permission can respond
 */

export interface MessageUser {
  _id: string;
  name: string;
  username: string;
  avatar_url?: string;
  email?: string;
}

export interface PropertyInfo {
  _id: string;
  name: string;
  thumbnail?: string;
  status: string;
  isVerified?: boolean;
}

// Message Schema mới - property-based
export interface Message {
  _id: string;
  sender_id: string | MessageUser; // Required: ID người gửi
  receiver_id?: string; // Optional: Không còn bắt buộc
  property_id: string | PropertyInfo; // Required: ID property (BẮT BUỘC)
  content: string;
  sent_at: Date | string;
  is_read: MessageStatus;
  reactions: Reaction[];
  is_recalled: boolean;
  recalled_at?: Date | string;
  reply_to_message_id?: string;
  reply_to?: ReplyInfo | null;
}

export interface ReplyInfo {
  message_id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sent_at: Date | string;
}

export interface Reaction {
  userId: string;
  username: string;
  avatar_url?: string;
  type: string;
  emoji: string;
  created_at: Date | string;
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

// Conversation mới - property-based (cho guest view)
export interface PropertyConversation {
  _id: string; // ID của conversation
  property_id: string; // ID của property (MongoDB ObjectId)
  type: 'property'; // Loại cuộc trò chuyện
  name: string; // Tên property
  avatar_url: string; // Thumbnail property
  status: string; // Trạng thái property
  isVerified: boolean; // Property đã xác minh
  lastMessage: {
    content: string;
    sender_id: string;
    is_read: string;
    sent_at: string;
  };
  messageCount: number;
  unreadCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
  lastSender: {
    _id: string;
    isCurrentUser: boolean;
  };
}

// Management conversation (cho staff/admin view) - Updated để match API response mới
export interface ManagementConversation {
  _id: string; // ID của conversation (format: property_id|guest_id)
  type: 'property'; // Type từ API (được normalize thành 'management' ở frontend)

  // Thông tin Property
  property: {
    _id: string; // ID của property
    name: string; // Tên property
    thumbnail?: string; // Ảnh property
  };

  // Thông tin Guest
  guest: {
    _id: string; // ID của guest
    name: string; // Tên guest
    email: string; // Email guest
    avatar_url: string | null; // Avatar guest (có thể null)
    phone?: string; // Số điện thoại guest
  };

  // Convenience field cho staff navigation
  otherUserId: string; // guest._id để dễ dàng navigate

  // Legacy fields để tương thích với UI hiện tại
  name: string; // guest.name
  avatar_url: string | null; // guest.avatar_url

  lastMessage: {
    content: string;
    sender_id: string;
    is_read: string;
    sent_at: string;
  };
  messageCount: number;
  unreadCount: number;
  firstMessageAt?: string;
  lastMessageAt?: string;
  lastSender?: {
    _id: string;
    isCurrentUser: boolean;
  };
}

// Union type cho conversations
export type ConversationItem = PropertyConversation | ManagementConversation;

// API Request/Response Types
export interface SendMessageRequest {
  content: string; // Required: Nội dung tin nhắn
  property_id: string; // Required: ID của property
  reply_to_message_id?: string; // Optional: ID tin nhắn được reply
}

export interface SendMessageResponse {
  _id: string;
  sender_id: MessageUser;
  property_id: PropertyInfo;
  content: string;
  sent_at: string;
  is_read: MessageStatus;
  reactions: Reaction[];
  reply_to: ReplyInfo | null;
}

export interface ConversationMessage {
  _id: string;
  sender_id: MessageUser;
  property_id: string;
  content: string;
  sent_at: string;
  is_read: MessageStatus;
  reactions: Reaction[];
  reply_to: ReplyInfo | null;
  is_recalled: boolean;
}

// Permission checking types
export interface UserPermissions {
  role: 'guest' | 'staff' | 'admin';
  permissions?: string[];
  assignedProperties?: string[];
}

// Socket Events
export type SocketNewMessage = Message;

export interface SocketConversationUpdate {
  otherUserId: string; // property_id
  lastMessage: {
    _id: string;
    content: string;
    senderId: string;
    type: string;
    sent_at: string;
  };
  lastMessageAt: string;
  unreadCounts: Record<string, number>;
}

export type SocketReactionUpdate = Message;

export interface SocketMessageRecalled extends Message {
  is_recalled: true;
  content: 'Bạn đã thu hồi một tin nhắn';
}

// Legacy compatibility - for gradual migration
export interface LegacyMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId?: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  isRecalled?: boolean;
  reactions?: MessageReaction[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
    senderId: string;
  };
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName?: string;
  createdAt: string;
  type: ReactionType;
}

// Utility types for UI components
export interface ConversationListItem {
  id: string;
  type: 'property';
  name: string;
  avatar: string;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  isOnline?: boolean; // Property không có trạng thái online
}

export interface MessagePermissions {
  canSendMessage: boolean;
  canReply: boolean;
  canReact: boolean;
  canRecall: boolean;
  reason?: string; // Lý do không có quyền
}
