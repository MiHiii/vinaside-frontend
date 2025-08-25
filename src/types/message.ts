// V2 API Types for conversation-based messaging
export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";
export type MessageStatus = "sent" | "delivered" | "read";

// UI helper for message display
export interface UiMeta {
  mine: boolean;
  show_sender_meta: boolean;
  sender_display_name: string;
  sender_avatar_url: string | null;
}

// Reply/Quote info - Updated with consistent string types
export interface ReplyTo {
  message_id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sent_at: string; // ISO string
}

// Reaction with full user info - Updated to match API documentation
export interface MessageReaction {
  userId: string;
  username: string;
  avatar_url?: string;
  type: ReactionType;
  emoji: string;
  created_at: string;
}

// Main message object from API - Updated with consistent string types
export interface MessageWithUI {
  _id: string;
  conversation_id: string;
  property_id: string;
  guest_id: string;
  sender_id: string;
  content: string;
  sent_at: string; // ISO string for consistency
  is_read: MessageStatus;
  is_recalled?: boolean;
  recalled_at?: string; // ISO string
  reactions: MessageReaction[];
  reply_to?: ReplyTo | null;
  ui_for: "guest" | "staff" | "admin";
  ui: UiMeta;
}

// Conversation display info for UI
export interface ConversationDisplay {
  title: string;
  subtitle: string;
  avatar_url: string | null;
  badge: null | {
    text: string;
    avatar_url: string | null;
  };
  unreadCount: number;
}

// Participant info
export interface Participant {
  _id: string;
  name: string;
  username: string;
  avatar_url: string;
  role: "guest" | "staff" | "admin";
  type: "guest" | "staff" | "admin";
}

// Conversation list item from /messages/conversations
export interface ConversationUI {
  _id: string;
  thread_type: "property";
  property: {
    _id: string;
    name: string;
    thumbnail?: string;
    status: string;
    isVerified: boolean;
  } | null;
  guest: {
    _id: string;
    name: string;
    avatar_url?: string;
  } | null;
  staff_summary: {
    count: number;
    last_active: {
      _id: string;
      name: string;
      avatar_url?: string;
    } | null;
  };
  lastMessage: {
    _id: string;
    content: string;
    sender_id: string;
    sender_role: "guest" | "staff" | "admin";
    sent_at: string; // ISO string
    is_read: MessageStatus;
  } | null;
  lastMessageAt: string | null; // ISO string
  messageCount: number;
  ui_for: "guest" | "staff" | "admin";
  display: ConversationDisplay;
  participants?: Participant[];
  participant_count?: number;
}

// Socket events - Updated with correct payload types
export interface ConversationUpdateV2 {
  conversationId: string;
  lastMessage: null | {
    _id: string;
    content: string;
    sender_id: string;
    sender_role: "guest" | "staff" | "admin";
    sent_at: string; // ISO string
    is_read: MessageStatus;
  };
  lastMessageAt: string | null; // ISO string
  unreadCount: number;
  isAdminUpdate?: boolean; // Flag to indicate this is an admin update
}

// Request types
export interface CreateMessageDto {
  conversation_id?: string;
  property_id?: string;
  guest_id?: string;
  content: string;
  reply_to_message_id?: string;
}

export interface AddReactionDto {
  type: ReactionType;
}

export interface UpdateMessageDto {
  content: string;
}

// Response types - Updated with consistent string types
export interface MessageResponse {
  _id: string;
  conversation_id: string;
  property_id: string;
  guest_id: string;
  sender_id: string;
  content: string;
  sent_at: string; // ISO string
  is_read: MessageStatus;
  reactions: MessageReaction[];
  reply_to?: ReplyTo | null;
}

export interface ToggleReactionResponse {
  action: "added" | "removed";
  message: MessageResponse;
}
