import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Send, Smile, Reply, X, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { useMessages } from '@/hooks/useMessages';
import { ReactionType, ConversationUI, MessageWithUI } from '@/types/message';
import SocketDebug from '@/components/debug/SocketDebug';

export default function Messages() {
  const {
    conversations,
    selectedConversation,
    messages,
    messageInput,
    replyingTo,
    showEmojiPicker,
    showReactionPicker,
    isLoadingConversations,
    isLoading,
    hasMoreMessages,
    isSending,
    quickReactions,
    myId,
    messagesEndRef,
    textareaRef,
    topSentinelRef,
    selectConversation,
    sendMessage,
    loadMoreMessages,
    toggleReaction,
    recallMessage,
    handleEmojiSelect,
    handleTextareaChange,
    replyToMessage,
    cancelReply,
    setShowEmojiPicker,
    setShowReactionPicker,
  } = useMessages();

  if (!myId) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar - Conversations List */}
      <div className='w-80 border-r border-border bg-card'>
        <div className='p-4 border-b border-border'>
          <h1 className='text-xl font-semibold'>Tin nhắn</h1>
        </div>

        <ScrollArea className='flex-1 h-[calc(100vh-80px)]'>
          <div className='p-2'>
            {isLoadingConversations ? (
              // Loading skeleton
              <div className='space-y-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className='flex items-center gap-3 p-3 rounded-lg animate-pulse'>
                    <div className='h-12 w-12 bg-muted rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-muted rounded mb-2'></div>
                      <div className='h-3 bg-muted rounded w-3/4'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>Chưa có cuộc hội thoại nào</p>
              </div>
            ) : (
              conversations.map((conversation: ConversationUI) => (
                <div
                  key={conversation._id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    selectedConversation?._id === conversation._id ? 'bg-muted' : ''
                  }`}
                  onClick={() => selectConversation(conversation)}>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage
                      src={conversation.display.avatar_url || '/placeholder.svg'}
                      alt={conversation.display.title}
                    />
                    <AvatarFallback>{conversation.display.title?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>

                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-center mb-1'>
                      <h3 className='font-medium truncate'>{conversation.display.title}</h3>
                      {conversation.lastMessage && (
                        <span className='text-xs text-muted-foreground'>
                          {format(new Date(conversation.lastMessage.sent_at), 'HH:mm')}
                        </span>
                      )}
                    </div>

                    <div className='flex justify-between items-center'>
                      <p className='text-sm text-muted-foreground truncate'>
                        {conversation.display.subtitle || 'Chưa có tin nhắn'}
                      </p>
                      {conversation.display.unreadCount > 0 && (
                        <span className='bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
                          {conversation.display.unreadCount > 99 ? '99+' : conversation.display.unreadCount}
                        </span>
                      )}
                    </div>

                    {conversation.display.badge && (
                      <div className='mt-1'>
                        <span className='text-xs bg-muted px-2 py-1 rounded'>{conversation.display.badge.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {selectedConversation ? (
          <>
            {/* Chat Messages */}
            <ScrollArea className='flex-1 p-4' ref={messagesEndRef}>
              <div className='space-y-4 max-w-4xl mx-auto'>
                <div ref={topSentinelRef} />

                {/* Load More Messages Button */}
                {hasMoreMessages && (
                  <div className='flex justify-center py-4'>
                    <Button
                      onClick={loadMoreMessages}
                      disabled={isLoading}
                      variant='outline'
                      size='sm'
                      className='text-sm'>
                      {isLoading ? (
                        <>
                          <svg
                            className='animate-spin -ml-1 mr-2 h-4 w-4'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'>
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                          </svg>
                          Đang tải...
                        </>
                      ) : (
                        'Tải thêm tin nhắn cũ'
                      )}
                    </Button>
                  </div>
                )}

                {messages.map((message: MessageWithUI) => {
                  // Handle both old and new API structures
                  const isMyMessage = message.ui?.mine ?? message.sender_id === myId;
                  const showSenderMeta = message.ui?.show_sender_meta ?? false;

                  return (
                    <div key={message._id} className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar for other users */}
                      {!isMyMessage && showSenderMeta && (
                        <Avatar className='h-8 w-8 mt-6 flex-shrink-0'>
                          <AvatarImage
                            src={message.ui?.sender_avatar_url || '/placeholder.svg'}
                            alt={message.ui?.sender_display_name || 'User'}
                          />
                          <AvatarFallback className='text-xs'>
                            {message.ui?.sender_display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!isMyMessage && !showSenderMeta && <div className='w-8 flex-shrink-0' />}

                      <div className={`max-w-[70%] ${isMyMessage ? 'order-1' : ''}`}>
                        {/* Sender name and time */}
                        <div className='flex justify-between items-center mb-1'>
                          {showSenderMeta && !isMyMessage && (
                            <span className='text-sm font-medium text-foreground'>
                              {message.ui?.sender_display_name || 'Unknown User'}
                            </span>
                          )}
                          <span className='text-xs text-muted-foreground ml-2'>
                            {format(new Date(message.sent_at), 'HH:mm')}
                          </span>
                        </div>

                        {/* Reply indicator */}
                        {message.reply_to && !message.is_recalled && (
                          <div
                            className={`mb-2 p-2 rounded-lg border-l-4 ${
                              isMyMessage ? 'bg-primary/10 border-primary' : 'bg-muted border-muted-foreground'
                            }`}>
                            <div className='text-xs mb-1 opacity-70'>Trả lời {message.reply_to.sender_name}</div>
                            <div className='text-sm opacity-80 line-clamp-2'>
                              {message.reply_to.content.length > 60
                                ? `${message.reply_to.content.substring(0, 60)}...`
                                : message.reply_to.content}
                            </div>
                          </div>
                        )}

                        {/* Message content */}
                        <div
                          className={`group relative p-3 rounded-lg transition-all duration-200 hover:shadow-sm ${
                            message.is_recalled
                              ? 'bg-muted border border-border'
                              : isMyMessage
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-card border shadow-sm hover:shadow-md'
                          }`}>
                          <p
                            className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
                              message.is_recalled ? 'text-muted-foreground italic' : ''
                            }`}>
                            {message.content}
                          </p>

                          {/* Message actions */}
                          {!message.is_recalled && (
                            <div
                              className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                isMyMessage ? '-left-20' : '-right-20'
                              }`}>
                              <div className='flex gap-1'>
                                {/* Reaction picker */}
                                <DropdownMenu
                                  open={showReactionPicker === message._id}
                                  onOpenChange={(open) => setShowReactionPicker(open ? message._id : null)}>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='h-8 w-8 rounded-full p-0 hover:bg-muted'>
                                      <Smile className='h-4 w-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className='p-2'>
                                    <div className='flex gap-1'>
                                      {quickReactions.map(({ emoji, type }: { emoji: string; type: ReactionType }) => (
                                        <Button
                                          key={type}
                                          variant='ghost'
                                          size='sm'
                                          className='h-8 w-8 p-0 text-lg hover:bg-muted transition-colors'
                                          onClick={() => toggleReaction(message._id, type)}>
                                          {emoji}
                                        </Button>
                                      ))}
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* More actions */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='h-8 w-8 rounded-full p-0 hover:bg-muted'>
                                      <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align={isMyMessage ? 'start' : 'end'}>
                                    {isMyMessage ? (
                                      <DropdownMenuItem
                                        onClick={() => recallMessage(message._id)}
                                        className='text-destructive focus:text-destructive'>
                                        <Trash2 className='h-4 w-4 mr-2' />
                                        Thu hồi
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => replyToMessage(message)}>
                                        <Reply className='h-4 w-4 mr-2' />
                                        Trả lời
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Reactions display */}
                        {!message.is_recalled && message.reactions.length > 0 && (
                          <div className='flex gap-1 mt-2 flex-wrap'>
                            {Object.entries(
                              message.reactions.reduce((acc, reaction) => {
                                const key = reaction.type;
                                acc[key] = (acc[key] || []).concat(reaction);
                                return acc;
                              }, {} as Record<string, typeof message.reactions>),
                            ).map(([reactionType, reactions]) => {
                              const userReacted = reactions.some((r) => r.userId === myId);
                              const emoji = reactions[0].emoji;

                              return (
                                <button
                                  key={reactionType}
                                  onClick={() => toggleReaction(message._id, reactionType as ReactionType)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 ${
                                    userReacted
                                      ? 'bg-primary/20 text-primary border border-primary shadow-sm'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}>
                                  <span>{emoji}</span>
                                  {reactions.length > 1 && <span className='font-medium'>{reactions.length}</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className='border-t border-border p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
              {/* Reply preview */}
              {replyingTo && (
                <div className='mb-3 p-3 bg-muted/50 rounded-lg border border-border'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <Reply className='h-4 w-4 text-primary' />
                      <span className='text-sm text-primary font-medium'>
                        Đang trả lời {replyingTo.ui?.sender_display_name || 'Unknown User'}
                      </span>
                    </div>
                    <Button variant='ghost' size='sm' onClick={cancelReply} className='h-6 w-6 p-0 hover:bg-muted'>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='text-sm text-muted-foreground bg-card rounded px-3 py-2 border-l-4 border-primary shadow-sm'>
                    {replyingTo.content.length > 100
                      ? `${replyingTo.content.substring(0, 100)}...`
                      : replyingTo.content}
                  </div>
                </div>
              )}

              <div className='flex items-end gap-2 max-w-4xl mx-auto relative'>
                <div className='flex-1 relative'>
                  <Textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder='Nhập tin nhắn...'
                    className='min-h-[44px] max-h-[120px] resize-none pr-20 border-2 focus:border-primary transition-colors duration-200'
                    rows={1}
                  />
                  <div className='absolute right-2 bottom-2 flex items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0 hover:bg-muted transition-colors'
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className='h-11 w-11 rounded-full p-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isSending ? (
                    <svg
                      className='animate-spin h-5 w-5 text-primary'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                  ) : (
                    <Send className='h-5 w-5' />
                  )}
                </Button>

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className='absolute bottom-full right-0 mb-2 z-50'>
                    <div className='bg-background border border-border rounded-lg shadow-lg'>
                      <EmojiPicker onEmojiClick={handleEmojiSelect} width={320} height={400} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-xl font-semibold mb-2'>Chọn một cuộc hội thoại</h2>
              <p className='text-muted-foreground'>Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>

      {/* Socket Debug Component */}
      <SocketDebug />
    </div>
  );
}
