import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmojiPicker from 'emoji-picker-react';
import { useMessages } from '@/hooks/useMessages';
import { MessageWithUI, ReactionType } from '@/types/message';
import { NavLink } from 'react-router-dom';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

export default function NewMessages() {
  const {
    // States
    conversations,
    selectedConversation,
    messages,
    messageInput,
    isLoadingConversations,
    isLoading,
    hasMoreMessages,
    replyingTo,
    showEmojiPicker,
    showReactionPicker,
    messagesEndRef,
    quickReactions,
    userRole,
    myId,
    user,

    // State setters
    setMessageInput,
    setShowEmojiPicker,
    setShowReactionPicker,

    // Actions
    selectConversation,
    sendMessage,
    loadMoreMessages,
    toggleReaction,
    recallMessage,
    replyToMessage,
    cancelReply,
    handleEmojiSelect,
    handleTextareaChange,
  } = useMessages();

  // Utility functions
  const isOwnMessage = (message: MessageWithUI) => {
    return message.sender_id === myId;
  };

  const getSenderInfo = (message: MessageWithUI) => {
    // In v2 API, we use the ui metadata for display info
    return {
      _id: message.sender_id,
      name: message.ui.sender_display_name,
      full_name: message.ui.sender_display_name,
      avatar_url: message.ui.sender_avatar_url,
      avatar: message.ui.sender_avatar_url,
    };
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (differenceInDays(new Date(), date) < 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'dd/MM');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
              <h1 className='text-lg md:text-xl font-semibold text-foreground'>Tin nhắn</h1>
              <div className='flex space-x-1 md:space-x-2'>
                <button className='p-2 bg-background rounded-full'>
                  <Search className='w-4 h-4 text-foreground' />
                </button>
                <Button className='p-2 bg-background rounded-full' variant='ghost'>
                  <Settings className='w-4 h-4 text-foreground' />
                </Button>
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
            ) : conversations.length === 0 ? (
              <div className='text-center text-muted-foreground py-4'>Chưa có cuộc hội thoại nào.</div>
            ) : (
              conversations.map((conversation) => {
                const display = conversation.display;
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <div
                    key={conversation._id}
                    className={`
                      conversation-item
                      w-full justify-start text-base font-medium
                      px-4 py-3 min-h-20 rounded-2xl shadow-none transition
                      flex items-center gap-3 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold'
                          : 'bg-transparent'
                      }
                      hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]
                      focus:outline-none
                    `}
                    onClick={() => selectConversation(conversation)}>
                    <Avatar
                      className={`h-10 w-10 ${display.unreadCount > 0 ? 'ring-2 ring-red-300 ring-offset-2' : ''}`}>
                      <AvatarImage src={display.avatar_url || '/placeholder.svg'} alt={display.title} />
                      <AvatarFallback>{display.title?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-center gap-2'>
                        <div
                          className={`font-medium truncate ${
                            display.unreadCount > 0 ? 'text-red-400 font-bold' : 'text-foreground'
                          }`}>
                          {display.title}
                        </div>

                        {conversation.lastMessageAt && (
                          <div className='text-[10px] md:text-xs text-muted-foreground whitespace-nowrap'>
                            {formatTime(conversation.lastMessageAt)}
                          </div>
                        )}
                      </div>

                      <div
                        className={`
                          text-xs md:text-sm truncate text-foreground
                          ${display.unreadCount > 0 ? 'text-blue-600 font-semibold' : 'text-muted-foreground'}
                        `}>
                        {isLoadingConversations
                          ? 'Đang tải...'
                          : conversation.lastMessage
                          ? conversation.lastMessage.content
                            ? conversation.lastMessage.content.length > 50
                              ? `${conversation.lastMessage.content.substring(0, 50)}...`
                              : conversation.lastMessage.content
                            : 'Tin nhắn đã bị thu hồi'
                          : 'Chưa có tin nhắn'}
                      </div>

                      {display.unreadCount > 0 && (
                        <div className='inline-flex items-center justify-center bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full min-w-[18px] h-4 md:h-5 px-1 md:px-1.5 mt-1 animate-pulse'>
                          {display.unreadCount > 99 ? '99+' : display.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className='flex-1 flex flex-col min-h-0'>
          {selectedConversation ? (
            <>
              <div className='p-3 md:p-4 border-b border-gray-100 flex items-center justify-between bg-background shadow-sm flex-shrink-0'>
                <div className='flex items-center gap-3 md:gap-4 ml-1 md:ml-5 min-w-0'>
                  <Avatar className='h-10 w-10 md:h-12 md:w-12 cursor-pointer hover:opacity-80 transition-opacity'>
                    <AvatarImage
                      src={selectedConversation.display.avatar_url || '/placeholder.svg'}
                      alt={selectedConversation.display.title}
                    />
                    <AvatarFallback>{selectedConversation.display.title?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <h2 className='font-semibold text-foreground text-[16px] md:text-[20px] truncate'>
                      {selectedConversation.display.title}
                    </h2>
                    <p className='text-sm text-muted-foreground truncate'>{selectedConversation.display.subtitle}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='icon'>
                    <MoreHorizontal className='h-4 w-4 text-foreground' />
                  </Button>
                </div>
              </div>

              <ScrollArea
                className='flex-1 pt-3 md:pt-4 messages-scroll'
                style={{
                  height: `calc(100vh - ${280 + (replyingTo ? 120 : 0)}px)`,
                }}>
                <div className='space-y-3 md:space-y-4 max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] px-2 sm:px-3 md:px-4 mx-auto'>
                  {/* Load more */}
                  {hasMoreMessages && messages.length > 0 && (
                    <div className='text-center py-2'>
                      <Button
                        onClick={loadMoreMessages}
                        disabled={isLoading}
                        variant='outline'
                        size='sm'
                        className='text-xs'>
                        {isLoading ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
                      </Button>
                    </div>
                  )}

                  {messages && messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isOwn = isOwnMessage(message);
                      const senderInfo = getSenderInfo(message);
                      const showAvatar = !isOwn && message.ui?.show_sender_meta;
                      const isLastInSequence =
                        !messages[index + 1] || messages[index + 1].sender_id !== message.sender_id;

                      return (
                        <div
                          key={message._id}
                          className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                          {showAvatar && !isOwn && (
                            <Avatar className='h-7 w-7 md:h-8 md:w-8 mt-8 md:mt-10 flex-shrink-0'>
                              <AvatarImage
                                src={senderInfo.avatar_url || '/placeholder.svg'}
                                alt={senderInfo.name || 'User'}
                              />
                              <AvatarFallback>{senderInfo.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                          )}
                          {!showAvatar && !isOwn && <div className='w-7 md:w-8' />}

                          <div className={`max-w-[85%] sm:max-w-[78%] md:max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                            <div className='flex justify-between items-center mb-1 md:mb-2'>
                              <div className='flex-1 min-w-0'>
                                {showAvatar && !isOwn && (
                                  <span className='text-[11px] md:text-[12px] font-semibold text-muted-foreground ml-1 truncate'>
                                    {senderInfo.name || 'Unknown'}
                                  </span>
                                )}
                              </div>
                              <span className='text-[10px] md:text-[10px] text-muted-foreground ml-2 whitespace-nowrap'>
                                {formatTime(message.sent_at)}
                              </span>
                            </div>

                            {/* Reply/Quote */}
                            {message.reply_to && !message.is_recalled && (
                              <div
                                key={`reply-${message._id}-${message.reply_to.message_id}`}
                                className={`${isOwn ? 'ml-auto' : 'mr-auto'} mb-2 reply-container`}
                                style={{ maxWidth: 'calc(100% - 0px)' }}
                                title={`Reply to ${message.reply_to.sender_name}`}>
                                <div
                                  className={`p-2 rounded-t-lg rounded-b-sm border-l-2 border-solid text-sm relative ${
                                    isOwn ? 'bg-primary/10 border-primary' : 'bg-muted border-gray-100'
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
                                    : isOwn
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

                              {/* Quick reaction */}
                              {!message.is_recalled && (
                                <div
                                  className={`absolute top-2.5 md:top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                    isOwn ? '-left-7 md:-left-8' : '-right-7 md:-right-8'
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
                                      side={isOwn ? 'left' : 'right'}
                                      align='center'>
                                      <div className='flex gap-1'>
                                        {quickReactions.map(({ emoji, type }) => (
                                          <Button
                                            key={emoji}
                                            variant='ghost'
                                            size='sm'
                                            className='h-8 w-8 p-0 text-lg hover:bg-gray-100 reaction-btn'
                                            onClick={() => toggleReaction(message._id, type)}>
                                            {emoji}
                                          </Button>
                                        ))}
                                      </div>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}

                              {/* Menu */}
                              {!message.is_recalled && (
                                <div
                                  className={`absolute top-2.5 md:top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                    isOwn ? '-left-14 md:-left-16' : '-right-14 md:-right-16'
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
                                      align={isOwn ? 'start' : 'end'}
                                      className='w-36 md:w-40 bg-white border-gray-300 rounded-lg mt-4 md:mt-5 mr-10 md:mr-20'>
                                      {isOwn ? (
                                        <DropdownMenuItem
                                          onClick={() => recallMessage(message._id)}
                                          className='text-red-600 focus:text-red-600'>
                                          <Trash2 className='h-3 w-3 mr-2' />
                                          Thu hồi
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => replyToMessage(message)}
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
                              <div className='flex gap-1 mt-1 flex-wrap'>
                                {Object.entries(
                                  message.reactions.reduce((acc, reaction) => {
                                    const key = reaction.type;
                                    acc[key] = (acc[key] || []).concat(reaction);
                                    return acc;
                                  }, {} as Record<string, typeof message.reactions>),
                                ).map(([reactionKey, reactions]: [string, typeof message.reactions]) => {
                                  const userReacted = reactions.some((r) => r.userId === message.sender_id);
                                  const reactionType = reactions[0].type;

                                  return (
                                    <button
                                      key={reactionKey}
                                      onClick={() => toggleReaction(message._id, reactionType)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs md:text-sm transition-colors message-reaction ${
                                        userReacted
                                          ? 'bg-primary/10 text-primary border border-primary'
                                          : 'bg-muted text-muted-foreground hover:bg-accent'
                                      }`}>
                                      <span>{reactions[0].emoji}</span>
                                      {reactions.length > 1 && <span>{reactions.length}</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Read status */}
                            {isOwn && isLastInSequence && (
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
                    <div className='text-center text-muted-foreground py-6 md:py-8'>Chưa có tin nhắn nào</div>
                  )}
                  <div ref={messagesEndRef} className='h-1' />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className='p-3 md:p-4 border-t border-gray-200 bg-background shadow-sm flex-shrink-0 input-area-container'>
                {replyingTo && (
                  <div className='max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] mx-auto mb-3 bg-primary/10 border border-sky-500 rounded-lg p-2.5 md:p-3 shadow-sm'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Reply className='h-4 w-4 text-primary' />
                          <span className='text-[13px] md:text-[14px] text-primary truncate'>
                            Đang trả lời {getSenderInfo(replyingTo).name || 'người dùng'}
                          </span>
                        </div>
                        <div className='text-xs md:text-sm text-foreground bg-card rounded-lg px-3 py-2 border-l-3 border-sky-500 shadow-sm'>
                          {replyingTo.content.length > 80
                            ? `${replyingTo.content.substring(0, 80)}...`
                            : replyingTo.content}
                        </div>
                      </div>
                      <button
                        onClick={cancelReply}
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
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Soạn tin nhắn...'
                      className='
                        w-full pr-20 rounded-xl border-gray-300 focus:ring-sky-500 resize-none
                        py-2 px-3 md:px-4 min-h-[40px] max-h-[120px] auto-expand-textarea
                        text-foreground bg-background
                      '
                      disabled={!selectedConversation || isLoading}
                      rows={1}
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
                    onClick={sendMessage}
                    size='icon'
                    className='rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10 flex-shrink-0'
                    disabled={!messageInput.trim() || !selectedConversation || isLoading}>
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
                <h3 className='text-lg font-medium mb-2'>Chọn một cuộc hội thoại</h3>
                <p className='text-sm'>Bắt đầu chat với người khác</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
