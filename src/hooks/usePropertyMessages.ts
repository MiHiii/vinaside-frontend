import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import chatService from '@/services/chat.service';
import socketService from '@/services/socket.service';
import {
  PropertyConversation,
  ManagementConversation,
  ConversationItem,
  ConversationMessage,
  MessageUser,
  MessageStatus,
  SocketNewMessage,
} from '@/types/message';

interface PropertySelectedUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'property';
  status?: string;
  isVerified?: boolean;
}

export const usePropertyMessages = () => {
  const { user, token } = useAppSelector((state: RootState) => state.auth);

  // UI States
  const [messageInput, setMessageInput] = useState('');
  const [textareaHeight, setTextareaHeight] = useState(40);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Data States
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertySelectedUser | null>(null);
  const [replyingTo, setReplyingTo] = useState<ConversationMessage | null>(null);

  // Loading States
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myId = user?._id;

  // Limit displayed messages for performance
  const displayedMessages = useMemo(() => {
    console.log('🎨 Processing displayedMessages:', {
      messagesLength: messages?.length || 0,
      messagesArray: messages,
      hasMessages: !!(messages && messages.length > 0),
    });

    if (!messages || messages.length === 0) {
      console.log('⚠️ No messages to display');
      return [];
    }

    const maxMessages = 100;
    const result = messages.length <= maxMessages ? messages : messages.slice(-maxMessages);
    console.log('✅ Displaying messages:', result.length);
    return result;
  }, [messages]);

  // Quick reactions
  const quickReactions = [
    { emoji: '👍', type: 'like' },
    { emoji: '❤️', type: 'love' },
    { emoji: '😂', type: 'laugh' },
    { emoji: '😮', type: 'wow' },
    { emoji: '😢', type: 'sad' },
    { emoji: '😡', type: 'angry' },
  ];

  // Check permissions
  const canSendToProperty = useCallback(
    (propertyId: string): boolean => {
      if (!user) {
        console.log('❌ No user for permission check');
        return false;
      }

      console.log('🔐 Checking permissions:', {
        userId: user._id,
        role: user.role,
        propertyId,
      });

      // Guest luôn có thể gửi tin nhắn
      if (user.role === 'guest') {
        console.log('✅ Guest can always send');
        return true;
      }

      // Admin bypass tất cả
      if (user.role === 'admin') {
        console.log('✅ Admin can always send');
        return true;
      }

      // Staff chỉ cần có permission message.manage (không cần assignedProperties)
      if (user.role === 'staff') {
        const hasMessagePermission =
          user.permissions?.some((p) =>
            typeof p === 'string'
              ? p === 'message.manage'
              : (p as unknown as { name: string }).name === 'message.manage',
          ) || false;

        console.log('🔐 Staff permission check:', {
          hasMessageManage: hasMessagePermission,
          permissions: user.permissions,
        });

        if (hasMessagePermission) {
          console.log('✅ Staff has message.manage permission');
          return true;
        } else {
          console.log('❌ Staff missing message.manage permission');
          return false;
        }
      }

      console.log('❌ Unknown role');
      return false;
    },
    [user],
  );

  // Load conversations based on user role
  const loadConversations = useCallback(async () => {
    if (!user || !token) return;

    setIsLoadingConversations(true);
    try {
      console.log('🎭 Loading conversations for role:', user.role);
      const conversations = await chatService.getConversationsByRole(user.role as 'guest' | 'staff' | 'admin');
      setConversations(conversations);
      console.log(`✅ ${user.role} conversations loaded:`, conversations.length);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user, token]);

  // Load messages for selected property
  const loadMessages = useCallback(async (propertyId: string) => {
    if (!propertyId) return;
    try {
      console.log('🔄 Loading messages for property:', propertyId);
      const messages = await chatService.getPropertyConversation(propertyId, 50);
      console.log('📨 Raw messages loaded:', messages);

      // Debug: Check what we're setting
      console.log('📤 Setting messages state:', {
        messagesType: typeof messages,
        isArray: Array.isArray(messages),
        length: messages?.length,
        firstFew: messages?.slice(0, 3),
      });

      setMessages(messages);
      setHasMoreMessages(messages.length >= 50);

      // Mark conversation as read
      if (messages.length > 0) {
        await chatService.markPropertyConversationAsRead(propertyId);
      }

      console.log('✅ Property messages loaded and set:', {
        count: messages.length,
        firstMessage: messages[0],
        lastMessage: messages[messages.length - 1],
      });
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      toast.error('Không thể tải tin nhắn');
    }
  }, []);

  // Load more messages (pagination)
  const handleLoadMoreMessages = useCallback(async () => {
    if (!selectedProperty || isLoadingMoreMessages || !hasMoreMessages) return;

    setIsLoadingMoreMessages(true);
    try {
      const page = Math.floor(messages.length / 50) + 1;

      const olderMessages = await chatService.getPropertyConversation(selectedProperty.id, 50, page);

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        setMessages((prev) => [...olderMessages, ...prev]);
        setHasMoreMessages(olderMessages.length >= 50);
      }

      console.log('✅ Loaded more messages:', olderMessages.length);
    } catch (error) {
      console.error('❌ Error loading more messages:', error);
      toast.error('Không thể tải thêm tin nhắn');
    } finally {
      setIsLoadingMoreMessages(false);
    }
  }, [selectedProperty, messages, isLoadingMoreMessages, hasMoreMessages]);

  // Connect to property conversation
  const handleConnect = useCallback(
    async (propertyId: string) => {
      console.log('🔗 Connecting to property:', propertyId);
      console.log(
        '📋 Available conversations:',
        conversations.map((c) => ({
          id: c._id,
          name:
            'guest' in c && 'property' in c
              ? (c as ManagementConversation).guest.name
              : (c as PropertyConversation).name,
          property_id:
            'guest' in c && 'property' in c
              ? (c as ManagementConversation).property._id
              : (c as PropertyConversation).property_id,
        })),
      );

      const conversation = conversations.find((c) => c._id === propertyId);
      if (!conversation) {
        console.error('❌ Conversation not found for propertyId:', propertyId);
        return;
      }

      console.log('✅ Found conversation:', conversation);

      // Use property_id from conversation instead of conversation._id
      const actualPropertyId =
        'guest' in conversation && 'property' in conversation
          ? (conversation as ManagementConversation).property._id
          : (conversation as PropertyConversation).property_id || propertyId;
      console.log('🏠 Using property ID:', actualPropertyId);

      const propertyUser: PropertySelectedUser = {
        id: conversation._id, // Use conversation ID để có thể extract đúng targetId sau này
        name:
          'guest' in conversation && 'property' in conversation
            ? (conversation as ManagementConversation).guest.name
            : (conversation as PropertyConversation).name,
        avatar:
          'guest' in conversation && 'property' in conversation
            ? (conversation as ManagementConversation).guest.avatar_url || undefined
            : (conversation as PropertyConversation).avatar_url,
        type: 'property',
        status:
          'guest' in conversation && 'property' in conversation
            ? 'active'
            : (conversation as PropertyConversation).status,
        isVerified:
          'guest' in conversation && 'property' in conversation
            ? false
            : (conversation as PropertyConversation).isVerified,
      };

      setSelectedProperty(propertyUser);

      // Save to localStorage
      localStorage.setItem('selectedProperty', JSON.stringify(propertyUser));

      // Load messages
      await loadMessages(actualPropertyId);

      // Join socket room
      if (socketService.isConnected()) {
        socketService.joinRoom(actualPropertyId);
      }
    },
    [conversations, loadMessages],
  );

  // Helper để extract correct target ID từ conversation ID
  const getTargetIdFromConversation = useCallback((conversation: PropertySelectedUser, userRole: string) => {
    const conversationId = conversation.id;

    if (userRole === 'guest') {
      // Guest gửi tin nhắn tới property
      // Nếu có format property_id|guest_id thì lấy property_id (phần đầu)
      if (conversationId.includes('|')) {
        return conversationId.split('|')[0];
      }
      // Fallback: conversation ID chính là property ID
      return conversationId;
    } else {
      // Staff/Admin gửi tin nhắn tới guest
      // Nếu có format property_id|guest_id thì lấy guest_id (phần sau)
      if (conversationId.includes('|')) {
        return conversationId.split('|')[1];
      }
      // Fallback: sử dụng conversation ID
      return conversationId;
    }
  }, []);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedProperty || !user) return;

    // Check permissions
    if (!canSendToProperty(selectedProperty.id)) {
      toast.error('Bạn không có quyền gửi tin nhắn tới property này');
      return;
    }

    const content = messageInput.trim();
    const targetId = getTargetIdFromConversation(selectedProperty, user.role);
    const replyToId = replyingTo?._id;

    if (!targetId) {
      toast.error('Không thể xác định target ID');
      return;
    }

    console.log('📤 Sending message:', {
      conversationId: selectedProperty.id,
      targetId,
      userRole: user.role,
      content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    });

    // Create temporary message for optimistic UI
    const tempMessage: ConversationMessage = {
      _id: `temp_${Date.now()}`,
      sender_id: {
        _id: user._id,
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url,
      } as MessageUser,
      property_id: targetId,
      content,
      sent_at: new Date().toISOString(),
      is_read: 'sent' as MessageStatus,
      reactions: [],
      reply_to: replyingTo
        ? {
            message_id: replyingTo._id,
            content: replyingTo.content,
            sender_id: typeof replyingTo.sender_id === 'string' ? replyingTo.sender_id : replyingTo.sender_id._id,
            sender_name: typeof replyingTo.sender_id === 'string' ? 'Unknown' : replyingTo.sender_id.name,
            sent_at: replyingTo.sent_at,
          }
        : null,
      is_recalled: false,
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput('');
    setReplyingTo(null);

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const response = await chatService.sendPropertyMessage(targetId, content, replyToId);

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? ({
                ...response,
                property_id: typeof response.property_id === 'string' ? response.property_id : response.property_id._id,
                sender_id:
                  typeof response.sender_id === 'string'
                    ? ({
                        _id: response.sender_id,
                        name: user.name || '',
                        email: user.email || '',
                        username: user.email || '',
                      } as MessageUser)
                    : response.sender_id,
                is_recalled: false, // Add missing field
              } as ConversationMessage)
            : msg,
        ),
      );

      console.log('✅ Property message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);

      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));

      // Restore input
      setMessageInput(content);
      if (replyingTo) setReplyingTo(replyingTo);

      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  }, [messageInput, selectedProperty, user, replyingTo, canSendToProperty, getTargetIdFromConversation]);

  // Handle textarea changes
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  }, []);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  // Handle input focus (mark as read)
  const handleInputFocus = useCallback(() => {
    if (selectedProperty) {
      chatService.markPropertyConversationAsRead(selectedProperty.id);
    }
  }, [selectedProperty]);

  // Handle emoji select
  const handleEmojiSelect = useCallback((emojiData: { emoji: string }) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }, []);

  // Handle reply message
  const handleReplyMessage = useCallback((message: ConversationMessage) => {
    setReplyingTo(message);
  }, []);

  // Cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Toggle reaction
  const handleToggleReaction = useCallback(async (messageId: string, reactionType: string) => {
    try {
      await chatService.toggleReaction(messageId, reactionType);
      console.log('✅ Reaction toggled');
    } catch (error) {
      console.error('❌ Error toggling reaction:', error);
      toast.error('Không thể thêm reaction');
    }
  }, []);

  // Recall message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);

      // Update UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                is_recalled: true,
                content: 'Bạn đã thu hồi một tin nhắn',
              }
            : msg,
        ),
      );

      toast.success('Đã thu hồi tin nhắn');
    } catch (error) {
      console.error('❌ Error recalling message:', error);
      toast.error('Không thể thu hồi tin nhắn');
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socketService.isConnected() || !user) return;

    const handleNewMessage = (message: SocketNewMessage) => {
      console.log('📨 New property message received:', message);
      console.log('📨 Current selected property:', selectedProperty);

      // Extract property ID from message
      const messagePropertyId = message.property_id?._id || message.property_id;
      console.log('📨 Message property ID:', messagePropertyId);

      if (selectedProperty && messagePropertyId && messagePropertyId === selectedProperty.id) {
        console.log('✅ Message belongs to current conversation, adding to UI');

        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((m) => m._id === message._id);
          if (exists) {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }

          // Convert to ConversationMessage format
          const newMessage: ConversationMessage = {
            _id: message._id,
            sender_id: message.sender_id,
            property_id: messagePropertyId,
            content: message.content,
            sent_at: message.sent_at,
            is_read: message.is_read,
            reactions: message.reactions || [],
            reply_to: message.reply_to || null,
            is_recalled: message.is_recalled || false,
          };

          console.log('✅ Adding new message to UI:', newMessage);
          return [...prev, newMessage];
        });

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        console.log('ℹ️ Message not for current conversation, updating conversations list only');
      }

      // Update conversations list for unread counts
      loadConversations();
    };

    const handleConversationUpdate = (update: unknown) => {
      console.log('🔄 Property conversation update:', update);
      // Refresh conversations to get updated unread counts
      loadConversations();
    };

    const handleReactionUpdate = (message: { _id: string; reactions: unknown }) => {
      console.log('👍 Property reaction update:', message);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? { ...msg, reactions: message.reactions } : msg)),
      );
    };

    const handleMessageRecalled = (message: { _id: string }) => {
      console.log('↩️ Property message recalled:', message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === message._id ? { ...msg, is_recalled: true, content: 'Tin nhắn đã bị thu hồi' } : msg,
        ),
      );
    };

    // Subscribe to socket events and get cleanup functions
    const unsubscribeNewMessage = socketService.onNewMessage(handleNewMessage);
    const unsubscribeConversationUpdate = socketService.onConversationUpdate(handleConversationUpdate);

    // Check if onReactionUpdate method exists before calling
    const unsubscribeReactionUpdate = socketService.onReactionUpdate
      ? socketService.onReactionUpdate(handleReactionUpdate)
      : null;

    const unsubscribeMessageRecall = socketService.onMessageRecall(handleMessageRecalled);

    return () => {
      // Call cleanup functions
      unsubscribeNewMessage();
      unsubscribeConversationUpdate();
      unsubscribeReactionUpdate?.();
      unsubscribeMessageRecall?.();
    };
  }, [selectedProperty, user, loadConversations]);

  // Initialize
  useEffect(() => {
    if (user && token) {
      loadConversations();

      // Connect to socket
      if (!socketService.isConnected()) {
        socketService.connect(token, user._id);
      }

      // Load saved selected property
      const savedProperty = localStorage.getItem('selectedProperty');
      if (savedProperty) {
        try {
          const parsedProperty = JSON.parse(savedProperty);
          setSelectedProperty(parsedProperty);
          loadMessages(parsedProperty.id);
        } catch (error) {
          console.error('Error loading saved property:', error);
        }
      }
    }
  }, [user, token, loadConversations, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return {
    // States
    messageInput,
    messages: displayedMessages,
    selectedProperty,
    textareaHeight,
    conversations,
    messagesEndRef,
    showEmojiPicker,
    showReactionPicker,
    isLoadingMoreMessages,
    hasMoreMessages,
    replyingTo,
    myId,
    user,
    token,
    isLoadingConversations,
    quickReactions,

    // State setters
    setShowEmojiPicker,
    setShowReactionPicker,

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
    handleInputFocus,

    // Utilities
    canSendToProperty,
    format,
    loadConversations,
    loadMessages,
  };
};
