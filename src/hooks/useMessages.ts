import { useEffect, useState, useRef, useMemo } from "react";
import chatService, {
  Message,
  MessageReaction,
  ReactionType,
} from "@/services/chat.service";
import socketService from "@/services/socket.service";
import { format } from "date-fns";
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import { User } from "@/types/user";
import { toast } from "sonner";

interface SocketMessage {
  _id?: string;
  id?: string;
  content: string;
  sender_id?: { _id?: string } | string;
  senderId?: string;
  receiver_id?: { _id?: string } | string;
  receiverId?: string;
  conversation_id?: string;
  conversationId?: string;
  sent_at?: string;
  createdAt?: string;
  is_read?: string | boolean;
  reply_to?: {
    message_id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    sent_at?: string;
  };
}

interface Conversation {
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
}

export const useMessages = () => {
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [textareaHeight, setTextareaHeight] = useState(40);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null
  );
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [currentPropertyId, setCurrentPropertyId] = useState<
    string | undefined
  >(undefined);

  const myId = user?._id;

  // Limit messages for performance - show last 100 messages
  const displayedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const maxMessages = 100;
    if (messages.length <= maxMessages) return messages;
    return messages.slice(-maxMessages);
  }, [messages]);

  // Load selected user from localStorage on component mount
  useEffect(() => {
    const savedSelectedUser = localStorage.getItem("selectedUser");
    if (savedSelectedUser && users.length > 0) {
      try {
        const parsedUser = JSON.parse(savedSelectedUser);
        const userExists = users.find((u) => u._id === parsedUser.id);
        if (userExists) {
          setSelectedUser(parsedUser);
          chatService
            .getConversation(parsedUser.id, 1000)
            .then((messages) => {
              setMessages(messages);
              scrollToBottom();
            })
            .catch((err) =>
              console.error("Error loading saved conversation:", err)
            );
        }
      } catch (error) {
        console.error("Error parsing saved selected user:", error);
        localStorage.removeItem("selectedUser");
      }
    }
  }, [users.length]);

  // Save selected user to localStorage whenever it changes
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem("selectedUser");
    }
  }, [selectedUser]);

  // Debug socket connection on mount
  useEffect(() => {
    if (token && myId) {
      setTimeout(() => {
        const status = socketService.getSocketStatus();
        if (!status.connected) {
          console.warn(
            "⚠️ Socket not connected after mount - this might be the issue!"
          );
        }
      }, 2000);
    }
  }, [token, myId]);

  // Initialize socket connection first
  useEffect(() => {
    if (!token || !myId) {
      return;
    }

    if (!socketService.isConnected()) {
      socketService.connect(token, myId);
    }

    const connectionTimeout = setTimeout(() => {
      const status = socketService.getSocketStatus();
      if (!status.connected) {
        console.warn(
          "❌ Socket still not connected after timeout, trying force reconnect"
        );
        socketService.forceReconnect(token, myId);
      }
    }, 3000);

    return () => {
      clearTimeout(connectionTimeout);
    };
  }, [token, myId]);

  // Setup socket message handling after connection
  useEffect(() => {
    if (!token || !myId) return;

    const handleNewMessage = (socketMessage: any) => {
      const isNormalizedMessage =
        socketMessage.replyTo !== undefined ||
        socketMessage.senderId !== undefined;

      let normalizedMessage: Message;

      if (isNormalizedMessage) {
        normalizedMessage = {
          id: socketMessage.id || `temp_${Date.now()}`,
          content: socketMessage.content,
          senderId: socketMessage.senderId,
          receiverId: socketMessage.receiverId,
          conversationId: socketMessage.conversationId || "",
          createdAt: socketMessage.createdAt || new Date().toISOString(),
          isRead: socketMessage.isRead,
          replyTo: socketMessage.replyTo,
        };
      } else {
        const senderId =
          typeof socketMessage.sender_id === "object"
            ? socketMessage.sender_id?._id || ""
            : socketMessage.sender_id || socketMessage.senderId || "";
        const receiverId =
          typeof socketMessage.receiver_id === "object"
            ? socketMessage.receiver_id?._id || ""
            : socketMessage.receiver_id || socketMessage.receiverId || "";

        normalizedMessage = {
          id: socketMessage._id || socketMessage.id || `temp_${Date.now()}`,
          content: socketMessage.content,
          senderId,
          receiverId,
          conversationId:
            socketMessage.conversation_id || socketMessage.conversationId || "",
          createdAt:
            socketMessage.sent_at ||
            socketMessage.createdAt ||
            new Date().toISOString(),
          isRead: socketMessage.is_read === "read",
          replyTo: socketMessage.reply_to
            ? {
                messageId: socketMessage.reply_to.message_id,
                content: socketMessage.reply_to.content,
                senderName: socketMessage.reply_to.sender_name || "Người dùng",
                senderId: socketMessage.reply_to.sender_id,
              }
            : undefined,
        };
      }

      const isCurrentChat =
        selectedUser &&
        (normalizedMessage.senderId === selectedUser.id ||
          normalizedMessage.receiverId === selectedUser.id);

      // Update unread counts
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        if (
          normalizedMessage.receiverId === myId &&
          (!selectedUser || selectedUser.id !== normalizedMessage.senderId)
        ) {
          newCounts[normalizedMessage.senderId] =
            (newCounts[normalizedMessage.senderId] || 0) + 1;
        }
        return newCounts;
      });

      // Update conversations
      setConversations((prev) => {
        if (!normalizedMessage.senderId || !normalizedMessage.receiverId)
          return Array.isArray(prev) ? prev : [];

        const currentConversations = Array.isArray(prev) ? prev : [];
        const updatedConversations = [...currentConversations];

        const idx = updatedConversations.findIndex(
          (c) =>
            c &&
            Array.isArray(c.participants) &&
            c.participants.includes(normalizedMessage.senderId) &&
            c.participants.includes(normalizedMessage.receiverId)
        );

        if (idx !== -1) {
          updatedConversations[idx] = {
            ...updatedConversations[idx],
            lastMessage: normalizedMessage,
            unreadCount: unreadCounts[normalizedMessage.senderId] || 0,
          };
        } else {
          const initialUnreadCount =
            normalizedMessage.receiverId === myId &&
            (!selectedUser || selectedUser.id !== normalizedMessage.senderId)
              ? 1
              : 0;
          updatedConversations.unshift({
            participants: [
              normalizedMessage.senderId,
              normalizedMessage.receiverId,
            ],
            lastMessage: normalizedMessage,
            unreadCount: initialUnreadCount,
          });
        }

        return updatedConversations;
      });

      // Update messages if in current chat
      if (isCurrentChat) {
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];

          const isDuplicate = currentMessages.some((msg) => {
            if (msg.id === normalizedMessage.id) {
              return true;
            }

            const contentMatch = msg.content === normalizedMessage.content;
            const senderMatch = msg.senderId === normalizedMessage.senderId;
            const timeDiff = Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(normalizedMessage.createdAt).getTime()
            );

            const timeThreshold = normalizedMessage.replyTo ? 1000 : 2000;
            const timeMatch = timeDiff < timeThreshold;

            if (contentMatch && senderMatch && timeMatch) {
              if (normalizedMessage.replyTo && msg.replyTo) {
                const replyMatch =
                  msg.replyTo.messageId === normalizedMessage.replyTo.messageId;
                if (replyMatch) {
                  return true;
                }
              } else if (!normalizedMessage.replyTo && !msg.replyTo) {
                return true;
              }
            }
            return false;
          });

          if (isDuplicate) {
            return currentMessages;
          }

          const newMessages = [...currentMessages, normalizedMessage];
          const maxMessages = 200;
          const limitedMessages =
            newMessages.length > maxMessages
              ? newMessages.slice(-maxMessages)
              : newMessages;

          if (normalizedMessage.replyTo) {
            setTimeout(() => scrollToBottom(), 10);
          } else {
            setTimeout(() => scrollToBottom(), 50);
          }

          return limitedMessages;
        });
      }
    };

    const socketStatus = socketService.getSocketStatus();
    if (!socketService.isConnected()) {
      socketService.connect(token, myId);
      setTimeout(() => {
        const newStatus = socketService.getSocketStatus();
      }, 1000);
    }

    const unsubscribe = socketService.onNewMessage(handleNewMessage);

    // Listen for reaction updates
    const unsubscribeReactions = socketService.onReactionUpdate((data) => {
      console.log("[SOCKET] reaction_update event received:", data);
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          if (msg.id === data.messageId) {
            let updatedReactions: MessageReaction[] = [];
            if (Array.isArray(data.reactions)) {
              updatedReactions = data.reactions.map((reaction: any) => ({
                emoji: reaction.emoji || "👍",
                userId: reaction.user_id,
                userName: reaction.user_name || "",
                createdAt: reaction.created_at,
                type: reaction.type,
              }));
            }
            return {
              ...msg,
              reactions: updatedReactions,
            };
          }
          return msg;
        });
        // Force update để useMemo chạy lại
        return [...updated];
      });
    });

    // Listen for message recall updates
    const unsubscribeMessageRecall =
      socketService.onMessageRecall?.(
        (data: {
          messageId: string;
          content: string;
          is_recalled: boolean;
          recalled_at: string;
        }) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === data.messageId) {
                return {
                  ...msg,
                  content: data.content,
                  isRecalled: data.is_recalled,
                  recalledAt: data.recalled_at,
                };
              }
              return msg;
            })
          );
        }
      ) || (() => {});

    const connectionCheckTimeout = setTimeout(() => {
      if (!socketService.isConnected()) {
        console.warn(
          "⚠️ Socket not connected after 5 seconds, attempting force reconnect"
        );
        socketService.forceReconnect(token, myId);
        setTimeout(() => {
          const finalStatus = socketService.getSocketStatus();
          if (!finalStatus.connected) {
            console.error("❌ Socket connection completely failed!");
          }
        }, 2000);
      }
    }, 5000);

    return () => {
      unsubscribe();
      unsubscribeReactions();
      unsubscribeMessageRecall();
      clearTimeout(connectionCheckTimeout);
    };
  }, [token, myId, selectedUser?.id, unreadCounts]);

  useEffect(() => {
    if (!token || !myId) return;

    const fetchInitialData = async () => {
      try {
        const [usersRes, conversationsRes] = await Promise.all([
          chatService.getUsers(),
          chatService.getConversations(),
        ]);

        // Handle users data
        let processedUsers = [];
        if (usersRes?.success && Array.isArray(usersRes.data)) {
          processedUsers = usersRes.data;
        } else if (usersRes?.data && Array.isArray(usersRes.data)) {
          processedUsers = usersRes.data;
        } else if (usersRes?.data && typeof usersRes.data === "object") {
          const usersObject = usersRes.data;
          const numericKeys = Object.keys(usersObject).filter(
            (key) => !isNaN(Number(key))
          );
          processedUsers = numericKeys.map(
            (key) => usersObject[key as keyof typeof usersObject]
          );
        } else {
          const fallbackUsers = usersRes?.data || usersRes || [];
          processedUsers = Array.isArray(fallbackUsers) ? fallbackUsers : [];
        }

        // Handle conversations data
        let processedConversations: Conversation[] = [];
        const conversationsData = conversationsRes as unknown as {
          success?: boolean;
          data?: Record<string, unknown>;
        };

        if (
          conversationsData?.success &&
          conversationsData.data &&
          typeof conversationsData.data === "object"
        ) {
          const conversationsObject = conversationsData.data;
          const numericKeys = Object.keys(conversationsObject).filter(
            (key) => !isNaN(Number(key))
          );

          processedConversations = numericKeys.map((key) => {
            const conv = conversationsObject[key] as {
              _id: string;
              lastMessage?: {
                _id: string;
                sender_id: string;
                receiver_id: string;
                content: string;
                sent_at: string;
                createdAt?: string;
                is_read: string;
              };
              unreadCount?: number;
            };
            return {
              participants: conv.lastMessage
                ? [
                    conv.lastMessage.sender_id,
                    conv.lastMessage.receiver_id,
                  ].filter(Boolean)
                : [myId, conv._id].filter(Boolean),
              lastMessage: conv.lastMessage
                ? {
                    id: conv.lastMessage._id,
                    content: conv.lastMessage.content,
                    senderId: conv.lastMessage.sender_id,
                    receiverId: conv.lastMessage.receiver_id,
                    conversationId: "",
                    createdAt:
                      conv.lastMessage.sent_at ||
                      conv.lastMessage.createdAt ||
                      new Date().toISOString(),
                    isRead: conv.lastMessage.is_read === "read",
                  }
                : undefined,
              unreadCount: conv.unreadCount || 0,
            };
          });
        } else {
          const conversations = Array.isArray(conversationsRes)
            ? conversationsRes
            : (conversationsRes as unknown as { data?: unknown })?.data || [];
          processedConversations = Array.isArray(conversations)
            ? (conversations as unknown as Conversation[])
            : [];
        }

        setUsers(processedUsers as unknown as User[]);
        setConversations(processedConversations);
      } catch (err) {
        console.error("❌ Error fetching initial data:", err);
        const error = err as { response?: { data?: unknown; status?: number } };
        console.error("Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          response: error?.response?.data,
          status: error?.response?.status,
        });
      }
    };

    fetchInitialData();
  }, [token, myId]);

  const handleConnect = async (userId: string) => {
    if (!user || !myId) return;
    try {
      const selected = users.find((u) => u?._id === userId);
      if (!selected) return;

      setSelectedUser({
        id: userId,
        name: selected?.name || `User ${userId}`,
        avatar: selected?.avatar_url || "/placeholder.svg",
      });

      const messages = await chatService.getConversation(userId, 1000);
      setMessages(messages);
      setHasMoreMessages(messages.length >= 1000);
      setIsLoadingMoreMessages(false);

      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[userId];
        return newCounts;
      });

      setConversations((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((c) => {
          if (!c || !c.participants || !Array.isArray(c.participants)) {
            return c;
          }
          if (
            c.participants.includes(userId) &&
            c.participants.includes(myId)
          ) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        });
      });

      try {
        const result = await chatService.markConversationAsRead(userId, myId);
        if (result.success) {
          const updatedMessages = await chatService.getConversation(userId);
          setMessages(updatedMessages);
        }
      } catch (error) {
        console.error("❌ Error marking conversation as read:", error);
      }

      scrollToBottom();
    } catch (error) {
      console.error("Error connecting to chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedUser && user && myId) {
      try {
        const response = await chatService.sendMessage(
          selectedUser.id,
          messageInput,
          replyingTo?.id,
          currentPropertyId
        );

        const responseData = response?.data || response;
        const newMessage: Message = {
          id: responseData._id || `temp_${Date.now()}`,
          content: responseData.content || messageInput,
          senderId:
            typeof responseData.sender_id === "object"
              ? responseData.sender_id._id
              : responseData.sender_id || myId,
          receiverId:
            typeof responseData.receiver_id === "object"
              ? responseData.receiver_id._id
              : responseData.receiver_id || selectedUser.id,
          conversationId:
            (responseData as unknown as { conversation_id?: string })
              .conversation_id || "",
          createdAt:
            responseData.sent_at ||
            responseData.createdAt ||
            new Date().toISOString(),
          isRead: responseData.is_read === "read",
          replyTo: (responseData as any).reply_to
            ? {
                messageId: (responseData as any).reply_to.message_id,
                content: (responseData as any).reply_to.content,
                senderName:
                  (responseData as any).reply_to.sender_name || "Người dùng",
                senderId: (responseData as any).reply_to.sender_id,
              }
            : replyingTo
            ? {
                messageId: replyingTo.id,
                content: replyingTo.content,
                senderName:
                  replyingTo.senderId === myId
                    ? user?.name || "Bạn"
                    : users.find((u) => u._id === replyingTo.senderId)?.name ||
                      "Người dùng",
                senderId: replyingTo.senderId,
              }
            : undefined,
        };

        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          const exists = currentMessages.some(
            (msg) =>
              msg.id === newMessage.id ||
              (msg.content === newMessage.content &&
                msg.senderId === newMessage.senderId &&
                Math.abs(
                  new Date(msg.createdAt).getTime() -
                    new Date(newMessage.createdAt).getTime()
                ) < 1000)
          );

          if (exists) {
            return currentMessages;
          }
          const newMessages = [...currentMessages, newMessage];
          const maxMessages = 200;
          if (newMessages.length > maxMessages) {
            return newMessages.slice(-maxMessages);
          }
          return newMessages;
        });

        setMessageInput("");
        setReplyingTo(null);
        setTextareaHeight(40);
        scrollToBottom();

        setConversations((prev) => {
          if (!Array.isArray(prev)) return [];
          const updatedConversations = [...prev];
          const conversationIndex = updatedConversations.findIndex(
            (c) =>
              c &&
              c.participants &&
              Array.isArray(c.participants) &&
              c.participants.includes(myId) &&
              c.participants.includes(selectedUser.id)
          );

          if (conversationIndex !== -1) {
            const existingMessage =
              updatedConversations[conversationIndex].lastMessage;
            if (
              !existingMessage ||
              new Date(newMessage.createdAt) >
                new Date(existingMessage.createdAt)
            ) {
              updatedConversations[conversationIndex] = {
                ...updatedConversations[conversationIndex],
                lastMessage: newMessage,
              };
            }
          } else {
            updatedConversations.unshift({
              participants: [myId, selectedUser.id],
              lastMessage: newMessage,
              unreadCount: 0,
            });
          }
          return updatedConversations;
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessageInput(textarea.value);

    if (textarea.value.trim() === "") {
      setTextareaHeight(40);
      textarea.style.height = "40px";
      return;
    }

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(40, Math.min(120, scrollHeight));
    setTextareaHeight(newHeight);
    textarea.style.height = newHeight + "px";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    const shouldScroll = () => {
      const container = messagesEndRef.current?.parentElement?.parentElement;
      if (!container) return true;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      return isNearBottom;
    };

    if (shouldScroll()) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [displayedMessages.length]);

  // Scroll to bottom when selecting a new conversation
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [selectedUser, displayedMessages.length]);

  // Quick reactions mapping
  const quickReactions: { emoji: string; type: ReactionType }[] = [
    { emoji: "👍", type: ReactionType.LIKE },
    { emoji: "❤️", type: ReactionType.LOVE },
    { emoji: "😂", type: ReactionType.LAUGH },
    { emoji: "😮", type: ReactionType.WOW },
    { emoji: "😢", type: ReactionType.SAD },
    { emoji: "😡", type: ReactionType.ANGRY },
  ];

  // Handle emoji selection from picker
  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle toggling reaction
  const handleToggleReaction = async (
    messageId: string,
    reactionType: ReactionType
  ) => {
    try {
      await chatService.toggleReaction(messageId, reactionType);
      setShowReactionPicker(null);
      // KHÔNG cập nhật state messages ở đây, chờ socket update
    } catch (error) {
      console.error("❌ Error toggling reaction:", error);
    }
  };

  // Helper function to safely check participants
  const hasValidParticipants = (
    conversation: any,
    ...userIds: (string | undefined)[]
  ): boolean => {
    if (
      !conversation ||
      !conversation.participants ||
      !Array.isArray(conversation.participants)
    ) {
      return false;
    }
    return userIds.every((id) => id && conversation.participants.includes(id));
  };

  // Handle message reply
  const handleReplyMessage = (message: Message) => {
    try {
      setReplyingTo(message);
      const inputElement = document.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.focus();
      }
    } catch (error) {
      console.error("❌ Error setting up reply:", error);
    }
  };

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Handle message delete (recall)
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await chatService.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: "Bạn đã thu hồi một tin nhắn",
                isRecalled: true,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("❌ Error recalling message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.isRecalled
            ? {
                ...msg,
                isRecalled: false,
              }
            : msg
        )
      );
    }
  };

  // Set property ID for current conversation
  const setPropertyId = (propertyId: string | undefined) => {
    setCurrentPropertyId(propertyId);
  };

  // Handle loading more messages
  const handleLoadMoreMessages = async () => {
    if (!selectedUser || isLoadingMoreMessages || !hasMoreMessages) return;

    try {
      setIsLoadingMoreMessages(true);
      const oldestMessage = messages[0];
      const beforeMessageId = oldestMessage?.id;
      const olderMessages = await chatService.loadMoreMessages(
        selectedUser.id,
        beforeMessageId,
        50
      );

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        setMessages((prev) => [...olderMessages, ...prev]);
      }
    } catch (error) {
      console.error("❌ Error loading more messages:", error);
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  return {
    // States
    messageInput,
    messages,
    selectedUser,
    textareaHeight,
    conversations,
    users,
    messagesEndRef,
    unreadCounts,
    showEmojiPicker,
    showReactionPicker,
    isLoadingMoreMessages,
    hasMoreMessages,
    replyingTo,
    displayedMessages,
    quickReactions,
    myId,
    user,
    token,
    currentPropertyId,

    // State setters
    setMessageInput,
    setShowEmojiPicker,
    setShowReactionPicker,
    setCurrentPropertyId,

    // Handlers
    handleConnect,
    handleSendMessage,
    handleKeyPress,
    handleTextareaChange,
    handleEmojiSelect,
    handleToggleReaction,
    handleReplyMessage,
    handleCancelReply,
    handleDeleteMessage,
    handleLoadMoreMessages,
    setPropertyId,

    // Utilities
    hasValidParticipants,
    scrollToBottom,
    format,
  };
};

export const usePropertyStaff = (propertyId?: string) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaffList = async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getPropertyStaff(propertyId);
      if (response.success && response.data.length > 0) {
        setStaffList(response.data);
      } else {
        setStaffList([]);
        setError("Không tìm thấy nhân viên cho tòa nhà này");
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      setError("Không thể tải danh sách nhân viên");
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const sendMessageToStaff = async (
    staffId: string,
    content: string,
    propertyId?: string // Made optional since we're not using it anymore
  ) => {
    if (!staffId || !content.trim()) {
      throw new Error("Thiếu thông tin cần thiết để gửi tin nhắn");
    }

    try {
      const response = await chatService.sendMessage(
        staffId,
        content.trim(),
        undefined
        // propertyId parameter removed since it's no longer needed
      );

      if (response.success) {
        toast.success("Tin nhắn đã được gửi thành công!");
        return response;
      } else {
        throw new Error("Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message to staff:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
      throw error;
    }
  };

  useEffect(() => {
    if (propertyId) {
      loadStaffList();
    }
  }, [propertyId]);

  return {
    staffList,
    loading,
    error,
    loadStaffList,
    sendMessageToStaff,
  };
};
