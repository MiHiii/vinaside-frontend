import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmojiPicker from 'emoji-picker-react';
import chatService, { Message, MessageReaction, ReactionType } from '@/services/chat.service';
import socketService from '@/services/socket.service';
import { format } from 'date-fns';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { User } from '@/types/user';

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
}

interface Conversation {
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export default function Messages() {
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const myId = user?._id;

  // Debug effect - remove duplicate logging
  useEffect(() => {
    console.log('🔍 Debug render effect:', { usersLength: users.length, myId });
  }, [users.length, myId]); // Only log when length changes, not full array

  // Load selected user from localStorage on component mount
  useEffect(() => {
    const savedSelectedUser = localStorage.getItem('selectedUser');
    if (savedSelectedUser && users.length > 0) {
      try {
        const parsedUser = JSON.parse(savedSelectedUser);
        const userExists = users.find((u) => u._id === parsedUser.id);
        if (userExists) {
          setSelectedUser(parsedUser);
          // Load messages for this user
          chatService
            .getConversation(parsedUser.id)
            .then((messages) => {
              setMessages(messages);
              scrollToBottom();
            })
            .catch((err) => console.error('Error loading saved conversation:', err));
        }
      } catch (error) {
        console.error('Error parsing saved selected user:', error);
        localStorage.removeItem('selectedUser');
      }
    }
  }, [users.length]); // Only trigger when users array length changes

  // Save selected user to localStorage whenever it changes
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem('selectedUser');
    }
  }, [selectedUser]);

  // Optimize socket message handling
  useEffect(() => {
    if (!token || !myId) return;

    const handleNewMessage = (message: SocketMessage) => {
      console.log('🎉 New message received in component:', message);

      const senderId =
        typeof message.sender_id === 'object'
          ? message.sender_id?._id || ''
          : message.sender_id || message.senderId || '';
      const receiverId =
        typeof message.receiver_id === 'object'
          ? message.receiver_id?._id || ''
          : message.receiver_id || message.receiverId || '';

      const isCurrentChat = selectedUser && (senderId === selectedUser.id || receiverId === selectedUser.id);

      const normalizedMessage: Message = {
        id: message._id || message.id || `temp_${Date.now()}`,
        content: message.content,
        senderId,
        receiverId,
        conversationId: message.conversation_id || message.conversationId || '',
        createdAt: message.sent_at || message.createdAt || new Date().toISOString(),
        isRead: message.is_read === 'read',
      };

      // Update unread counts
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };

        // Only increment if I'm the receiver and not viewing this conversation
        if (receiverId === myId && (!selectedUser || selectedUser.id !== senderId)) {
          newCounts[senderId] = (newCounts[senderId] || 0) + 1;
        }

        return newCounts;
      });

      // ✅ Update conversations
      setConversations((prev) => {
        if (!senderId || !receiverId) return Array.isArray(prev) ? prev : [];

        const currentConversations = Array.isArray(prev) ? prev : [];
        const updatedConversations = [...currentConversations];

        const idx = updatedConversations.findIndex(
          (c) =>
            c &&
            Array.isArray(c.participants) &&
            c.participants.includes(senderId) &&
            c.participants.includes(receiverId),
        );

        if (idx !== -1) {
          updatedConversations[idx] = {
            ...updatedConversations[idx],
            lastMessage: normalizedMessage,
            unreadCount: unreadCounts[senderId] || 0,
          };
        } else {
          const initialUnreadCount = receiverId === myId && (!selectedUser || selectedUser.id !== senderId) ? 1 : 0;
          updatedConversations.unshift({
            participants: [senderId, receiverId],
            lastMessage: normalizedMessage,
            unreadCount: initialUnreadCount,
          });
        }

        return updatedConversations;
      });

      // ✅ Update messages if in current chat
      if (isCurrentChat) {
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          // Enhanced duplicate detection
          const isDuplicate = currentMessages.some(
            (msg) =>
              msg.id === normalizedMessage.id ||
              (msg.content === normalizedMessage.content &&
                msg.senderId === normalizedMessage.senderId &&
                Math.abs(new Date(msg.createdAt).getTime() - new Date(normalizedMessage.createdAt).getTime()) < 2000),
          );

          if (isDuplicate) {
            console.log('Duplicate message detected, skipping');
            return currentMessages;
          }

          const newMessages = [...currentMessages, normalizedMessage];
          setTimeout(() => scrollToBottom(), 100);
          return newMessages;
        });
      }
    };

    // Socket setup
    if (socketService.isConnected()) {
      console.log('✅ Socket already connected, just registering handlers');
    } else {
      console.log('🔌 Connecting to socket...');
      socketService.connect(token, myId);
    }

    const unsubscribe = socketService.onNewMessage(handleNewMessage);

    // Listen for reaction updates
    const unsubscribeReactions = socketService.onReactionUpdate((data) => {
      console.log('🎉 Reaction update received in component:', data);

      // Update message reactions in real-time
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return {
              ...msg,
              reactions: data.reactions as MessageReaction[],
            };
          }
          return msg;
        }),
      );
    });

    const connectionCheckTimeout = setTimeout(() => {
      if (!socketService.isConnected()) {
        console.warn('⚠️ Socket not connected after 5 seconds, attempting force reconnect');
        socketService.forceReconnect(token, myId);
      }
    }, 5000);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      unsubscribe();
      unsubscribeReactions();
      clearTimeout(connectionCheckTimeout);
    };
  }, [token, myId, selectedUser?.id, unreadCounts]);

  useEffect(() => {
    if (!token || !myId) return;

    const fetchInitialData = async () => {
      try {
        console.log('🔄 Fetching initial data...');
        const [usersRes, conversationsRes] = await Promise.all([
          chatService.getUsers(),
          chatService.getConversations(),
        ]);

        console.log('👥 Users API response:', usersRes);
        console.log('💬 Conversations API response:', conversationsRes);

        // Handle users data - convert object to array
        let processedUsers = [];
        if (usersRes?.success && Array.isArray(usersRes.data)) {
          // New API format with success flag
          processedUsers = usersRes.data;
        } else if (usersRes?.data && Array.isArray(usersRes.data)) {
          // Direct data array
          processedUsers = usersRes.data;
        } else if (usersRes?.data && typeof usersRes.data === 'object') {
          // Old format - convert object to array
          const usersObject = usersRes.data;
          // Only convert numeric keys to avoid including success, statusCode, message
          const numericKeys = Object.keys(usersObject).filter((key) => !isNaN(Number(key)));
          processedUsers = numericKeys.map((key) => usersObject[key as keyof typeof usersObject]);
          console.log('🔄 Converting users object to array:', processedUsers);
          console.log('🔄 Numeric keys found:', numericKeys);
          console.log('🔄 Is processed users array?', Array.isArray(processedUsers));
        } else {
          // Fallback for other formats - removed .users access
          const fallbackUsers = usersRes?.data || usersRes || [];
          processedUsers = Array.isArray(fallbackUsers) ? fallbackUsers : [];
        }

        // Handle conversations data - NEW API FORMAT
        let processedConversations: Conversation[] = [];

        const conversationsData = conversationsRes as unknown as { success?: boolean; data?: Record<string, unknown> };

        if (conversationsData?.success && conversationsData.data && typeof conversationsData.data === 'object') {
          // New API format: data is object with numeric keys
          const conversationsObject = conversationsData.data;
          const numericKeys = Object.keys(conversationsObject).filter((key) => !isNaN(Number(key)));

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
                ? [conv.lastMessage.sender_id, conv.lastMessage.receiver_id]
                : [myId, conv._id],
              lastMessage: conv.lastMessage
                ? {
                    id: conv.lastMessage._id,
                    content: conv.lastMessage.content,
                    senderId: conv.lastMessage.sender_id,
                    receiverId: conv.lastMessage.receiver_id,
                    conversationId: '',
                    createdAt: conv.lastMessage.sent_at || conv.lastMessage.createdAt || new Date().toISOString(),
                    isRead: conv.lastMessage.is_read === 'read', // Only "read" counts as read
                  }
                : undefined,
              unreadCount: conv.unreadCount || 0,
            };
          });
        } else {
          // Fallback for other formats
          const conversations = Array.isArray(conversationsRes)
            ? conversationsRes
            : (conversationsRes as unknown as { data?: unknown })?.data || [];
          processedConversations = Array.isArray(conversations) ? (conversations as unknown as Conversation[]) : [];
        }

        console.log('👥 Processed users (final):', processedUsers);
        console.log('💬 Processed conversations:', processedConversations);

        setUsers(processedUsers as User[]);
        setConversations(processedConversations);
      } catch (err) {
        console.error('❌ Error fetching initial data:', err);
        const error = err as { response?: { data?: unknown; status?: number } };
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
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
        avatar: selected?.avatar || '/placeholder.svg',
      });

      const messages = await chatService.getConversation(userId);
      setMessages(messages);

      // Reset unread count for this conversation immediately
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[userId]; // Remove unread count for this user
        return newCounts;
      });

      setConversations((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((c) => {
          // Reset unread count for the conversation with this user
          if (c.participants.includes(userId) && c.participants.includes(myId)) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        });
      });

      // Mark conversation as read using the new API
      try {
        const result = await chatService.markConversationAsRead(userId, myId);
        console.log('✅ Conversation marked as read:', result);

        // Refresh messages to get updated read status
        if (result.success) {
          const updatedMessages = await chatService.getConversation(userId);
          setMessages(updatedMessages);
          console.log('🔄 Messages refreshed with updated read status');
        }
      } catch (error) {
        console.error('❌ Error marking conversation as read:', error);
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error connecting to chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedUser && user && myId) {
      try {
        // Fixed: Updated to match new API - only need receiverId and content (no senderId parameter)
        const response = await chatService.sendMessage(selectedUser.id, messageInput);
        console.log('Send message response:', response);

        // Handle the new API response format
        const responseData = response?.data || response;
        const newMessage = {
          id: responseData._id || `temp_${Date.now()}`,
          content: responseData.content || messageInput,
          senderId: responseData.sender_id || myId,
          receiverId: responseData.receiver_id || selectedUser.id,
          conversationId: (responseData as unknown as { conversation_id?: string }).conversation_id || '',
          createdAt: responseData.sent_at || responseData.createdAt || new Date().toISOString(),
          isRead: responseData.is_read === 'read', // Only "read" counts as read, not "delivered"
        };

        console.log('📤 Processed new message:', newMessage);

        // Immediately add message to UI
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          // Check if message already exists to prevent duplicates
          if (
            currentMessages.some(
              (msg) =>
                msg.id === newMessage.id ||
                (msg.content === newMessage.content &&
                  Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000),
            )
          ) {
            console.log('Message already exists, skipping add');
            return currentMessages;
          }
          console.log('💬 Adding sent message to UI');
          return [...currentMessages, newMessage];
        });

        setMessageInput('');
        scrollToBottom();

        // Update conversations - optimize to prevent duplicate updates
        setConversations((prev) => {
          if (!Array.isArray(prev)) return [];
          const updatedConversations = [...prev];
          const conversationIndex = updatedConversations.findIndex(
            (c) => c.participants.includes(myId) && c.participants.includes(selectedUser.id),
          );

          if (conversationIndex !== -1) {
            // Only update if the message is newer
            const existingMessage = updatedConversations[conversationIndex].lastMessage;
            if (!existingMessage || new Date(newMessage.createdAt) > new Date(existingMessage.createdAt)) {
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

        // Emit message via socket for real-time to other users
        if (socketService.isConnected()) {
          console.log('📡 Emitting message via socket for real-time');
          socketService.sendMessage({
            content: newMessage.content,
            receiverId: selectedUser.id,
          });
        } else {
          console.warn('⚠️ Socket not connected, message sent via HTTP only');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const axiosError = error as {
          response?: { status: number; statusText: string; data: unknown; headers: unknown };
        };
        if (axiosError.response) {
          console.error('❌ Backend error response:', {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data,
            headers: axiosError.response.headers,
          });
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  // Enhanced auto-scroll when messages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Scroll to bottom when selecting a new conversation
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 200);
    }
  }, [selectedUser]);

  // Quick reactions mapping (Instagram style with ReactionType)
  const quickReactions: { emoji: string; type: ReactionType }[] = [
    { emoji: '👍', type: ReactionType.LIKE },
    { emoji: '❤️', type: ReactionType.LOVE },
    { emoji: '😂', type: ReactionType.LAUGH },
    { emoji: '😮', type: ReactionType.WOW },
    { emoji: '😢', type: ReactionType.SAD },
    { emoji: '😡', type: ReactionType.ANGRY },
  ];

  // Handle emoji selection from picker
  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle toggling reaction (recommended approach)
  const handleToggleReaction = async (messageId: string, reactionType: ReactionType) => {
    try {
      const response = await chatService.toggleReaction(messageId, reactionType);

      // Update message in local state based on response
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            // Assume response contains updated reactions array
            return {
              ...msg,
              reactions: response.data?.reactions || msg.reactions || [],
            };
          }
          return msg;
        }),
      );

      setShowReactionPicker(null);
    } catch (error) {
      console.error('❌ Error toggling reaction:', error);
    }
  };

  if (!user || !user._id || !token) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>;
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Instagram-style scrollbar */
        .messages-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .messages-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
        .messages-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Smooth scroll behavior */
        .messages-scroll {
          scroll-behavior: smooth;
        }
        
        /* Instagram-style message reactions */
        .message-reaction:hover {
          transform: scale(1.1);
        }
        
        /* Emoji picker styling */
        .emoji-picker-react {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          border-radius: 12px !important;
          border: 1px solid #e1e5e9 !important;
        }
        
        /* Message bubble improvements */
        .message-bubble {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Reaction button hover effect */
        .reaction-btn {
          transition: all 0.2s ease;
        }
        .reaction-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className='flex h-screen bg-white'>
        <div className='w-64 border-r border-gray-200 p-4'>
          <div className='space-y-4'>
            {users.length === 0 && (
              <div className='text-center text-gray-500 py-4'>Đang tải danh sách người dùng...</div>
            )}
            {users
              .filter((u) => {
                const id = u?._id;
                const isValid = id && myId && id !== myId;
                return isValid;
              })
              .map((u) => {
                const conversation = Array.isArray(conversations)
                  ? conversations.find(
                      (c) =>
                        c &&
                        Array.isArray(c.participants) &&
                        u &&
                        u._id &&
                        user &&
                        user._id &&
                        c.participants.includes(u._id) &&
                        c.participants.includes(user._id),
                    )
                  : undefined;
                return (
                  <div
                    key={u._id}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-gray-100 ${
                      selectedUser?.id === u._id ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => handleConnect(u._id)}>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={u.avatar || '/placeholder.svg'} alt={u.name} />
                      <AvatarFallback>{u.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between'>
                        <div className='font-medium'>{u.name || `User ${u._id}`}</div>
                        {conversation?.lastMessage?.createdAt && (
                          <div className='text-xs text-gray-500'>
                            {(() => {
                              const date = conversation?.lastMessage?.createdAt;
                              if (!date) return '';
                              const d = new Date(date);
                              return isNaN(d.getTime()) ? 'N/A' : format(d, 'HH:mm');
                            })()}
                          </div>
                        )}
                      </div>
                      <div className='text-sm text-gray-500 truncate'>
                        {conversation?.lastMessage?.content || 'No messages yet'}
                      </div>
                      {conversation && conversation.unreadCount > 0 && (
                        <div className='inline-flex items-center justify-center bg-blue-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 mt-1'>
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className='flex-1 flex flex-col'>
          <div className='p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={selectedUser?.avatar || '/placeholder.svg'} alt={selectedUser?.name || 'User'} />
                <AvatarFallback>{selectedUser?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className='font-semibold text-gray-900'>{selectedUser?.name || 'Select a user'}</h2>
                <p className='text-sm text-green-600'>Đang hoạt động</p>
              </div>
            </div>
            <Button variant='ghost' size='icon'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>

          <ScrollArea className='flex-1 p-4 bg-gray-50 messages-scroll' style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className='space-y-4 max-w-3xl mx-auto'>
              {messages && messages.length > 0 ? (
                messages.map((message, index) => {
                  const myId = user?._id;
                  const isOwnMessage = message && myId && message.senderId === myId;
                  const sender = isOwnMessage
                    ? user
                    : users.find((u) => u?._id && message && message.senderId && u._id === message.senderId);
                  const showAvatar =
                    !isOwnMessage && (!messages[index - 1] || messages[index - 1].senderId !== message.senderId);

                  // Determine if this is the last message in a sequence from the same sender
                  const isLastInSequence = !messages[index + 1] || messages[index + 1].senderId !== message.senderId;

                  // Only show read status for own messages that are last in sequence
                  const shouldShowReadStatus = isOwnMessage && isLastInSequence;

                  // For the last message in sequence, check if ALL messages in this sequence are read
                  let sequenceReadStatus = message.isRead;
                  if (shouldShowReadStatus) {
                    // Find all messages in current sequence (same sender, consecutive)
                    const sequenceMessages = [];
                    let i = index;
                    // Go backwards to find start of sequence
                    while (i >= 0 && messages[i].senderId === message.senderId) {
                      sequenceMessages.unshift(messages[i]);
                      i--;
                    }
                    // Go forwards to find end of sequence
                    i = index + 1;
                    while (i < messages.length && messages[i].senderId === message.senderId) {
                      sequenceMessages.push(messages[i]);
                      i++;
                    }

                    // Check if ALL messages in sequence are read
                    sequenceReadStatus = sequenceMessages.every((msg) => msg.isRead);
                  }

                  return (
                    <div
                      key={message.id || index}
                      className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                      {showAvatar && !isOwnMessage && (
                        <Avatar className='h-8 w-8 mt-auto'>
                          <AvatarImage src={sender?.avatar || '/placeholder.svg'} alt={sender?.name || 'User'} />
                          <AvatarFallback>{sender?.name?.charAt ? sender?.name.charAt(0) : 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      {!showAvatar && !isOwnMessage && <div className='w-8' />}
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
                        {showAvatar && !isOwnMessage && (
                          <div className='text-sm font-medium text-gray-900 mb-1'>{sender?.name || 'Unknown'}</div>
                        )}
                        <div
                          className={`p-3 rounded-2xl transition-all duration-200 hover:shadow-md relative group message-bubble ${
                            isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 shadow-sm'
                          }`}>
                          <p className='text-sm whitespace-pre-wrap break-words'>{message.content}</p>

                          {/* Quick reaction button - only for other users' messages with real IDs */}
                          {!isOwnMessage && message.id && !message.id.startsWith('temp_') && (
                            <div className='absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                              <DropdownMenu
                                open={showReactionPicker === message.id}
                                onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-6 w-6 rounded-full p-0 bg-white border shadow-md hover:bg-gray-50 reaction-btn'>
                                    <Plus className='h-3 w-3' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='p-2'>
                                  <div className='flex gap-1'>
                                    {quickReactions.map(({ emoji, type }) => (
                                      <Button
                                        key={emoji}
                                        variant='ghost'
                                        size='sm'
                                        className='h-8 w-8 p-0 text-lg hover:bg-gray-100 reaction-btn'
                                        onClick={() => handleToggleReaction(message.id, type)}>
                                        {emoji}
                                      </Button>
                                    ))}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        {/* Reactions display */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className='flex gap-1 mt-1 flex-wrap'>
                            {Object.entries(
                              message.reactions.reduce((acc, reaction) => {
                                const key = reaction.type || reaction.emoji; // Support both type and emoji
                                acc[key] = (acc[key] || []).concat(reaction);
                                return acc;
                              }, {} as Record<string, MessageReaction[]>),
                            ).map(([reactionKey, reactions]) => {
                              const userReacted = reactions.some((r) => r.userId === myId);
                              const reactionType = reactions[0].type;
                              const emoji =
                                reactions[0].emoji ||
                                quickReactions.find((qr) => qr.type === reactionType)?.emoji ||
                                reactionKey;

                              return (
                                <button
                                  key={reactionKey}
                                  onClick={() => handleToggleReaction(message.id, reactionType)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors message-reaction ${
                                    userReacted
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}>
                                  <span>{emoji}</span>
                                  {reactions.length > 1 && <span>{reactions.length}</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}>
                          <span>
                            {(() => {
                              const date = message?.createdAt;
                              if (!date) return '';
                              const d = new Date(date);
                              return isNaN(d.getTime()) ? 'N/A' : format(d, 'HH:mm');
                            })()}
                          </span>
                          {shouldShowReadStatus && (
                            <div className='flex items-center gap-1'>
                              {sequenceReadStatus ? (
                                <span title='Đã đọc'>
                                  <CheckCheck className='h-3 w-3 text-blue-400' />
                                </span>
                              ) : (
                                <span title='Đã gửi'>
                                  <Check className='h-3 w-3 text-gray-400' />
                                </span>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <MoreVertical className='h-3 w-3' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-40'>
                                  <DropdownMenuItem onClick={() => handleEditMessage(message.id)}>
                                    <Edit className='h-3 w-3 mr-2' />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className='text-red-600 focus:text-red-600'>
                                    <Trash2 className='h-3 w-3 mr-2' />
                                    Thu hồi
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  {selectedUser ? 'Chưa có tin nhắn nào' : 'Chọn một người dùng để bắt đầu chat'}
                </div>
              )}
              <div ref={messagesEndRef} className='h-1' />
            </div>
          </ScrollArea>

          <div className='p-4 border-t border-gray-200 bg-white'>
            <div className='flex items-center gap-2 max-w-3xl mx-auto relative'>
              <div className='flex-1 relative'>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Aa'
                  className='pr-20 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  disabled={!selectedUser}
                />
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1'>
                  <Button variant='ghost' size='icon' className='h-6 w-6 hover:bg-gray-100'>
                    <Paperclip className='h-4 w-4 text-gray-500' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 hover:bg-gray-100'
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Smile className='h-4 w-4 text-gray-500' />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                size='icon'
                className='rounded-full bg-blue-500 hover:bg-blue-600'
                disabled={!messageInput.trim() || !selectedUser}>
                <Send className='h-4 w-4' />
              </Button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className='absolute bottom-full right-0 mb-2 z-50'>
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    width={300}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    previewConfig={{
                      showPreview: false,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Handle message edit
  const handleEditMessage = async (messageId: string) => {
    try {
      console.log('✏️ Edit message:', messageId);
      // TODO: Implement edit functionality
    } catch (error) {
      console.error('❌ Error editing message:', error);
    }
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId: string) => {
    try {
      console.log('🗑️ Delete message:', messageId);
      await chatService.deleteMessage(messageId);

      // Remove message from UI
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      console.log('✅ Message deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
    }
  };
}
