// Thêm logic xử lý lastMessage cho StaffMessages.tsx

import { MessageWithUI, ConversationUI } from "@/types/message";

/**
 * Hàm xử lý dữ liệu từ conversation_update event
 * Chuyển đổi lastMessage thành MessageWithUI nếu có thể
 */
export function processLastMessageFromUpdate(
  data: any,
  selectedConversation: ConversationUI | null,
  myId: string,
  userRole: string
): MessageWithUI | null {
  // Nếu không có lastMessage hoặc không khớp conversation, trả về null
  if (
    !data.lastMessage ||
    typeof data.lastMessage !== "object" ||
    !selectedConversation ||
    selectedConversation._id !== data.conversationId
  ) {
    return null;
  }

  console.log(
    "💬 [MessageHelper] Processing lastMessage from conversation_update:",
    data.lastMessage
  );

  // Convert lastMessage to MessageWithUI format
  const messageWithUI: MessageWithUI = {
    _id: data.lastMessage._id || `temp-${Date.now()}`,
    conversation_id: data.conversationId,
    property_id: "",
    guest_id: "",
    content: data.lastMessage.content || "",
    sender_id: data.lastMessage.sender_id || "",
    sent_at:
      data.lastMessage.sent_at ||
      data.lastMessageAt ||
      new Date().toISOString(),
    is_read: data.lastMessage.is_read || "sent",
    reactions: [],
    ui_for: userRole as "guest" | "staff" | "admin",
    ui: {
      mine: data.lastMessage.sender_id === myId,
      show_sender_meta: true,
      sender_display_name: "Unknown User", // Default value
      sender_avatar_url: null,
    },
  };

  return messageWithUI;
}

/**
 * Hàm xử lý sender_id từ API response
 * Backend có thể trả về sender_id là object hoặc string
 */
export function processSenderId(senderId: any): {
  id: string;
  name: string;
  avatar_url: string | null;
} {
  if (typeof senderId === "object" && senderId !== null) {
    return {
      id: senderId._id || senderId.id || "",
      name: senderId.name || "Unknown",
      avatar_url: senderId.avatar_url || null,
    };
  }

  return {
    id: senderId || "",
    name: "Unknown",
    avatar_url: null,
  };
}

/**
 * Hàm xử lý message để đảm bảo UI data đúng
 */
export function processMessageUI(
  message: any,
  currentUserId: string
): MessageWithUI {
  // Process sender_id
  const senderInfo = processSenderId(message.sender_id);

  // Determine if message is mine
  const isMine =
    message.ui?.mine !== undefined
      ? message.ui.mine
      : senderInfo.id === currentUserId;

  // Debug logging for ownership determination
  console.log("🔍 [MessageHelper] Ownership determination:", {
    messageId: message._id,
    originalSenderId: message.sender_id,
    processedSenderId: senderInfo.id,
    currentUserId: currentUserId,
    uiMine: message.ui?.mine,
    senderInfoId: senderInfo.id,
    isEqual: senderInfo.id === currentUserId,
    finalIsMine: isMine,
  });

  // Process UI data
  const ui = message.ui || {};

  // Debug logging
  console.log("🔍 [MessageHelper] Processing message:", {
    messageId: message._id,
    originalSenderDisplayName: ui.sender_display_name,
    senderInfoName: senderInfo.name,
    senderId: message.sender_id,
    processedSenderId: senderInfo.id,
  });

  const finalSenderDisplayName =
    ui.sender_display_name && ui.sender_display_name !== "Unknown"
      ? ui.sender_display_name
      : senderInfo.name;

  console.log(
    "🔍 [MessageHelper] Final sender display name:",
    finalSenderDisplayName
  );

  return {
    ...message,
    sender_id: senderInfo.id,
    ui: {
      mine: isMine,
      show_sender_meta:
        ui.show_sender_meta !== undefined ? ui.show_sender_meta : !isMine,
      sender_display_name: finalSenderDisplayName,
      sender_avatar_url: ui.sender_avatar_url || senderInfo.avatar_url,
    },
  };
}

/**
 * Hàm xử lý danh sách messages để đảm bảo tất cả đều có UI data đúng
 */
export function processMessagesList(
  messages: any[],
  currentUserId: string
): MessageWithUI[] {
  return messages.map((message) => processMessageUI(message, currentUserId));
}
