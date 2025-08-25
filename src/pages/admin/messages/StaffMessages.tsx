import { useEffect, useState, useRef, useCallback } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import messageService from "@/services/message.service";
import socketService from "@/services/socket.service";
import { processLastMessageFromUpdate } from "@/helper/message.helper";
import {
  MessageWithUI,
  ConversationUI,
  CreateMessageDto,
  ReactionType,
  ConversationUpdateV2,
  Participant,
} from "@/types/message";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Send,
  Smile,
  Reply,
  X,
  Trash2,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker from "emoji-picker-react";
import { format, isSameDay as dfIsSameDay } from "date-fns";
import { vi } from "date-fns/locale";

// Utility function to safely parse dates
const safeParseDate = (
  dateString: string | undefined,
  fallback: Date = new Date()
): Date => {
  if (!dateString) {
    console.warn("⚠️ [StaffMessages] Date string is undefined or null");
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("⚠️ [StaffMessages] Invalid date string:", dateString);
      return fallback;
    }
    return date;
  } catch (error) {
    console.error("❌ [StaffMessages] Error parsing date:", dateString, error);
    return fallback;
  }
};

function DayDivider({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center my-6">
      <span className="text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1 shadow-sm">
        {format(date, "d 'thg' M", { locale: vi })}
      </span>
    </div>
  );
}

// Helper function to get sender display name
function getSenderDisplayName(
  message: MessageWithUI,
  conversation: ConversationUI | null
): string {
  // First try from message UI
  if (
    message.ui?.sender_display_name &&
    message.ui.sender_display_name !== "Unknown"
  ) {
    return message.ui.sender_display_name;
  }

  // Then try to find from conversation participants
  if (conversation?.participants && message.sender_id) {
    const participant = conversation.participants.find(
      (p) => p._id === message.sender_id
    );
    if (participant?.name) {
      return participant.name;
    }
  }

  // Fallback based on role
  if (message.ui_for === "admin") return "Admin";
  if (message.ui_for === "staff") return "Staff";
  if (message.ui_for === "guest") return "Guest";

  return "Unknown User";
}

// Helper function to get sender avatar URL
function getSenderAvatarUrl(
  message: MessageWithUI,
  conversation: ConversationUI | null
): string {
  // First try from message UI
  if (message.ui?.sender_avatar_url) {
    return message.ui.sender_avatar_url;
  }

  // Then try to find from conversation participants
  if (conversation?.participants && message.sender_id) {
    const participant = conversation.participants.find(
      (p) => p._id === message.sender_id
    );
    if (participant?.avatar_url) {
      return participant.avatar_url;
    }
  }

  return "/placeholder.svg";
}

export default function StaffMessages() {
  const { user, token } = useAppSelector((state: RootState) => state.auth);

  // States
  const [conversations, setConversations] = useState<ConversationUI[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationUI | null>(null);
  const [messages, setMessages] = useState<MessageWithUI[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<MessageWithUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null
  );
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [readStatus, setReadStatus] = useState<{
    [conversationId: string]: boolean;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadConversationsTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<number | null>(null);
  const selectedConversationRef = useRef<ConversationUI | null>(null);

  // Update ref when selectedConversation changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const myId = user?._id;

  // Quick reactions
  const quickReactions: { emoji: string; type: ReactionType }[] = [
    { emoji: "👍", type: "like" },
    { emoji: "❤️", type: "love" },
    { emoji: "😂", type: "laugh" },
    { emoji: "😮", type: "wow" },
    { emoji: "😢", type: "sad" },
    { emoji: "😡", type: "angry" },
  ];

  // Load conversations for staff with debounce
  const loadConversations = useCallback(
    async (forceReload = false) => {
      // Debounce to prevent multiple calls
      if (loadConversationsTimeoutRef.current) {
        clearTimeout(loadConversationsTimeoutRef.current);
      }

      // If not force reload, debounce the call
      if (!forceReload) {
        loadConversationsTimeoutRef.current = window.setTimeout(() => {
          loadConversationsInternal();
        }, 300);
        return;
      }

      loadConversationsInternal();
    },
    [user?.role]
  );

  const loadConversationsInternal = useCallback(async () => {
    if (isLoadingConversations) {
      console.log(
        "🔄 [StaffMessages] Already loading conversations, skipping..."
      );
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    try {
      setIsLoadingConversations(true);
      const userRole = user?.role || "guest";
      console.log("🔄 [StaffMessages] Loading conversations for:", userRole);

      const data = await messageService.getConversations(
        userRole as "guest" | "staff" | "admin"
      );

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log("🔄 [StaffMessages] Request was aborted");
        return;
      }

      console.log("✅ [StaffMessages] Loaded", data.length, "conversations");
      setConversations(data);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("🔄 [StaffMessages] Request was aborted");
        return;
      }
      console.error("❌ [StaffMessages] Error loading conversations:", error);
    } finally {
      setIsLoadingConversations(false);
      abortControllerRef.current = null;
    }
  }, [user?.role, isLoadingConversations]);

  // Select conversation and load messages
  const selectConversation = useCallback(
    async (conversation: ConversationUI) => {
      try {
        console.log(
          "🎯 [StaffMessages] Selecting conversation:",
          conversation._id
        );
        console.log("🎯 [StaffMessages] Conversation data:", conversation);
        setSelectedConversation(conversation);
        setMessages([]);
        setHasMoreMessages(true);
        setIsLoadingMessages(true);

        console.log(
          "📨 [StaffMessages] Loading messages for conversation:",
          conversation._id
        );

        const userRole = user?.role || "guest";

        // Try to get messages from cache first
        const cachedMessages = socketService.getCachedMessages(
          conversation._id
        );
        if (cachedMessages.length > 0) {
          console.log(
            "📨 [StaffMessages] Using cached messages:",
            cachedMessages.length
          );
          setMessages(cachedMessages);
          setIsLoadingMessages(false);

          // Mark as read
          try {
            const readResponse = await messageService.markConversationAsRead(
              conversation._id
            );
            if (readResponse.ok) {
              setReadStatus((prev) => ({
                ...prev,
                [conversation._id]: true,
              }));
              console.log(
                "✅ [StaffMessages] Conversation marked as read:",
                conversation._id
              );
            }
          } catch (error) {
            console.error(
              "❌ [StaffMessages] Error marking conversation as read:",
              error
            );
          }
          return;
        }

        // Fallback to API call
        const data = await messageService.getConversationMessages(
          conversation._id,
          50,
          1,
          userRole as "guest" | "staff" | "admin"
        );
        console.log("📥 [StaffMessages] Messages data received:", data);
        console.log("📥 [StaffMessages] Messages count:", data.length);
        console.log("📥 [StaffMessages] First message:", data[0]);
        setMessages(data);

        // Mark as read
        try {
          const readResponse = await messageService.markConversationAsRead(
            conversation._id
          );
          if (readResponse.ok) {
            setReadStatus((prev) => ({
              ...prev,
              [conversation._id]: true,
            }));
            console.log(
              "✅ [StaffMessages] Conversation marked as read:",
              conversation._id
            );
          }
        } catch (error) {
          console.error(
            "❌ [StaffMessages] Error marking conversation as read:",
            error
          );
        }
      } catch (error: any) {
        console.error(
          "❌ [StaffMessages] Error selecting conversation:",
          error
        );
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [user?.role]
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) {
      return;
    }

    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      const messageData: CreateMessageDto = {
        conversation_id: selectedConversation._id,
        content: content,
        reply_to_message_id: replyingTo?._id,
      };

      const newMessage = await messageService.sendMessage(messageData);
      console.log("✅ [StaffMessages] Message sent successfully:", newMessage);

      // Convert MessageResponse to MessageWithUI
      const userRole = user?.role || "guest";
      const messageWithUI: MessageWithUI = {
        ...newMessage,
        ui_for: userRole as "guest" | "staff" | "admin",
        ui: {
          mine: true,
          show_sender_meta: false,
          sender_display_name: user?.name || "Staff",
          sender_avatar_url: user?.avatar_url || null,
        },
      };

      // Add the message to state with a temporary ID - when the socket update arrives,
      // it will either replace or keep this one
      messageWithUI._id = messageWithUI._id || `temp-${Date.now()}`;
      setMessages((prev) => [...prev, messageWithUI]);

      setReplyingTo(null);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        }
      }, 200);
    } catch (error: any) {
      console.error("❌ [StaffMessages] Error sending message:", error);
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  }, [messageInput, selectedConversation, replyingTo, isSending, user]);

  // Toggle reaction
  const toggleReaction = useCallback(
    async (messageId: string, type: ReactionType) => {
      try {
        const response = await messageService.toggleReaction(messageId, type);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...response.message,
                  ui_for: msg.ui_for,
                  ui: msg.ui,
                }
              : msg
          )
        );
      } catch (error: any) {
        console.error("❌ [StaffMessages] Error toggling reaction:", error);
      }
    },
    []
  );

  // Reply to message
  const replyToMessage = useCallback((message: MessageWithUI) => {
    setReplyingTo(message);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageInput(e.target.value);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";
      }
    },
    []
  );

  const handleEmojiSelect = useCallback((emojiObject: any) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  // Setup Socket.IO connection and event listeners
  useEffect(() => {
    if (!token || !myId) {
      return;
    }

    // Get user role from Redux
    const userRole = user?.role || "guest";
    const isAdminOrStaff = userRole === "admin" || userRole === "staff";

    console.log(
      "🟢 [StaffMessages] Setting up socket connection for:",
      userRole
    );
    socketService.connect(token, myId, userRole);

    // Setup all realtime event listeners
    const setupRealtimeListeners = () => {
      const handleNewMessage = (message: MessageWithUI) => {
        console.log("📨 [StaffMessages] Received new message:", message._id);
        console.log("📨 [StaffMessages] Message content:", message.content);
        console.log("📨 [StaffMessages] Message sender role:", message.ui_for);
        console.log("📨 [StaffMessages] Current user role:", userRole);
        console.log("📨 [StaffMessages] Message UI data:", message.ui);
        console.log(
          "📨 [StaffMessages] Sender display name:",
          message.ui?.sender_display_name
        );
        console.log(
          "📨 [StaffMessages] Message conversation_id:",
          message.conversation_id
        );
        console.log(
          "📨 [StaffMessages] Selected conversation ID:",
          selectedConversation?._id
        );
        console.log("🔍 [StaffMessages] Full message object:", message);

        // Update conversations list
        setConversations((prev) => {
          const updated = [...prev];
          const convIndex = updated.findIndex(
            (c) => c._id === message.conversation_id
          );

          if (convIndex >= 0) {
            // Update existing conversation
            updated[convIndex] = {
              ...updated[convIndex],
              lastMessage: {
                _id: message._id,
                content: message.content,
                sender_id: message.sender_id,
                sender_role: message.ui_for,
                sent_at: message.sent_at,
                is_read: message.is_read,
              },
              lastMessageAt: message.sent_at,
              messageCount: (updated[convIndex].messageCount || 0) + 1,
              display: {
                ...updated[convIndex].display,
                subtitle: `Người gửi cuối: ${message.content}`,
                unreadCount: message.ui?.mine
                  ? 0
                  : (updated[convIndex].display.unreadCount || 0) + 1,
              },
            };

            // Move updated conversation to top
            const updatedConv = updated.splice(convIndex, 1)[0];
            updated.unshift(updatedConv);
          }

          return updated;
        });

        // Update messages if conversation is selected
        if (selectedConversationRef.current?._id === message.conversation_id) {
          setMessages((prev) => {
            const messageExists = prev.some((m) => m._id === message._id);
            if (messageExists) {
              // Update existing message instead of ignoring
              return prev.map((m) =>
                m._id === message._id ? { ...m, ...message } : m
              );
            }

            const newMessages = [...prev, message].sort((a, b) => {
              const dateA = new Date(a.sent_at).getTime();
              const dateB = new Date(b.sent_at).getTime();
              return dateA - dateB;
            });

            return newMessages;
          });
        }
      };

      const handleConversationUpdate = (data: ConversationUpdateV2) => {
        console.log("💬 [StaffMessages] Received conversation update:", data);
        console.log(
          "💬 [StaffMessages] Update type:",
          data.isAdminUpdate ? "admin" : "regular"
        );

        // Rate limiting - prevent too frequent updates (max 200ms)
        const now = Date.now();
        if (now - lastUpdateTimeRef.current < 200) {
          console.log("⏳ [StaffMessages] Rate limiting - skipping update");
          return;
        }
        lastUpdateTimeRef.current = now;

        // Skip update if currently loading conversations to prevent race conditions
        if (isLoadingConversations) {
          console.log(
            "⏳ [StaffMessages] Skipping conversation update - currently loading"
          );
          return;
        }

        // Instead of making API call, just log that we received an update
        // and rely on new_message events to update the actual message list
        if (
          data.lastMessageAt &&
          selectedConversationRef.current?._id === data.conversationId
        ) {
          console.log(
            "� [StaffMessages] Received update for current conversation, waiting for new_message event"
          );
        }

        // Instead of reloading all conversations, just update the specific one
        setConversations((prev) => {
          const updated = [...prev];
          const convIndex = updated.findIndex(
            (c) => c._id === data.conversationId
          );

          if (convIndex >= 0) {
            // Update the existing conversation
            updated[convIndex] = {
              ...updated[convIndex],
              lastMessage: data.lastMessage
                ? {
                    _id: data.lastMessage._id || "",
                    content: data.lastMessage.content || "",
                    sender_id: data.lastMessage.sender_id || "",
                    sender_role: data.lastMessage.sender_role || "guest",
                    sent_at:
                      data.lastMessage.sent_at ||
                      data.lastMessageAt ||
                      new Date().toISOString(),
                    is_read: data.lastMessage.is_read || "sent",
                  }
                : updated[convIndex].lastMessage,
              lastMessageAt: data.lastMessageAt,
              display: {
                ...updated[convIndex].display,
                subtitle: data.lastMessage?.content
                  ? `Người gửi cuối: ${data.lastMessage.content}`
                  : updated[convIndex].display.subtitle,
                unreadCount: data.unreadCount || 0,
              },
            };

            // Move updated conversation to top if it has a new message
            if (data.lastMessage && data.lastMessage.content) {
              const updatedConv = updated.splice(convIndex, 1)[0];
              updated.unshift(updatedConv);
            }
          }

          return updated;
        });
      };

      const handleConversationUpdateV2 = (
        conversationUpdate: ConversationUpdateV2
      ) => {
        console.log("✅ [CHECKLIST] Nhận được 'conversation_update_v2' event");
        console.log(
          "🔄 [StaffMessages] Received conversation_update_v2:",
          conversationUpdate
        );
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationUpdate.conversationId
              ? {
                  ...conv,
                  lastMessage: conversationUpdate.lastMessage,
                  lastMessageAt: conversationUpdate.lastMessageAt,
                  unreadCount: conversationUpdate.unreadCount,
                }
              : conv
          )
        );
      };

      const handleReactionUpdate = (message: MessageWithUI) => {
        console.log(
          "😀 [StaffMessages] Received reaction update:",
          message._id
        );
        if (selectedConversationRef.current?._id === message.conversation_id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === message._id
                ? {
                    ...message,
                    ui_for: msg.ui_for,
                    ui: msg.ui,
                  }
                : msg
            )
          );
        }
      };

      const handleMessageRecall = (message: MessageWithUI) => {
        console.log("🗑️ [StaffMessages] Received message recall:", message._id);
        if (selectedConversationRef.current?._id === message.conversation_id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === message._id
                ? {
                    ...message,
                    ui_for: msg.ui_for,
                    ui: msg.ui,
                  }
                : msg
            )
          );
        }
      };

      const handleConversationListUpdate = (data: ConversationUpdateV2) => {
        console.log(
          "📋 [StaffMessages] Received conversation list update:",
          data
        );

        // Rate limiting for conversation list updates
        const now = Date.now();
        if (now - lastUpdateTimeRef.current < 1000) {
          console.log(
            "⏳ [StaffMessages] Rate limiting - skipping conversation list update"
          );
          return;
        }
        lastUpdateTimeRef.current = now;

        // Update specific conversation in the list
        setConversations((prev) => {
          const updated = [...prev];
          const convIndex = updated.findIndex(
            (c) => c._id === data.conversationId
          );

          if (convIndex >= 0) {
            // Update existing conversation
            updated[convIndex] = {
              ...updated[convIndex],
              lastMessage: data.lastMessage
                ? {
                    _id: data.lastMessage._id || "",
                    content: data.lastMessage.content || "",
                    sender_id: data.lastMessage.sender_id || "",
                    sender_role: data.lastMessage.sender_role || "guest",
                    sent_at:
                      data.lastMessage.sent_at ||
                      data.lastMessageAt ||
                      new Date().toISOString(),
                    is_read: data.lastMessage.is_read || "sent",
                  }
                : updated[convIndex].lastMessage,
              lastMessageAt: data.lastMessageAt,
              display: {
                ...updated[convIndex].display,
                subtitle: data.lastMessage?.content
                  ? `Người gửi cuối: ${data.lastMessage.content}`
                  : updated[convIndex].display.subtitle,
                unreadCount: data.unreadCount || 0,
              },
            };

            // Move updated conversation to top if it has a new message
            if (data.lastMessage && data.lastMessage.content) {
              const updatedConv = updated.splice(convIndex, 1)[0];
              updated.unshift(updatedConv);
            }
          }

          return updated;
        });
      };

      // Register all event listeners
      socketService.onNewMessage(handleNewMessage);
      socketService.onConversationUpdate(handleConversationUpdate);
      socketService.onReactionUpdate(handleReactionUpdate);
      socketService.onMessageRecall(handleMessageRecall);
      socketService.onConversationUpdateV2(handleConversationUpdateV2);
      socketService.onConversationListUpdate(handleConversationListUpdate);
    };

    // Setup realtime listeners
    setupRealtimeListeners();

    // Force join admin_broadcast room for admin/staff
    if (isAdminOrStaff) {
      console.log(
        "👑 [StaffMessages] Joining admin_broadcast room for:",
        userRole
      );
      setTimeout(() => {
        // Test connection first
        socketService.testConnection();

        // Then emit test message
        socketService.emitTestMessage("admin_broadcast_join");
        socketService.debugEventListeners();
        console.log(
          "🔍 [StaffMessages] Socket status:",
          socketService.getConnectionStatus()
        );
      }, 1000);
    }

    return () => {
      console.log("🧹 [StaffMessages] Cleaning up socket event listeners");
    };
  }, [token, myId, user?.role]);

  // Initialize conversations
  useEffect(() => {
    if (token && user) {
      console.log(
        "🚀 [StaffMessages] Initializing conversations for staff:",
        user.name
      );
      loadConversations(true); // Force reload on initial load
    }
  }, [token, user?.role]); // Remove loadConversations from deps to prevent loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      console.log("🧹 [StaffMessages] Cleanup completed");
    };
  }, []);

  // Auto-scroll when new messages are received
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id !== myId) {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest",
            });
          }
        }, 50);
      }
    }
  }, [messages.length, selectedConversation, myId]);

  // Scroll to bottom when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && !isLoading) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        }
      }, 150);
    }
  }, [selectedConversation?._id, messages.length, isLoading]);

  if (!myId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[800px] bg-background justify-center mt-6 mb-6"
      style={{ scrollBehavior: "auto" }}
    >
      <div className="flex w-full max-w-[1450px] h-full overflow-hidden rounded-lg shadow-lg">
        {/* Sidebar */}
        <div className="w-100 bg-card border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
            <h1 className="text-[17px] font-semibold text-foreground">
              Tin nhắn của nhân viên
            </h1>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full h-8 px-3 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full h-8 px-3 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
              >
                Chưa đọc
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {isLoadingConversations ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 rounded bg-gray-200 mb-2" />
                        <div className="h-3 rounded bg-gray-200 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có cuộc hội thoại nào được gán
                  </p>
                </div>
              ) : (
                conversations.map((c: ConversationUI) => (
                  <button
                    key={c._id}
                    onClick={() => selectConversation(c)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition
                      ${
                        selectedConversation?._id === c._id
                          ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                          : "bg-transparent"
                      } hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] focus:outline-none`}
                  >
                    <Avatar className="h-12 w-12 ring-1 ring-gray-200">
                      <AvatarImage
                        src={
                          c.guest?.avatar_url ||
                          c.property?.thumbnail ||
                          c.display.avatar_url ||
                          "/placeholder.svg"
                        }
                        alt={
                          c.guest?.name || c.property?.name || c.display.title
                        }
                      />
                      <AvatarFallback>
                        {(
                          c.guest?.name ||
                          c.property?.name ||
                          c.display.title
                        )?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate text-foreground">
                          {c.guest?.name || c.property?.name || c.display.title}
                        </h3>
                        {c.lastMessage && (
                          <span className="text-[11px] text-muted-foreground">
                            {format(
                              safeParseDate(c.lastMessage.sent_at),
                              "HH:mm"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {c.lastMessage?.content || "Chưa có tin nhắn"}
                        </p>
                        {c.display.unreadCount > 0 && (
                          <span className="text-[11px] px-2 py-[2px] rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            {c.display.unreadCount > 99
                              ? "99+"
                              : c.display.unreadCount}
                          </span>
                        )}
                      </div>
                      {c.property && (
                        <div className="mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs border border-gray-200"
                          >
                            🏠 {c.property.name}
                          </Badge>
                        </div>
                      )}

                      {/* Participants info */}
                      {c.participants && c.participants.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] text-muted-foreground">
                              Participants:
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {c.participant_count || c.participants.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {c.participants
                              .slice(0, 3)
                              .map((participant: Participant, idx: number) => (
                                <div
                                  key={participant._id}
                                  className="flex items-center gap-1"
                                >
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={
                                        participant.avatar_url ||
                                        "/placeholder.svg"
                                      }
                                      alt={participant.name}
                                    />
                                    <AvatarFallback className="text-[8px]">
                                      {participant.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px] text-muted-foreground">
                                    {participant.name}
                                  </span>
                                  <span className="text-[8px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {participant.role === "admin" && "👑"}
                                    {participant.role === "staff" && "👨‍💼"}
                                    {participant.role === "guest" && "👤"}
                                  </span>
                                  {idx <
                                    Math.min(
                                      2,
                                      (c.participants?.length || 0) - 1
                                    ) && (
                                    <span className="text-[8px] text-muted-foreground">
                                      •
                                    </span>
                                  )}
                                </div>
                              ))}
                            {c.participants && c.participants.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{c.participants.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="h-19 px-6 flex items-center justify-between bg-card border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-1 ring-gray-200">
                    <AvatarImage
                      src={
                        selectedConversation.guest?.avatar_url ||
                        selectedConversation.property?.thumbnail ||
                        selectedConversation.display?.avatar_url ||
                        "/placeholder.svg"
                      }
                      alt={
                        selectedConversation.guest?.name ||
                        selectedConversation.property?.name ||
                        selectedConversation.display?.title
                      }
                    />
                    <AvatarFallback>
                      {(
                        selectedConversation.guest?.name ||
                        selectedConversation.property?.name ||
                        selectedConversation.display?.title
                      )?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate text-foreground">
                      {selectedConversation.guest?.name ||
                        selectedConversation.display?.title}
                    </div>
                    {selectedConversation.property && (
                      <div className="text-sm text-muted-foreground truncate">
                        🏠 {selectedConversation.property.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea
                className="flex-1 min-h-0"
                style={{ scrollBehavior: "smooth" }}
                data-radix-scroll-area-viewport
              >
                <div
                  className="px-6 py-4 max-w-4xl mx-auto"
                  style={{ scrollBehavior: "auto" }}
                >
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Đang tải tin nhắn...
                      </p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Chưa có tin nhắn nào (messages.length: {messages.length}
                        )
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const blocks: React.ReactNode[] = [];
                      let lastDate: Date | null = null;

                      // Messages are now in chronological order (oldest to newest)
                      console.log(
                        "🎨 [StaffMessages] Rendering messages, count:",
                        messages.length
                      );
                      console.log(
                        "🎨 [StaffMessages] Messages state:",
                        messages
                      );
                      const uniqueMessages = messages.filter(
                        (m, index, self) =>
                          index === self.findIndex((msg) => msg._id === m._id)
                      );

                      uniqueMessages.forEach(
                        (m: MessageWithUI, idx: number) => {
                          // Use safe date parsing to prevent "Invalid time value" errors
                          const sentAt = safeParseDate(m.sent_at);

                          if (!lastDate || !dfIsSameDay(lastDate, sentAt)) {
                            blocks.push(
                              <DayDivider key={`d-${idx}`} date={sentAt} />
                            );
                            lastDate = sentAt;
                          }

                          const isMine = m.ui?.mine ?? m.sender_id === myId;
                          const showSenderMeta =
                            m.ui?.show_sender_meta ?? !isMine;

                          blocks.push(
                            <div
                              key={`${m._id}-${idx}`}
                              className={`mb-3 flex ${
                                isMine ? "justify-end" : "justify-start"
                              } gap-2`}
                            >
                              {/* avatar người kia */}
                              {!isMine && showSenderMeta ? (
                                <Avatar className="h-8 w-8 mt-5">
                                  <AvatarImage
                                    src={getSenderAvatarUrl(
                                      m,
                                      selectedConversation
                                    )}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getSenderDisplayName(
                                      m,
                                      selectedConversation
                                    )?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="w-8" />
                              )}

                              <div
                                className={`max-w-[72%] ${isMine ? "" : ""}`}
                              >
                                {/* meta giờ */}
                                <div
                                  className={`mb-1 ${
                                    isMine ? "text-right" : "text-left"
                                  }`}
                                >
                                  {!isMine && showSenderMeta && (
                                    <span className="text-[13px] font-medium">
                                      {getSenderDisplayName(
                                        m,
                                        selectedConversation
                                      )}
                                    </span>
                                  )}
                                  <span
                                    className={`text-[11px] text-muted-foreground ${
                                      !isMine && showSenderMeta ? "ml-2" : ""
                                    }`}
                                  >
                                    {format(sentAt, "HH:mm")}
                                    {isMine &&
                                      readStatus[selectedConversation._id] && (
                                        <span className="ml-1 text-blue-500">
                                          ✓
                                        </span>
                                      )}
                                  </span>
                                  {!isMine && (
                                    <span className="text-[10px] ml-1 px-1 py-0.5 rounded bg-gray-100 text-gray-600">
                                      {m.ui_for === "admin" && "👑"}
                                      {m.ui_for === "staff" && "👨‍💼"}
                                      {m.ui_for === "guest" && "👤"}
                                    </span>
                                  )}
                                </div>

                                {/* reply preview */}
                                {m.reply_to && !m.is_recalled && (
                                  <div
                                    className={`mb-2 rounded-xl border border-gray-200 bg-gray-50 p-2`}
                                  >
                                    <div className="text-[11px] text-muted-foreground">
                                      Trả lời{" "}
                                      {m.reply_to.sender_name || "Unknown"}
                                    </div>
                                    <div className="text-sm line-clamp-2 text-foreground">
                                      {(m.reply_to.content || "").length > 80
                                        ? `${(m.reply_to.content || "").slice(
                                            0,
                                            80
                                          )}...`
                                        : m.reply_to.content || ""}
                                    </div>
                                  </div>
                                )}

                                {/* bubble */}
                                <div
                                  className={[
                                    "group relative px-4 py-3 rounded-2xl shadow-sm border",
                                    m.is_recalled
                                      ? "bg-gray-100 border-gray-200 text-gray-500 italic"
                                      : isMine
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "bg-white border-gray-200",
                                  ].join(" ")}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {m.content || ""}
                                  </p>

                                  {!m.is_recalled && (
                                    <div
                                      className={`absolute top-2 ${
                                        isMine
                                          ? "left-[-70px]"
                                          : "right-[-70px]"
                                      } opacity-0 group-hover:opacity-100 transition`}
                                    >
                                      <div className="flex gap-1">
                                        <DropdownMenu
                                          open={showReactionPicker === m._id}
                                          onOpenChange={(o) =>
                                            setShowReactionPicker(
                                              o ? m._id : null
                                            )
                                          }
                                        >
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-8 w-8 rounded-full p-0 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                                            >
                                              <Smile className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent className="p-2">
                                            <div className="flex gap-1">
                                              {quickReactions.map(
                                                ({
                                                  emoji,
                                                  type,
                                                }: {
                                                  emoji: string;
                                                  type: ReactionType;
                                                }) => (
                                                  <Button
                                                    key={type}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-lg hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                                                    onClick={() =>
                                                      toggleReaction(
                                                        m._id,
                                                        type
                                                      )
                                                    }
                                                  >
                                                    {emoji}
                                                  </Button>
                                                )
                                              )}
                                            </div>
                                          </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-8 w-8 rounded-full p-0 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                                            >
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent
                                            align={isMine ? "start" : "end"}
                                          >
                                            {isMine ? (
                                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Thu hồi
                                              </DropdownMenuItem>
                                            ) : (
                                              <>
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    replyToMessage(m)
                                                  }
                                                >
                                                  <Reply className="h-4 w-4 mr-2" />
                                                  Trả lời
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-blue-600 focus:text-blue-600">
                                                  <User className="h-4 w-4 mr-2" />
                                                  Xem thông tin người dùng
                                                </DropdownMenuItem>
                                              </>
                                            )}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* reactions */}
                                {!m.is_recalled &&
                                  m.reactions &&
                                  m.reactions.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                      {Object.entries(
                                        m.reactions.reduce((acc, r) => {
                                          const k = r.type;
                                          (acc[k] ||= []).push(r);
                                          return acc;
                                        }, {} as Record<string, typeof m.reactions>)
                                      ).map(([type, rs]) => {
                                        const me = rs.some(
                                          (r) => r.userId === myId
                                        );
                                        const emoji = rs[0]?.emoji || "👍";
                                        return (
                                          <button
                                            key={type}
                                            onClick={() =>
                                              toggleReaction(
                                                m._id,
                                                type as ReactionType
                                              )
                                            }
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition
                                        ${
                                          me
                                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                            : "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                          >
                                            <span>{emoji}</span>
                                            {rs.length > 1 && (
                                              <span className="font-medium">
                                                {rs.length}
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                              </div>
                            </div>
                          );
                        }
                      );

                      blocks.push(<div key="end" ref={messagesEndRef} />);
                      return blocks;
                    })()
                  )}
                </div>
              </ScrollArea>

              {/* Composer */}
              <div className="border-t border-gray-200 bg-card/90 backdrop-blur flex-shrink-0">
                <div className="max-w-4xl mx-auto px-6 py-4">
                  {replyingTo && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Reply className="h-4 w-4 text-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Đang trả lời{" "}
                            {getSenderDisplayName(
                              replyingTo,
                              selectedConversation
                            )}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelReply}
                          className="h-6 w-6 p-0 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(replyingTo.content || "").length > 100
                          ? `${(replyingTo.content || "").substring(0, 100)}...`
                          : replyingTo.content || ""}
                      </div>
                    </div>
                  )}

                  <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Soạn tin nhắn..."
                        className="min-h-[80px] max-h-[150px] resize-none pr-24 rounded-xl
                          border border-gray-200 
                          bg-white
                          shadow-sm
                          transition-all
                          duration-200
                          placeholder:text-gray-400
                          focus:border-blue-400
                          focus:ring-2 
                          focus:ring-blue-100
                          focus:outline-none
                          hover:border-gray-300
                          active:border-blue-500
                          disabled:bg-gray-50
                          disabled:text-gray-500
                          disabled:border-gray-200
                          disabled:shadow-none"
                        rows={1}
                        autoFocus={false}
                        onFocus={(e) => {
                          // Prevent auto-scroll on focus
                          e.target.scrollIntoView = () => {};
                        }}
                        onBlur={(e) => {
                          // Prevent auto-scroll on blur
                          e.target.scrollIntoView = () => {};
                        }}
                      />
                      <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-full hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={sendMessage}
                          disabled={!messageInput.trim() || isSending}
                          className="h-9 w-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600 transition"
                          title="Gửi"
                        >
                          {isSending ? (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                              />
                            </svg>
                          ) : (
                            <Send className="h-4 w-4 text-white" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-[72px] right-6 z-50">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
                          <EmojiPicker
                            onEmojiClick={handleEmojiSelect}
                            width={320}
                            height={400}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  Chọn một cuộc hội thoại
                </h2>
                <p className="text-muted-foreground">
                  Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu nhắn
                  tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
