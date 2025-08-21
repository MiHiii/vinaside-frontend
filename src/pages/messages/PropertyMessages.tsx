import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Check,
  CheckCheck,
  Trash2,
  Reply,
  X,
  Search,
  Settings,
  Verified,
  Building2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmojiPicker from 'emoji-picker-react';
import { usePropertyMessages } from '@/hooks/usePropertyMessages';
import { usePermissions } from '@/hooks/usePermissions';
import { NavLink } from 'react-router-dom';
import { ConversationItem, ManagementConversation, PropertyConversation } from '@/types/message';

import socketService from '@/services/socket.service';

// Type declaration for process.env
declare const process: {
  env: {
    NODE_ENV: string;
  };
};

// Helper function để check nếu là management conversation (dành cho staff/admin)
const isManagementConversation = (
  conversation: ConversationItem,
  userRole: string,
): conversation is ManagementConversation => {
  return (userRole === 'staff' || userRole === 'admin') && 'guest' in conversation && 'property' in conversation;
};

// Helper functions để extract thông tin từ ConversationItem
const getConversationDisplayInfo = (conversation: ConversationItem, userRole: string) => {
  if (isManagementConversation(conversation, userRole)) {
    // Management conversation (cho staff/admin) - có guest và property info
    const mgmtConv = conversation as ManagementConversation;
    return {
      displayName: mgmtConv.guest.name,
      displaySubtext: `Về: ${mgmtConv.property.name}`,
      avatarUrl: mgmtConv.guest.avatar_url,
      isVerified: false, // Guest không có verified badge
      fallbackInitial: mgmtConv.guest.name?.charAt(0)?.toUpperCase() || 'G',
    };
  } else {
    // Property conversation (cho guest) hoặc fallback
    const propConv = conversation as PropertyConversation;

    if (userRole === 'staff' || userRole === 'admin') {
      // Staff/Admin view với old API format (fallback)
      return {
        displayName: propConv.name === 'guest' ? 'Khách hàng' : propConv.name || 'Khách hàng',
        displaySubtext: `Property: ${propConv._id?.slice(-8) || 'Unknown'}`,
        avatarUrl: propConv.avatar_url,
        isVerified: false,
        fallbackInitial: propConv.name?.charAt(0)?.toUpperCase() || 'K',
      };
    } else {
      // Guest view: Hiển thị property info
      return {
        displayName: propConv.name || `Property ${propConv.property_id?.slice(-8) || 'Unknown'}`,
        displaySubtext: propConv.status || '',
        avatarUrl: propConv.avatar_url,
        isVerified: propConv.isVerified || false,
        fallbackInitial: propConv.name?.charAt(0)?.toUpperCase() || 'P',
      };
    }
  }
};

const getConversationHeaderInfo = (conversation: ConversationItem, userRole: string) => {
  if (isManagementConversation(conversation, userRole)) {
    // Management conversation (cho staff/admin) - có guest và property info
    const mgmtConv = conversation as ManagementConversation;
    return {
      title: mgmtConv.guest.name,
      subtitle: `Về property: ${mgmtConv.property.name}`,
      propertyId: mgmtConv.property._id,
      otherUserId: mgmtConv.otherUserId, // ID để navigate chat
    };
  } else {
    const propConv = conversation as PropertyConversation;

    if (userRole === 'staff' || userRole === 'admin') {
      // Staff/Admin view với old API format (fallback)
      return {
        title: propConv.name === 'guest' ? 'Khách hàng' : propConv.name || 'Khách hàng',
        subtitle: `Property: ${propConv._id?.slice(-8) || 'Unknown'}`,
        propertyId: propConv.property_id,
        otherUserId: propConv._id, // Fallback sử dụng conversation ID
      };
    } else {
      // Guest view: Hiển thị property info
      return {
        title: propConv.name || 'Property',
        subtitle: propConv.status || '',
        propertyId: propConv.property_id,
        otherUserId: propConv.property_id, // Guest sử dụng property ID để gửi tin nhắn
      };
    }
  }
};

export default function PropertyMessages() {
  const { hasPermission } = usePermissions();
  const {
    // States
    messageInput,
    messages,
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
    format,
  } = usePropertyMessages();

  // Helper function để check permission đơn giản
  const canSendToCurrentProperty = () => {
    console.log('🔍 canSendToCurrentProperty check:', {
      user: !!user,
      selectedProperty: !!selectedProperty,
      userRole: user?.role,
      selectedPropertyId: selectedProperty?.id,
    });

    if (!user || !selectedProperty) {
      console.log('❌ Missing user or selectedProperty');
      return false;
    }

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

    // Staff chỉ cần có permission message.manage
    if (user.role === 'staff') {
      const hasMessagePermission = hasPermission('message.manage');
      console.log('🔐 Staff permission check:', {
        userRole: user.role,
        hasMessageManage: hasMessagePermission,
        permissions: user.permissions,
        selectedPropertyId: selectedProperty.id,
      });

      if (hasMessagePermission) {
        console.log('✅ Staff has message.manage permission');
        return true;
      } else {
        console.log('❌ Staff missing message.manage permission');
        return false;
      }
    }

    console.log('❌ Unknown role or condition');
    return false;
  };

  if (!user || !user._id || !token) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>;
  }

  // Debug selectedProperty
  // console.log('🎯 Current selectedProperty state:', {
  //   selectedProperty,
  //   conversations: conversations.length,
  //   userRole: user.role,
  //   userPermissions: user.permissions,
  // });

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }

        /* Instagram-style scrollbar */
        .messages-scroll::-webkit-scrollbar { width: 4px; }
        .messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 2px; }
        .messages-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }

        .messages-scroll { scroll-behavior: smooth; }

        /* Reactions */
        .message-reaction:hover { transform: scale(1.1); }

        /* Emoji picker */
        .emoji-picker-react {
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
          border-radius: 12px !important;
          border: 1px solid #e1e5e9 !important;
        }

        /* Message bubble */
        .message-bubble { backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); position: relative; }
        .message-bubble:hover .group-hover\\:opacity-100 { opacity: 1 !important; }

        /* Buttons show on hover */
        .message-menu-btn { opacity: 0; transition: opacity 0.2s ease; }
        .message-bubble:hover .message-menu-btn { opacity: 1; }

        /* Reply preview + quoted */
        .reply-preview { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 3px solid #3b82f6; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .quoted-message { position: relative; overflow: hidden; }
        .quoted-message::before { content: ''; position: absolute; left:0; top:0; bottom:0; width:3px; background: currentColor; opacity:.5; }
        .border-l-3 { border-left-width: 3px; }
        .reply-container { position: relative; margin-bottom: 2px; }
        .reply-container::after { content:''; position:absolute; bottom:-2px; left:3px; right:3px; height:2px; background: currentColor; opacity:.2; border-radius:1px; }
        .message-with-reply { border-top-left-radius: 4px !important; border-top-right-radius: 4px !important; }
        .reply-container, .message-bubble { transition: all .2s ease-in-out; }
        .reply-container:hover { transform: translateY(-1px); }

        /* Input area */
        .auto-expand-textarea { transition: height .2s ease-in-out; line-height: 1.5; }
        .input-area-container { transform-origin: bottom; transition: all .2s ease-in-out; }

        /* Small-screen tweaks */
        @media (max-width: 768px) {
          .sidebar-card { border-right: 0 !important; }
          .conversation-item { width: 100% !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>

      <div
        className='
          flex flex-col md:flex-row
          p-3 mx-auto
          h-[calc(90vh-40px)]
          bg-background
          gap-3 md:gap-0
          max-w-[1400px]
        '>
        {/* Sidebar */}
        <div
          className='
            sidebar-card
            w-full md:w-[300px] lg:w-[340px] xl:w-[380px]
            md:border-r border-gray-200
            p-2 bg-background
            rounded-xl md:rounded-none
          '>
          <div className='bg-background mt-1 md:mt-3'>
            <div className='flex items-center justify-between'>
              {/* Header title */}
              <h1 className='text-lg md:text-xl font-semibold text-foreground'>Tin nhắn</h1>

              {/* Right side - Only show admin controls for non-guest users or in development */}
              <div className='flex items-center gap-2'>
                {/* Connection Status - Only for development or admin/staff */}
                {(process.env.NODE_ENV === 'development' || (user && user.role !== 'guest')) && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      socketService.getConnectionStatus() === 'connected'
                        ? 'bg-green-100 text-green-600'
                        : socketService.getConnectionStatus() === 'connecting'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        socketService.getConnectionStatus() === 'connected'
                          ? 'bg-green-500'
                          : socketService.getConnectionStatus() === 'connecting'
                          ? 'bg-yellow-500 animate-pulse'
                          : 'bg-red-500'
                      }`}></div>
                    {socketService.getConnectionStatus() === 'connected'
                      ? 'Online'
                      : socketService.getConnectionStatus() === 'connecting'
                      ? 'Đang kết nối...'
                      : 'Offline'}
                  </div>
                )}

                {/* Admin tools - Only show for admin/staff or in development */}
                {(process.env.NODE_ENV === 'development' || (user && user.role !== 'guest')) && (
                  <div className='flex space-x-1'>
                    <button className='p-2 bg-background rounded-full hover:bg-gray-100'>
                      <Search className='w-4 h-4 text-foreground' />
                    </button>
                    <Button className='p-2 bg-background rounded-full hover:bg-gray-100' variant='ghost'>
                      <Settings className='w-4 h-4 text-foreground' />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-3 md:space-y-4 mt-3 md:mt-4'>
            {isLoadingConversations ? (
              // Loading skeleton
              <div className='space-y-3'>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className='w-full justify-start text-base font-medium px-4 py-3 min-h-20 rounded-2xl shadow-none transition flex items-center gap-3 animate-pulse'>
                    <div className='h-10 w-10 bg-gray-200 rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-gray-200 rounded mb-2'></div>
                      <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className='text-center text-muted-foreground py-4'>
                <div className='mb-2'>Chưa có cuộc hội thoại nào với property.</div>
                <div className='text-xs text-gray-500'>
                  Hãy thử gửi tin nhắn từ trang property để bắt đầu cuộc trò chuyện.
                </div>
              </div>
            ) : (
              conversations.map((conversation) => {
                const displayInfo = getConversationDisplayInfo(conversation, user?.role || 'guest');

                return (
                  <div
                    key={conversation._id}
                    className={`
                      conversation-item
                      w-full justify-start text-base font-medium
                      px-4 py-3 min-h-20 rounded-2xl shadow-none transition
                      flex items-center gap-3 cursor-pointer
                      ${
                        selectedProperty?.id === conversation._id
                          ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold'
                          : 'bg-transparent'
                      }
                      hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]
                      focus:outline-none
                    `}
                    onClick={() => handleConnect(conversation._id)}>
                    <div className='relative'>
                      <Avatar
                        className={`h-10 w-10 ${
                          (conversation.unreadCount || 0) > 0 ? 'ring-2 ring-blue-300 ring-offset-2' : ''
                        }`}>
                        {displayInfo.avatarUrl ? (
                          <AvatarImage
                            src={displayInfo.avatarUrl}
                            alt={displayInfo.displayName}
                            onError={(e) => {
                              console.log('🖼️ Avatar failed to load:', displayInfo.avatarUrl);
                              // Set to null to trigger fallback
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <AvatarFallback className='bg-black text-white font-semibold'>
                          {displayInfo.fallbackInitial}
                        </AvatarFallback>
                      </Avatar>
                      {displayInfo.isVerified && (
                        <div className='absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1'>
                          <Verified className='h-3 w-3 text-white' />
                        </div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-center gap-2'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`font-medium truncate ${
                              (conversation.unreadCount || 0) > 0 ? 'text-blue-600 font-bold' : 'text-foreground'
                            }`}>
                            {displayInfo.displayName}
                          </div>
                          {displayInfo.isVerified && <Verified className='h-4 w-4 text-blue-500' />}
                        </div>

                        {conversation.lastMessage && (
                          <div className='text-[10px] md:text-xs text-muted-foreground whitespace-nowrap'>
                            {format(new Date(conversation.lastMessage.sent_at), 'HH:mm')}
                          </div>
                        )}
                      </div>

                      <div className='flex items-center justify-between'>
                        <div
                          className={`
                            text-xs md:text-sm truncate text-foreground
                            ${
                              (conversation.unreadCount || 0) > 0
                                ? 'text-blue-600 font-semibold'
                                : 'text-muted-foreground'
                            }
                          `}>
                          {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                        </div>

                        <div className='flex items-center gap-2'>
                          <Badge variant='secondary' className='text-xs'>
                            {displayInfo.displaySubtext || 'active'}
                          </Badge>

                          {(conversation.unreadCount || 0) > 0 && (
                            <div className='inline-flex items-center justify-center bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded-full min-w-[18px] h-4 md:h-5 px-1 md:px-1.5 animate-pulse'>
                              {(conversation.unreadCount || 0) > 99 ? '99+' : conversation.unreadCount || 0}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className='flex-1 flex flex-col min-h-0'>
          {selectedProperty ? (
            <>
              {/* Header */}
              <div className='p-3 md:p-4 border-b border-gray-100 flex items-center justify-between bg-background shadow-sm flex-shrink-0'>
                <div className='flex items-center gap-3 md:gap-4 ml-1 md:ml-5 min-w-0'>
                  <NavLink to={`/property/${selectedProperty.id}`}>
                    <div className='relative'>
                      <Avatar className='h-10 w-10 md:h-12 md:w-12 cursor-pointer hover:opacity-80 transition-opacity'>
                        {selectedProperty.avatar ? (
                          <AvatarImage
                            src={selectedProperty.avatar}
                            alt={selectedProperty.name}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <AvatarFallback className='bg-black text-white font-semibold'>
                          {(() => {
                            const currentConversation = conversations.find((c) => c._id === selectedProperty.id);
                            if (currentConversation) {
                              const displayInfo = getConversationDisplayInfo(
                                currentConversation,
                                user?.role || 'guest',
                              );
                              return displayInfo.fallbackInitial;
                            }
                            return selectedProperty.name?.charAt(0)?.toUpperCase() || 'P';
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedProperty.isVerified && (
                        <div className='absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1'>
                          <Verified className='h-3 w-3 text-white' />
                        </div>
                      )}
                    </div>
                  </NavLink>
                  <div className='min-w-0'>
                    <NavLink to={`/property/${selectedProperty.id}`}>
                      <div className='flex items-center gap-2'>
                        <h2 className='font-semibold text-foreground text-[16px] md:text-[20px] truncate'>
                          {(() => {
                            const currentConversation = conversations.find((c) => c._id === selectedProperty.id);
                            if (currentConversation) {
                              const headerInfo = getConversationHeaderInfo(currentConversation, user?.role || 'guest');
                              return headerInfo.title;
                            }
                            return selectedProperty.name;
                          })()}
                        </h2>
                        {selectedProperty.isVerified && <Verified className='h-5 w-5 text-blue-500' />}
                      </div>
                    </NavLink>
                    {(() => {
                      const currentConversation = conversations.find((c) => c._id === selectedProperty.id);
                      if (currentConversation) {
                        const headerInfo = getConversationHeaderInfo(currentConversation, user?.role || 'guest');
                        return (
                          headerInfo.subtitle && (
                            <Badge variant='outline' className='text-xs mt-1'>
                              {headerInfo.subtitle}
                            </Badge>
                          )
                        );
                      }
                      return (
                        selectedProperty.status && (
                          <Badge variant='outline' className='text-xs mt-1'>
                            {selectedProperty.status}
                          </Badge>
                        )
                      );
                    })()}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='icon'>
                    <MoreHorizontal className='h-4 w-4 text-foreground' />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea
                className='flex-1 pt-3 md:pt-4 messages-scroll'
                style={{
                  height: `calc(100vh - ${280 + (textareaHeight - 40) + (replyingTo ? 120 : 0)}px)`,
                }}>
                <div className='space-y-3 md:space-y-4 max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] px-2 sm:px-3 md:px-4 mx-auto'>
                  {/* Load more */}
                  {hasMoreMessages && messages.length > 0 && (
                    <div className='text-center py-2'>
                      <Button
                        onClick={handleLoadMoreMessages}
                        disabled={isLoadingMoreMessages}
                        variant='outline'
                        size='sm'
                        className='text-xs'>
                        {isLoadingMoreMessages ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
                      </Button>
                    </div>
                  )}

                  {(() => {
                    console.log('🎨 UI Rendering messages:', {
                      messagesLength: messages?.length || 0,
                      messagesArray: messages,
                      firstMessage: messages?.[0],
                      selectedProperty: selectedProperty?.id,
                    });
                    return messages.length > 0;
                  })() ? (
                    messages.map((message, index) => {
                      const isOwnMessage =
                        message.sender_id &&
                        (typeof message.sender_id === 'string'
                          ? message.sender_id === myId
                          : message.sender_id._id === myId);

                      const senderInfo = typeof message.sender_id === 'object' ? message.sender_id : null;

                      const showAvatar =
                        !isOwnMessage && (!messages[index - 1] || messages[index - 1].sender_id !== message.sender_id);

                      return (
                        <div
                          key={message._id}
                          className={`flex gap-2 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          } animate-fade-in group`}>
                          {showAvatar && !isOwnMessage && (
                            <Avatar className='h-7 w-7 md:h-8 md:w-8 mt-8 md:mt-10 flex-shrink-0'>
                              <AvatarImage
                                src={senderInfo?.avatar_url || '/placeholder.svg'}
                                alt={senderInfo?.name || 'User'}
                              />
                              <AvatarFallback>{senderInfo?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                          )}
                          {!showAvatar && !isOwnMessage && <div className='w-7 md:w-8' />}

                          <div className={`max-w-[85%] sm:max-w-[78%] md:max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
                            {/* Message header */}
                            <div className='flex justify-between items-center mb-1 md:mb-2'>
                              <div className='flex-1 min-w-0'>
                                {showAvatar && !isOwnMessage && (
                                  <span className='text-[11px] md:text-[12px] font-semibold text-muted-foreground ml-1 truncate'>
                                    {senderInfo?.name || 'Unknown'}
                                  </span>
                                )}
                              </div>
                              <span className='text-[10px] md:text-[10px] text-muted-foreground ml-2 whitespace-nowrap'>
                                {format(new Date(message.sent_at), 'HH:mm')}
                              </span>
                            </div>

                            {/* Reply preview */}
                            {message.reply_to && !message.is_recalled && (
                              <div
                                className={`${isOwnMessage ? 'ml-auto' : 'mr-auto'} mb-2 reply-container`}
                                style={{ maxWidth: 'calc(100% - 0px)' }}>
                                <div
                                  className={`p-2 rounded-t-lg rounded-b-sm border-l-2 border-solid text-sm relative ${
                                    isOwnMessage ? 'bg-primary/10 border-primary' : 'bg-muted border-gray-100'
                                  }`}>
                                  <div className='text-[10px] md:text-[11px] mb-1 opacity-70'>
                                    Đang trả lời {message.reply_to.sender_name}
                                  </div>
                                  <div className='text-[14px] md:text-[15px] text-foreground opacity-80 line-clamp-2'>
                                    {message.reply_to.content.length > 60
                                      ? `${message.reply_to.content.substring(0, 60)}...`
                                      : message.reply_to.content}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Message bubble */}
                            <div
                              className={`
                                p-2.5 md:p-3 transition-all duration-200 hover:shadow-md relative group message-bubble
                                ${
                                  message.reply_to && !message.is_recalled
                                    ? 'rounded-t-sm rounded-b-2xl message-with-reply'
                                    : 'rounded-2xl'
                                }
                                ${
                                  message.is_recalled
                                    ? 'bg-muted border border-border'
                                    : isOwnMessage
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-card text-foreground shadow-sm'
                                }
                              `}
                              style={{ minHeight: '40px' }}>
                              <p
                                className={`text-[15px] md:text-[16px] whitespace-pre-wrap break-words ${
                                  message.is_recalled ? 'text-muted-foreground italic' : ''
                                }`}>
                                {message.content}
                              </p>

                              {/* Quick reaction button */}
                              {!message.is_recalled && message._id && !message._id.startsWith('temp_') && (
                                <div
                                  className={`absolute top-2.5 md:top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                    isOwnMessage ? '-left-7 md:-left-8' : '-right-7 md:-right-8'
                                  }`}>
                                  <DropdownMenu
                                    open={showReactionPicker === message._id}
                                    onOpenChange={(open) => setShowReactionPicker(open ? message._id : null)}>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-7 w-7 rounded-full p-0 bg-white border-gray-300 shadow-md hover:bg-gray-50 cursor-pointer reaction-btn z-10'>
                                        <Smile className='h-4 w-4 md:h-5 md:w-5 text-gray-800' />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      className='p-2 mb-2 bg-white border-gray-300 rounded-full'
                                      side={isOwnMessage ? 'left' : 'right'}
                                      align='center'>
                                      <div className='flex gap-1'>
                                        {quickReactions.map(({ emoji, type }) => (
                                          <Button
                                            key={emoji}
                                            variant='ghost'
                                            size='sm'
                                            className='h-8 w-8 p-0 text-lg hover:bg-gray-100 reaction-btn'
                                            onClick={() => handleToggleReaction(message._id, type)}>
                                            {emoji}
                                          </Button>
                                        ))}
                                      </div>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}

                              {/* Message menu */}
                              {!message.is_recalled && message._id && !message._id.startsWith('temp_') && (
                                <div
                                  className={`absolute top-2.5 md:top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                    isOwnMessage ? '-left-14 md:-left-16' : '-right-14 md:-right-16'
                                  }`}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-7 w-7 rounded-full bg-white border-gray-300 shadow-md hover:bg-gray-200 cursor-pointer z-10'>
                                        <MoreHorizontal className='h-4 w-4 text-gray-800' />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align={isOwnMessage ? 'start' : 'end'}
                                      className='w-36 md:w-40 bg-white border-gray-300 rounded-lg mt-4 md:mt-5 mr-10 md:mr-20'>
                                      {isOwnMessage ? (
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteMessage(message._id)}
                                          className='text-red-600 focus:text-red-600'>
                                          <Trash2 className='h-3 w-3 mr-2' />
                                          Thu hồi
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => handleReplyMessage(message)}
                                          className='text-gray-900 focus:text-gray-600'>
                                          <Reply className='h-3 w-3 mr-2' />
                                          Trả lời
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>

                            {/* Reactions display */}
                            {!message.is_recalled && message.reactions && message.reactions.length > 0 && (
                              <div className='flex gap-1 mt-1 flex-wrap'>{/* Render reactions here */}</div>
                            )}

                            {/* Read status for own messages */}
                            {isOwnMessage && (
                              <div className='flex items-center gap-1 mt-1 text-[10px] md:text-xs text-gray-500 justify-end'>
                                {message.is_read === 'read' ? (
                                  <span title='Đã đọc'>
                                    <CheckCheck className='h-3 w-3 text-blue-400' />
                                  </span>
                                ) : (
                                  <span title='Đã gửi'>
                                    <Check className='h-3 w-3 text-gray-400' />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className='text-center text-muted-foreground py-6 md:py-8'>
                      Chưa có tin nhắn nào với property này
                    </div>
                  )}
                  <div ref={messagesEndRef} className='h-1' />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className='p-3 md:p-4 border-t border-gray-200 bg-background shadow-sm flex-shrink-0 input-area-container'>
                {replyingTo && (
                  <div className='max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] mx-auto mb-3 bg-primary/10 border border-sky-500 rounded-lg p-2.5 md:p-3 shadow-sm'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Reply className='h-4 w-4 text-primary' />
                          <span className='text-[13px] md:text-[14px] text-primary truncate'>
                            Đang trả lời{' '}
                            {typeof replyingTo.sender_id === 'object' ? replyingTo.sender_id.name : 'Người dùng'}
                          </span>
                        </div>
                        <div className='text-xs md:text-sm text-foreground bg-card rounded-lg px-3 py-2 border-l-3 border-sky-500 shadow-sm'>
                          {replyingTo.content.length > 80
                            ? `${replyingTo.content.substring(0, 80)}...`
                            : replyingTo.content}
                        </div>
                      </div>
                      <button
                        onClick={handleCancelReply}
                        className='ml-2 mb-8 md:mb-10 p-1.5 hover:bg-primary/20 rounded-full transition-colors'
                        title='Hủy trả lời'>
                        <X className='h-4 w-4 text-primary' />
                      </button>
                    </div>
                  </div>
                )}

                <div className='flex items-end gap-2 max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] mx-auto relative'>
                  <div className='flex-1 relative'>
                    <Textarea
                      value={messageInput}
                      onChange={handleTextareaChange}
                      onKeyPress={handleKeyPress}
                      onFocus={handleInputFocus}
                      placeholder={
                        selectedProperty && canSendToCurrentProperty()
                          ? 'Soạn tin nhắn...'
                          : 'Bạn không có quyền gửi tin nhắn tới property này'
                      }
                      className='
                        w-full pr-20 rounded-xl border-gray-300 focus:ring-sky-500 resize-none
                        py-2 px-3 md:px-4 min-h-[40px] max-h-[120px] auto-expand-textarea
                        text-foreground bg-background
                      '
                      disabled={!selectedProperty || !canSendToCurrentProperty()}
                      rows={1}
                      style={{
                        height: `${textareaHeight}px`,
                        overflowY: textareaHeight >= 120 ? 'auto' : 'hidden',
                      }}
                    />
                    <div className='absolute right-2 md:right-3 bottom-1.5 md:bottom-2 flex items-center gap-1'>
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
                    className='rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10 flex-shrink-0'
                    disabled={!messageInput.trim() || !selectedProperty || !canSendToCurrentProperty()}>
                    <Send className='h-4 w-4' />
                  </Button>

                  {showEmojiPicker && (
                    <div className='absolute bottom-full right-0 mb-2 z-50'>
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        width={300}
                        height={400}
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center text-muted-foreground'>
                <Building2 className='h-16 w-16 mx-auto mb-4 opacity-50' />
                <h3 className='text-lg font-medium mb-2'>Chọn một property</h3>
                <p className='text-sm'>Chọn một property từ danh sách để bắt đầu chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
