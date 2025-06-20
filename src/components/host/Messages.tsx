import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Paperclip, Smile, Send, Check } from 'lucide-react';
import chatService, { Message } from '@/services/chat.service';
import socketService from '@/services/socket.service';
import { format } from 'date-fns';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';

export default function Messages() {
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myId = user?._id;

  useEffect(() => {
    if (!token || !myId) return;

    const handleNewMessage = (message: any) => {
      console.log('New message received:', message);
    
      const senderId = message.sender_id?._id || message.sender_id || message.senderId;
      const receiverId = message.receiver_id?._id || message.receiver_id || message.receiverId;
    
      const isCurrentChat =
        selectedUser &&
        (senderId === selectedUser.id || receiverId === selectedUser.id);
    
      const normalizedMessage = {
        id: message._id || message.id,
        content: message.content,
        senderId,
        receiverId,
        conversationId: message.conversation_id || message.conversationId || '',
        createdAt: message.sent_at || message.createdAt || new Date().toISOString(),
        isRead: message.is_read === 'read' || message.is_read === true,
      };
    
      // ✅ Luôn cập nhật conversation (gồm cả user chưa click)
      setConversations(prev => {
        const updatedConversations = [...prev];
        const idx = updatedConversations.findIndex(
          c => c.participants.includes(senderId) && c.participants.includes(receiverId)
        );
    
        if (idx !== -1) {
          updatedConversations[idx] = {
            ...updatedConversations[idx],
            lastMessage: normalizedMessage,
            unreadCount:
              receiverId === myId
                ? updatedConversations[idx].unreadCount + 1
                : updatedConversations[idx].unreadCount,
          };
        } else {
          updatedConversations.unshift({
            participants: [senderId, receiverId],
            lastMessage: normalizedMessage,
            unreadCount: receiverId === myId ? 1 : 0,
          });
        }
    
        return updatedConversations;
      });
    
      // ✅ Nếu đang trong cuộc chat với người đó → cập nhật messages
      if (isCurrentChat) {
        setMessages(prev => {
          if (prev.some(msg => msg.id === normalizedMessage.id)) return prev;
          return [...prev, normalizedMessage];
        });
        scrollToBottom();
      }
    };
    
    socketService.connect(token, myId);
    const unsubscribe = socketService.onNewMessage(handleNewMessage);

    return () => {
      unsubscribe();
    };
  }, [token, myId]);

  useEffect(() => {
    if (!token || !myId) return;

    const fetchInitialData = async () => {
      try {
        const [usersRes, conversationsRes] = await Promise.all([
          chatService.getUsers(),
          chatService.getConversations(myId)
        ]);
        
        setUsers(usersRes.data?.users || usersRes.users || []);
        setConversations(Array.isArray(conversationsRes) ? conversationsRes : []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
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
        avatar: selected?.avatar || '/placeholder.svg'
      });
      
      const messages = await chatService.getConversation(myId, userId);
      setMessages(messages);
      
      // Reset unread count for this conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.participants.includes(userId) ? { ...c, unreadCount: 0 } : c
        )
      );
      
      scrollToBottom();
    } catch (error) {
      console.error('Error connecting to chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedUser && user && myId) {
      try {
        const response = await chatService.sendMessage(selectedUser.id, messageInput);
        console.log('Send message response:', response);
        
        const newMessage = {
          id: response._id,
          content: response.content,
          senderId: response.sender_id?._id || response.sender_id || myId,
          receiverId: response.receiver_id?._id || response.receiver_id || selectedUser.id,
          conversationId: response.conversation_id || '',
          createdAt: response.sent_at || new Date().toISOString(),
          isRead: response.is_read === 'read' || response.is_read === true
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        scrollToBottom();

        // Cập nhật conversations
        setConversations(prev => {
          const updatedConversations = [...prev];
          const conversationIndex = updatedConversations.findIndex(
            c => c.participants.includes(myId) && c.participants.includes(selectedUser.id)
          );

          if (conversationIndex !== -1) {
            updatedConversations[conversationIndex] = {
              ...updatedConversations[conversationIndex],
              lastMessage: newMessage
            };
          } else {
            updatedConversations.unshift({
              participants: [myId, selectedUser.id],
              lastMessage: newMessage,
              unreadCount: 0
            });
          }

          return updatedConversations;
        });
      } catch (error) {
        console.error('Error sending message:', error);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user || !user._id || !token) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r border-gray-200 p-4">
        <div className="space-y-4">
          {users
            .filter((u) => {
              const id = u?._id;
              return id && myId && id !== myId;
            })
            .map((u) => {
              const conversation = conversations.find(c =>
                c && Array.isArray(c.participants) && u && u._id && user && user._id &&
                c.participants.includes(u._id) && c.participants.includes(user._id)
              );
              return (
                <div
                  key={u._id}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-gray-100 ${selectedUser?.id === u._id ? 'bg-gray-200' : ''}`}
                  onClick={() => handleConnect(u._id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatar || '/placeholder.svg'} alt={u.name} />
                    <AvatarFallback>{u.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{u.name || `User ${u._id}`}</div>
                      {conversation?.lastMessage?.createdAt && (
                        <div className="text-xs text-gray-500">
                          {(() => {
                            const date = conversation?.lastMessage?.createdAt;
                            if (!date) return '';
                            const d = new Date(date);
                            return isNaN(d.getTime()) ? 'N/A' : format(d, 'HH:mm');
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {conversation?.lastMessage?.content || 'No messages yet'}
                    </div>
                    {conversation?.unreadCount > 0 && (
                      <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUser?.avatar || '/placeholder.svg'} alt={selectedUser?.name || 'User'} />
              <AvatarFallback>{selectedUser?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedUser?.name || 'Select a user'}</h2>
              <p className="text-sm text-green-600">Đang hoạt động</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 bg-gray-50">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages && messages.length > 0 ? (
              messages.map((message, index) => {
                const myId = user?._id;
                const isOwnMessage = message && myId && message.senderId === myId;
                const sender = isOwnMessage ? user : users.find(u => u?._id && message && message.senderId && u._id === message.senderId);
                const showAvatar = !isOwnMessage && (!messages[index - 1] || messages[index - 1].senderId !== message.senderId);

                return (
                  <div
                    key={message.id || index}
                    className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {showAvatar && !isOwnMessage && (
                      <Avatar className="h-8 w-8 mt-auto">
                        <AvatarImage src={sender?.avatar || '/placeholder.svg'} alt={sender?.name || 'User'} />
                        <AvatarFallback>{sender?.name?.charAt ? sender?.name.charAt(0) : 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    {!showAvatar && !isOwnMessage && <div className="w-8" />}
                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
                      {showAvatar && !isOwnMessage && (
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {sender?.name || 'Unknown'}
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {(() => {
                          const date = message?.createdAt;
                          if (!date) return '';
                          const d = new Date(date);
                          return isNaN(d.getTime()) ? 'N/A' : format(d, 'HH:mm');
                        })()}
                        {isOwnMessage && message.isRead && (
                          <span className="text-blue-500">
                            <Check className="h-3 w-3 inline" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500">
                {selectedUser ? 'Chưa có tin nhắn nào' : 'Chọn một người dùng để bắt đầu chat'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Aa"
                className="pr-20 rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedUser}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
                  <Smile className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="rounded-full bg-blue-500 hover:bg-blue-600"
              disabled={!messageInput.trim() || !selectedUser}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}