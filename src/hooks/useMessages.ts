import { useEffect, useState, useRef, useCallback } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import messageService from "@/services/message.service";
import socketService from "@/services/socket.service";
import {
  MessageWithUI,
  ConversationUI,
  CreateMessageDto,
  ReactionType,
  ConversationUpdateV2,
} from "@/types/message";

export const useMessages = () => {
  const { user, token } = useAppSelector((state: RootState) => state.auth);

  // States
  const [conversations, setConversations] = useState<ConversationUI[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationUI | null>(null);
  const [messages, setMessages] = useState<MessageWithUI[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<MessageWithUI | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const userRole = messageService.getUserRole();
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

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const data = await messageService.getConversations(userRole);
      setConversations(data);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [userRole, token, myId]);

  // Select conversation and load messages
  const selectConversation = useCallback(
    async (conversation: ConversationUI) => {
      try {
        setSelectedConversation(conversation);
        setMessages([]);
        setHasMoreMessages(true);
        setIsLoading(true);

        const data = await messageService.getConversationMessages(
          conversation._id,
          50,
          1,
          userRole
        );
        // Don't reverse - keep messages in chronological order (oldest to newest)
        setMessages(data);

        // Mark as read
        await messageService.markConversationAsRead(conversation._id);

        // Remove auto-scroll - let user control scroll position
        // setTimeout(() => {
        //   if (messagesEndRef.current) {
        //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        //   }
        // }, 300);
      } catch (error: any) {
        console.error("Error selecting conversation:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userRole]
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) {
      console.log("🚫 [useMessages] Cannot send message:", {
        hasContent: !!messageInput.trim(),
        hasConversation: !!selectedConversation,
        isSending,
      });
      return;
    }

    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    console.log("📤 [useMessages] Sending message:", content);
    console.log("📤 [useMessages] To conversation:", selectedConversation._id);

    try {
      const messageData: CreateMessageDto = {
        conversation_id: selectedConversation._id,
        content: content,
        reply_to_message_id: replyingTo?._id,
      };

      const newMessage = await messageService.sendMessage(messageData);
      console.log("✅ [useMessages] Message sent successfully:", newMessage);

      // Check if message already exists to prevent duplicates
      const messageExists = messages.some((m) => m._id === newMessage._id);
      if (messageExists) {
        console.log(
          "⚠️ [useMessages] Message already exists, skipping UI update"
        );
        setReplyingTo(null);
        return;
      }

      // Convert MessageResponse to MessageWithUI for consistency
      const messageWithUI: MessageWithUI = {
        ...newMessage,
        ui_for: userRole,
        ui: {
          mine: true,
          show_sender_meta: false,
          sender_display_name: user?.name || "You",
          sender_avatar_url: user?.avatar_url || null,
        },
      };

      setMessages((prev) => {
        // Check for duplicates before adding
        const exists = prev.some((m) => m._id === messageWithUI._id);
        if (exists) {
          console.log("⚠️ [useMessages] Message already in state, not adding");
          return prev;
        }
        return [...prev, messageWithUI];
      });

      setReplyingTo(null);

      // Only auto-scroll when sending a new message with controlled timing
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
      console.error("❌ [useMessages] Error sending message:", error);
      // Restore message input on error
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  }, [
    messageInput,
    selectedConversation,
    replyingTo,
    isSending,
    userRole,
    user,
    messages,
  ]);

  // Toggle reaction
  const toggleReaction = useCallback(
    async (messageId: string, type: ReactionType) => {
      try {
        console.log("🎯 [useMessages] Toggling reaction:", messageId, type);

        // Optimistic update - update UI immediately for better UX
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  reactions: msg.reactions || [],
                }
              : msg
          )
        );

        const response = await messageService.toggleReaction(messageId, type);
        console.log("✅ [useMessages] Reaction toggle response:", response);

        // Update message in local state with proper UI properties
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

        // Also update conversation list to reflect reaction changes
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.lastMessage?._id === messageId) {
              return {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  reactions: response.message.reactions,
                },
              };
            }
            return conv;
          })
        );

        console.log("🔄 [useMessages] Updated message with new reactions");
      } catch (error: any) {
        console.error("❌ [useMessages] Error toggling reaction:", error);

        // Revert optimistic update on error
        console.log(
          "🔄 [useMessages] Reverting optimistic update due to error"
        );
        // You could add a toast notification here to inform the user
      }
    },
    []
  );

  // Recall message
  const recallMessage = useCallback(async (messageId: string) => {
    try {
      const updatedMessage = await messageService.recallMessage(messageId);

      // Update message in local state - convert MessageResponse to MessageWithUI
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...updatedMessage,
                ui_for: msg.ui_for,
                ui: msg.ui,
              }
            : msg
        )
      );
    } catch (error: any) {
      console.error("Error recalling message:", error);
    }
  }, []);

  // Reply to message
  const replyToMessage = useCallback((message: MessageWithUI) => {
    setReplyingTo(message);
    setShowEmojiPicker(false);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emojiObject: { emoji: string }) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
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

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }, 100);
  }, []);

  // Auto-scroll when new messages are received from other users
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const lastMessage = messages[messages.length - 1];
      // Only auto-scroll if the last message is from someone else (not the current user)
      // and if we're already near the bottom of the conversation
      if (lastMessage && lastMessage.sender_id !== myId) {
        // Check if user is near the bottom before auto-scrolling
        const scrollArea = document.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollArea) {
          const { scrollTop, scrollHeight, clientHeight } = scrollArea;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          if (isNearBottom) {
            // Use a more controlled scroll approach
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
      }
    }
  }, [messages.length, selectedConversation, myId]);

  // Scroll to bottom when conversation is selected and messages are loaded
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && !isLoading) {
      // Small delay to ensure messages are rendered
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

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || isLoading || !hasMoreMessages) return;

    try {
      setIsLoading(true);

      const currentPage = Math.ceil(messages.length / 50) + 1;
      const newMessages = await messageService.getConversationMessages(
        selectedConversation._id,
        50,
        currentPage,
        userRole as "guest" | "staff"
      );

      if (newMessages.length < 50) {
        setHasMoreMessages(false);
      }

      // Add new messages to the beginning (for pagination) - these are older messages
      setMessages((prev) => [...newMessages, ...prev]);
    } catch (error: any) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedConversation,
    messages.length,
    isLoading,
    hasMoreMessages,
    userRole,
  ]);

  // Setup Socket.IO connection and event listeners
  useEffect(() => {
    if (!token || !myId) {
      console.log(
        "🔴 [useMessages] Missing token or myId, skipping socket setup"
      );
      return;
    }

    console.log("🟢 [useMessages] Setting up socket connection...");
    console.log("🔍 [useMessages] Token length:", token.length);
    console.log("🔍 [useMessages] User ID:", myId);
    console.log("🔍 [useMessages] User role:", userRole);

    // Connect to socket service
    socketService.connect(token, myId);

    // Note: Room joining is handled automatically by server based on auth token
    console.log("✅ [CHECKLIST] Socket connection setup complete");

    // Connect to notifications
    socketService.connectNotification(token, myId);

    // Setup event listeners
    const handleNewMessage = (message: MessageWithUI) => {
      console.log("✅ [CHECKLIST] UI update khi nhận new message");
      console.log(
        "📨 [useMessages] Received new message:",
        message._id,
        "for conversation:",
        message.conversation_id,
        "from sender:",
        message.sender_id,
        "current user:",
        myId
      );

      // Update conversations list if message is for current user
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
              sender_role: "guest" as const,
              sent_at: message.sent_at,
              is_read: message.is_read,
            },
            messageCount: (updated[convIndex].messageCount || 0) + 1,
            display: {
              ...updated[convIndex].display,
              unreadCount: (updated[convIndex].display.unreadCount || 0) + 1,
            },
          };
        } else {
          console.log(
            "🔄 [useMessages] Conversation not found, reloading conversations..."
          );
          loadConversations();
        }

        return updated;
      });

      // Update messages if conversation is selected
      if (selectedConversation?._id === message.conversation_id) {
        console.log(
          "✅ [useMessages] Updating messages for selected conversation"
        );
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some((m) => m._id === message._id);
          if (messageExists) {
            console.log("⚠️ [useMessages] Message already exists, skipping");
            return prev;
          }
          console.log("➕ [useMessages] Adding new message to conversation");

          // Add message and sort by sent_at to maintain chronological order
          const newMessages = [...prev, message].sort((a, b) => {
            const dateA = new Date(a.sent_at).getTime();
            const dateB = new Date(b.sent_at).getTime();
            return dateA - dateB;
          });

          console.log(
            "✅ [useMessages] Message added successfully, total messages:",
            newMessages.length
          );
          return newMessages;
        });
      } else {
        console.log(
          "ℹ️ [useMessages] Message not for selected conversation:",
          selectedConversation?._id
        );
      }
    };

    const handleConversationUpdate = (data: ConversationUpdateV2) => {
      console.log("💬 [useMessages] Received conversation update:", data);
      // Reload conversations to get latest data
      loadConversations();

      // If this conversation is selected, reload messages
      if (selectedConversation?._id === data.conversationId) {
        loadConversations(); // Changed from loadMessages to loadConversations
      }
    };

    const handleReactionUpdate = (message: MessageWithUI) => {
      console.log(
        "🔄 [useMessages] Received reaction update for message:",
        message._id
      );

      // Update message in current conversation
      if (selectedConversation?._id === message.conversation_id) {
        console.log(
          "✅ [useMessages] Updating message reactions in current conversation"
        );
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

        // Also update conversation list if this message is the last message
        setConversations((prev) =>
          prev.map((conv) => {
            if (
              conv._id === message.conversation_id &&
              conv.lastMessage?._id === message._id
            ) {
              return {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  reactions: message.reactions,
                },
              };
            }
            return conv;
          })
        );
      } else {
        console.log(
          "ℹ️ [useMessages] Reaction update not for current conversation"
        );
      }
    };

    const handleMessageRecall = (message: MessageWithUI) => {
      console.log("🗑️ [useMessages] Received message recall:", message._id);
      // Update message in current conversation
      if (selectedConversation?._id === message.conversation_id) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === message._id ? message : msg))
        );
      }
    };

    // Register event listeners
    console.log("📝 [useMessages] Registering socket event listeners...");
    socketService.onNewMessage(handleNewMessage);
    socketService.onConversationUpdate(handleConversationUpdate);
    socketService.onReactionUpdate(handleReactionUpdate);
    socketService.onMessageRecall(handleMessageRecall);

    // Cleanup function
    return () => {
      console.log("🧹 [useMessages] Cleaning up socket event listeners");
      // Note: SocketService doesn't have off methods, listeners are cleaned up automatically
    };
  }, [token, myId, userRole, loadConversations]); // Added loadConversations back but removed selectedConversation?._id

  // Note: Room joining is handled automatically by server based on auth token
  // No need to manually join/leave conversation rooms

  // Initialize and load conversations
  useEffect(() => {
    if (token && user) {
      loadConversations();
    }
  }, [loadConversations, token, user]);

  // Force socket reconnection when token changes
  useEffect(() => {
    if (token && myId && socketService.isConnected()) {
      console.log(
        "🔄 [useMessages] Force reconnecting socket due to token change"
      );
      // Force reconnect to ensure fresh connection with new token
      socketService.forceReconnect(token, myId);
    }
  }, [token, myId]);

  // Ensure socket connection on mount
  useEffect(() => {
    if (token && myId && !socketService.isConnected()) {
      console.log("🔌 [useMessages] Socket not connected, connecting...");
      socketService.connect(token, myId);
    } else if (token && myId && socketService.isConnected()) {
      console.log("✅ [useMessages] Socket already connected");
    }
  }, [token, myId]);

  // Debug: Log socket status periodically
  useEffect(() => {
    if (!token || !myId) return;

    const logInterval = setInterval(() => {
      const status = socketService.getConnectionStatus();
      console.log("🔍 [useMessages] Socket status check:", status);
    }, 30000); // Log every 30 seconds

    return () => clearInterval(logInterval);
  }, [token, myId]);

  // Polling fallback for realtime updates (if socket fails)
  useEffect(() => {
    if (!selectedConversation || !token) return;
    console.log(
      "🔄 [useMessages] Setting up polling fallback for conversation:",
      selectedConversation._id
    );

    let lastMessageCount = messages.length;

    const pollInterval = setInterval(async () => {
      try {
        const latestMessages = await messageService.getConversationMessages(
          selectedConversation._id,
          50,
          1,
          userRole
        );

        // Check if there are new messages
        if (latestMessages.length > lastMessageCount) {
          console.log("🔄 [useMessages] Polling found new messages");
          setMessages(latestMessages);
          lastMessageCount = latestMessages.length;
        }
      } catch (error) {
        console.error("❌ [useMessages] Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      console.log("🛑 [useMessages] Clearing polling interval");
      clearInterval(pollInterval);
    };
  }, [selectedConversation?._id, token, userRole, messages.length]);

  // Test function for debugging socket connection
  const testSocketConnection = useCallback(() => {
    if (!selectedConversation) {
      console.log("⚠️ [useMessages] No conversation selected for testing");
      return;
    }

    console.log("🧪 [useMessages] Testing socket connection...");
    const status = socketService.getConnectionStatus();
    console.log("🔍 [useMessages] Socket status:", status);

    if (status.connected) {
      console.log(
        "✅ [useMessages] Socket is connected, emitting test message"
      );
      socketService.emitTestMessage(selectedConversation._id);
    } else {
      console.log("❌ [useMessages] Socket is not connected");
    }
  }, [selectedConversation]);

  return {
    // States
    conversations,
    selectedConversation,
    messages,
    messageInput,
    replyingTo,
    showEmojiPicker,
    showReactionPicker,
    isLoading,
    isLoadingConversations,
    hasMoreMessages,
    quickReactions,
    userRole,
    myId,
    user,
    messagesEndRef,
    textareaRef,
    topSentinelRef,

    // Actions
    loadConversations,
    selectConversation,
    sendMessage,
    toggleReaction,
    recallMessage,
    replyToMessage,
    cancelReply,
    handleEmojiSelect,
    handleTextareaChange,
    isSending,
    scrollToBottom,
    loadMoreMessages,
    testSocketConnection, // Add test function

    // Setters
    setMessageInput,
    setShowEmojiPicker,
    setShowReactionPicker,
  };
};
