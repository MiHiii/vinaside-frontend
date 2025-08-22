import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import messageService from '@/services/message.service';
import socketService from '@/services/socket.service';
import { MessageWithUI, ConversationUI, CreateMessageDto, ReactionType, ConversationUpdateV2 } from '@/types/message';

export const useMessages = () => {
  const { user, token } = useAppSelector((state: RootState) => state.auth);

  // States
  const [conversations, setConversations] = useState<ConversationUI[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationUI | null>(null);
  const [messages, setMessages] = useState<MessageWithUI[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<MessageWithUI | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
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
    { emoji: '👍', type: 'like' },
    { emoji: '❤️', type: 'love' },
    { emoji: '😂', type: 'laugh' },
    { emoji: '😮', type: 'wow' },
    { emoji: '😢', type: 'sad' },
    { emoji: '😡', type: 'angry' },
  ];

  // Load conversations with debug logging
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      console.log('🔄 [useMessages] Loading conversations for userRole:', userRole);
      console.log('🔄 [useMessages] Token exists:', !!token);
      console.log('🔄 [useMessages] User ID:', myId);
      console.log(
        '🔄 [useMessages] localStorage token:',
        localStorage.getItem('access_token')?.substring(0, 50) + '...',
      );

      const data = await messageService.getConversations(userRole);
      console.log('✅ [useMessages] Conversations loaded:', data);
      setConversations(data);
    } catch (error: any) {
      console.error('❌ [useMessages] Error loading conversations:', error);
      if (error?.response?.status === 401) {
        console.error('❌ [useMessages] 401 Error details:', {
          url: error?.config?.url,
          headers: error?.config?.headers,
          responseData: error?.response?.data,
        });
      }
    } finally {
      setIsLoadingConversations(false);
    }
  }, [userRole, token, myId]);

  // Select conversation and load messages
  const selectConversation = useCallback(
    async (conversation: ConversationUI) => {
      try {
        console.log('🔄 [useMessages] Selecting conversation:', conversation._id);
        setSelectedConversation(conversation);
        setMessages([]);
        setHasMoreMessages(true);
        setIsLoading(true);

        const data = await messageService.getConversationMessages(conversation._id, 50, 1, userRole);
        console.log('✅ [useMessages] Messages loaded:', data.length);
        setMessages(data.reverse());

        // Mark as read
        await messageService.markConversationAsRead(conversation._id);
      } catch (error: any) {
        console.error('❌ [useMessages] Error selecting conversation:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [userRole],
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      console.log('🔄 [useMessages] Sending message...');
      const messageData: CreateMessageDto = {
        conversation_id: selectedConversation._id,
        content: messageInput.trim(),
        reply_to_message_id: replyingTo?._id,
      };

      const newMessage = await messageService.sendMessage(messageData);
      console.log('✅ [useMessages] Message sent:', newMessage);

      // Convert MessageResponse to MessageWithUI for consistency
      const messageWithUI: MessageWithUI = {
        ...newMessage,
        ui_for: userRole,
        ui: {
          mine: true,
          show_sender_meta: false,
          sender_display_name: user?.name || 'You',
          sender_avatar_url: user?.avatar_url || null,
        },
      };

      setMessages((prev) => [...prev, messageWithUI]);
      setMessageInput('');
      setReplyingTo(null);

      // Auto-scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (error: any) {
      console.error('❌ [useMessages] Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [messageInput, selectedConversation, replyingTo, isSending, userRole, user]);

  // Toggle reaction
  const toggleReaction = useCallback(async (messageId: string, type: ReactionType) => {
    try {
      console.log('🔄 [useMessages] Toggling reaction:', messageId, type);
      const response = await messageService.toggleReaction(messageId, type);
      console.log('✅ [useMessages] Reaction toggled:', response);

      // Update message in local state - convert MessageResponse to MessageWithUI
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...response.message,
                ui_for: msg.ui_for,
                ui: msg.ui,
              }
            : msg,
        ),
      );
    } catch (error: any) {
      console.error('❌ [useMessages] Error toggling reaction:', error);
    }
  }, []);

  // Recall message
  const recallMessage = useCallback(async (messageId: string) => {
    try {
      console.log('🔄 [useMessages] Recalling message:', messageId);
      const updatedMessage = await messageService.recallMessage(messageId);
      console.log('✅ [useMessages] Message recalled:', updatedMessage);

      // Update message in local state - convert MessageResponse to MessageWithUI
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...updatedMessage,
                ui_for: msg.ui_for,
                ui: msg.ui,
              }
            : msg,
        ),
      );
    } catch (error: any) {
      console.error('❌ [useMessages] Error recalling message:', error);
    }
  }, []);

  // Reply to message
  const replyToMessage = useCallback((message: MessageWithUI) => {
    console.log('🔄 [useMessages] Setting reply to message:', message._id);
    setReplyingTo(message);
    setShowEmojiPicker(false);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    console.log('🔄 [useMessages] Canceling reply');
    setReplyingTo(null);
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emojiObject: { emoji: string }) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Auto-scroll when new message is added
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id === myId) {
        // Auto-scroll for own messages
        scrollToBottom();
      }
    }
  }, [messages, myId, scrollToBottom]);

  // Setup Socket.IO connection and event listeners
  useEffect(() => {
    console.log('🔌 [useMessages] Setting up Socket.IO connection...');

    if (!token || !myId) {
      console.log('⚠️ [useMessages] No token or user ID, skipping socket setup');
      return;
    }

    // Connect to socket service
    socketService.connect(token, myId);

    // Check if already connected
    if (socketService.isConnected()) {
      console.log('🔌 [useMessages] Socket already connected');
      console.log('🔌 [useMessages] Socket status:', socketService.getSocketStatus());
    }

    // Join user room for general messages
    socketService.joinUserRoom(myId);
    console.log('🏠 [useMessages] Joined user room:', `user_${myId}`);

    // Join admin room if user is admin
    if (userRole === ('admin' as any)) {
      socketService.joinAdminRoom();
      console.log('🏠 [useMessages] Joined admin room');
    }

    // Connect to notifications
    socketService.connectNotification(token, myId);
    console.log('🔔 [useMessages] Connected to notifications');

    // Setup event listeners
    const handleNewMessage = (message: MessageWithUI) => {
      console.log('📨 [useMessages] New message received via socket:', message);

      // Update conversations list if message is for current user
      setConversations((prev) => {
        const updated = [...prev];
        const convIndex = updated.findIndex((c) => c._id === message.conversation_id);

        if (convIndex >= 0) {
          // Update existing conversation
          updated[convIndex] = {
            ...updated[convIndex],
            lastMessage: {
              _id: message._id,
              content: message.content,
              sender_id: message.sender_id,
              sender_role: 'guest' as const,
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
          // Add new conversation if not exists
          console.log('🆕 [useMessages] New conversation detected, reloading conversations...');
          loadConversations();
        }

        return updated;
      });

      // Update messages if conversation is selected
      if (selectedConversation?._id === message.conversation_id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleConversationUpdate = (data: ConversationUpdateV2) => {
      console.log('💬 [useMessages] Conversation update received via socket:', data);

      // Reload conversations to get latest data
      loadConversations();

      // If this conversation is selected, reload messages
      if (selectedConversation?._id === data.conversationId) {
        loadConversations(); // Changed from loadMessages to loadConversations
      }
    };

    const handleReactionUpdate = (message: MessageWithUI) => {
      console.log('👍 [useMessages] Reaction update received via socket:', message);

      // Update message in current conversation
      if (selectedConversation?._id === message.conversation_id) {
        setMessages((prev) => prev.map((msg) => (msg._id === message._id ? message : msg)));
      }
    };

    const handleMessageRecall = (message: MessageWithUI) => {
      console.log('🗑️ [useMessages] Message recall received via socket:', message);

      // Update message in current conversation
      if (selectedConversation?._id === message.conversation_id) {
        setMessages((prev) => prev.map((msg) => (msg._id === message._id ? message : msg)));
      }
    };

    // Register event listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onConversationUpdate(handleConversationUpdate);
    socketService.onReactionUpdate(handleReactionUpdate);
    socketService.onMessageRecall(handleMessageRecall);

    // Cleanup function
    return () => {
      console.log('🧹 [useMessages] Cleaning up socket listeners...');
      // Note: SocketService doesn't have off methods, listeners are cleaned up automatically
    };
  }, [token, myId, userRole, selectedConversation?._id, loadConversations]);

  // Join conversation room when conversation is selected
  useEffect(() => {
    if (selectedConversation && socketService.isConnected()) {
      console.log('🏠 [useMessages] Joining conversation room:', selectedConversation._id);
      socketService.joinConversation(selectedConversation._id);

      // Leave previous conversation room if any
      return () => {
        console.log('🚪 [useMessages] Leaving conversation room:', selectedConversation._id);
        socketService.leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation]);

  // Initialize and load conversations
  useEffect(() => {
    if (token && user) {
      console.log('🚀 [useMessages] Initializing with token and user...');
      loadConversations();
    } else {
      console.log('❌ [useMessages] Missing token or user:', { hasToken: !!token, hasUser: !!user });
    }
  }, [loadConversations, token, user]);

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

    // Setters
    setMessageInput,
    setShowEmojiPicker,
    setShowReactionPicker,
  };
};
