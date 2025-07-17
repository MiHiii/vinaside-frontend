import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker from "emoji-picker-react";
import { MessageReaction } from "@/services/chat.service";
import { useMessages } from "@/hooks/useMessages";

export default function Messages() {
  const {
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

    // State setters
    setMessageInput,
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

    // Utilities
    hasValidParticipants,
    scrollToBottom,
    format,
  } = useMessages();

  if (!user || !user._id || !token) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
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
        
        /* Message hover effect to show buttons */
        .message-bubble:hover .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }
        
        /* Ensure buttons are visible */
        .message-bubble {
          position: relative;
        }
        
        /* Button visibility */
        .message-menu-btn {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .message-bubble:hover .message-menu-btn {
          opacity: 1;
        }
        
        /* Reply preview styling */
        .reply-preview {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-left: 3px solid #3b82f6;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Quoted message styling */
        .quoted-message {
          position: relative;
          overflow: hidden;
        }
        
        .quoted-message::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: currentColor;
          opacity: 0.5;
        }
        
        /* Custom border width for reply messages */
        .border-l-3 {
          border-left-width: 3px;
        }
        
        /* Reply message container styling */
        .reply-container {
          position: relative;
          margin-bottom: 2px;
        }
        
        /* Connection line between quoted message and main message */
        .reply-container::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 3px;
          right: 3px;
          height: 2px;
          background: currentColor;
          opacity: 0.2;
          border-radius: 1px;
        }
        
        /* Enhanced visual separation */
        .message-with-reply {
          border-top-left-radius: 4px !important;
          border-top-right-radius: 4px !important;
        }
        
        /* Smooth transitions for all reply elements */
        .reply-container, .message-bubble {
          transition: all 0.2s ease-in-out;
        }
        
        /* Hover effect for reply messages */
        .reply-container:hover {
          transform: translateY(-1px);
        }
        
        /* Auto-expanding textarea styling */
        .auto-expand-textarea {
          transition: height 0.2s ease-in-out;
          line-height: 1.5;
        }
        
        /* Input area expands upward */
        .input-area-container {
          transform-origin: bottom;
          transition: all 0.2s ease-in-out;
        }
      `}</style>

      <div className="flex container p-3 mx-auto h-[calc(100vh-100px)] bg-background">
        <div className="w-[400px] border-r border-gray-200 p-2 bg-background">
          <div className="bg-background mt-3">
            <div className="flex items-center justify-between space-x-4">
              <h1 className="text-xl font-semibold text-foreground">
                Tin nhắn
              </h1>
              <div className="flex space-x-2">
                <button className="p-2 bg-background rounded-full">
                  <Search className="w-4 h-4 text-foreground" />
                </button>
                <Button className="p-2 bg-background rounded-full">
                  <Settings className="w-4 h-4 text-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4 mt-4">
            {users.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                Chưa có cuộc hội thoại nào.
              </div>
            )}
            {users
              .filter((u) => {
                const id = u?._id;
                const isValid = id && myId && id !== myId;
                return isValid;
              })
              .map((u) => {
                const conversation = Array.isArray(conversations)
                  ? conversations.find((c) =>
                      hasValidParticipants(c, u._id, user._id)
                    )
                  : undefined;
                return (
                  <div
                    key={u._id}
                    className={`mt-8 flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-gray-200 ${
                      selectedUser?.id === u._id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleConnect(u._id!)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={u.avatar_url || "/placeholder.svg"}
                        alt={u.name}
                      />
                      <AvatarFallback>
                        {u.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium text-foreground">
                          {u.name || `User ${u._id}`}
                        </div>
                        {conversation?.lastMessage?.createdAt && (
                          <div className="text-xs text-muted-foreground">
                            {(() => {
                              const date = conversation?.lastMessage?.createdAt;
                              if (!date) return "";
                              const d = new Date(date);
                              return isNaN(d.getTime())
                                ? "N/A"
                                : format(d, "HH:mm");
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {conversation?.lastMessage?.content
                          ? conversation.lastMessage.content.length > 30
                            ? `${conversation.lastMessage.content.substring(
                                0,
                                30
                              )}...`
                            : conversation.lastMessage.content
                          : "No messages"}
                      </div>
                      {conversation &&
                        typeof conversation.unreadCount === "number" &&
                        conversation.unreadCount > 0 && (
                          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 mt-1">
                            {conversation.unreadCount}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-background shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3 ml-5">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={selectedUser?.avatar}
                  alt={selectedUser?.name || "User"}
                />
                <AvatarFallback>
                  {selectedUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-foreground text-[20px]">
                  {selectedUser?.name}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>

          <ScrollArea
            className="flex-1 pt-4 messages-scroll"
            style={{
              height: `calc(100vh - ${
                280 + (textareaHeight - 40) + (replyingTo ? 120 : 0)
              }px)`,
            }}
          >
            <div className="space-y-4 max-w-[790px] mx-auto">
              {/* Load more messages button */}
              {hasMoreMessages && messages.length > 0 && (
                <div className="text-center py-2">
                  <Button
                    onClick={handleLoadMoreMessages}
                    disabled={isLoadingMoreMessages}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {isLoadingMoreMessages
                      ? "Đang tải..."
                      : "Tải tin nhắn cũ hơn"}
                  </Button>
                </div>
              )}

              {/* Show indicator if there are more messages */}
              {messages.length > displayedMessages.length && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Hiển thị {displayedMessages.length} tin nhắn gần nhất (
                    {messages.length - displayedMessages.length} tin cũ hơn)
                  </span>
                </div>
              )}

              {displayedMessages && displayedMessages.length > 0 ? (
                displayedMessages.map((message, index) => {
                  const myId = user?._id;
                  const isOwnMessage =
                    message && myId && message.senderId === myId;
                  const sender = isOwnMessage
                    ? user
                    : users.find(
                        (u) =>
                          u?._id &&
                          message &&
                          message.senderId &&
                          u._id === message.senderId
                      );
                  const showAvatar =
                    !isOwnMessage &&
                    (!displayedMessages[index - 1] ||
                      displayedMessages[index - 1].senderId !==
                        message.senderId);

                  // Determine if this is the last message in a sequence from the same sender
                  const isLastInSequence =
                    !displayedMessages[index + 1] ||
                    displayedMessages[index + 1].senderId !== message.senderId;

                  // Only show read status for own messages that are last in sequence
                  const shouldShowReadStatus = isOwnMessage && isLastInSequence;

                  // For the last message in sequence, check if ALL messages in this sequence are read
                  let sequenceReadStatus = message.isRead;
                  if (shouldShowReadStatus) {
                    // Find all messages in current sequence (same sender, consecutive)
                    const sequenceMessages = [];
                    let i = index;
                    // Go backwards to find start of sequence
                    while (
                      i >= 0 &&
                      displayedMessages[i]?.senderId === message.senderId
                    ) {
                      sequenceMessages.unshift(displayedMessages[i]);
                      i--;
                    }
                    // Go forwards to find end of sequence
                    i = index + 1;
                    while (
                      i < displayedMessages.length &&
                      displayedMessages[i]?.senderId === message.senderId
                    ) {
                      sequenceMessages.push(displayedMessages[i]);
                      i++;
                    }

                    // Check if ALL messages in sequence are read
                    sequenceReadStatus = sequenceMessages.every(
                      (msg) => msg.isRead
                    );
                  }

                  return (
                    <div
                      key={message.id || index}
                      className={`flex gap-2 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      } animate-fade-in group`}
                    >
                      {showAvatar && !isOwnMessage && (
                        <Avatar className="h-8 w-8 mt-10">
                          <AvatarImage
                            src={sender?.avatar_url || "/placeholder.svg"}
                            alt={sender?.name || "User"}
                          />
                          <AvatarFallback>
                            {sender?.name?.charAt
                              ? sender?.name.charAt(0)
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!showAvatar && !isOwnMessage && <div className="w-8" />}
                      <div
                        className={`max-w-[70%] ${
                          isOwnMessage ? "order-1" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex-1">
                            {showAvatar && !isOwnMessage && (
                              <span className="text-[12px] font-semibold text-muted-foreground ml-1">
                                {sender?.name || "Unknown"}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {(() => {
                              const date = message?.createdAt;
                              if (!date) return "";
                              const d = new Date(date);
                              return isNaN(d.getTime())
                                ? "N/A"
                                : format(d, "HH:mm");
                            })()}
                          </span>
                        </div>

                        {/* Reply/Quote Message - Outside bubble */}
                        {message.replyTo && !message.isRecalled && (
                          <div
                            key={`reply-${message.id}-${message.replyTo.messageId}`}
                            className={`mb-2 reply-container ${
                              isOwnMessage ? "ml-auto" : "mr-auto"
                            }`}
                            style={{ maxWidth: "calc(100% - 0px)" }}
                            title={`Debug: Reply to ${message.replyTo.messageId} from ${message.replyTo.senderName}`}
                          >
                            <div
                              className={`p-2 rounded-t-lg rounded-b-sm border-l-2 border-solid text-sm relative ${
                                isOwnMessage
                                  ? "bg-primary/10 border-primary"
                                  : "bg-muted border-gray-100"
                              }`}
                            >
                              <div className="text-[11px] mb-1 opacity-70">
                                Đang trả lời {message.replyTo.senderName}
                              </div>
                              <div className="text-[15px] text-foreground opacity-80 line-clamp-2">
                                {message.replyTo.content.length > 60
                                  ? `${message.replyTo.content.substring(
                                      0,
                                      60
                                    )}...`
                                  : message.replyTo.content}
                              </div>
                            </div>
                          </div>
                        )}

                        <div
                          className={`p-3 transition-all duration-200 hover:shadow-md relative group message-bubble ${
                            message.replyTo && !message.isRecalled
                              ? "rounded-t-sm rounded-b-2xl message-with-reply"
                              : "rounded-2xl"
                          } ${
                            message.isRecalled
                              ? "bg-muted border border-border"
                              : isOwnMessage
                              ? "bg-sky-600 text-white"
                              : "bg-card text-foreground shadow-sm"
                          }`}
                          style={{ minHeight: "40px" }}
                        >
                          <p
                            className={`text-[16px] whitespace-pre-wrap break-words ${
                              message.isRecalled
                                ? "text-muted-foreground italic"
                                : ""
                            }`}
                          >
                            {message.content}
                          </p>

                          {/* Quick reaction button - for all messages (own and others) with real IDs and not recalled */}
                          {!message.isRecalled &&
                            message.id &&
                            !message.id.startsWith("temp_") && (
                              <div
                                className={`absolute top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                  isOwnMessage ? "-left-8" : "-right-8"
                                }`}
                              >
                                <DropdownMenu
                                  open={showReactionPicker === message.id}
                                  onOpenChange={(open) =>
                                    setShowReactionPicker(
                                      open ? message.id : null
                                    )
                                  }
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 rounded-full p-0 bg-white border-gray-300 shadow-md hover:bg-gray-50 cursor-pointer reaction-btn z-10"
                                    >
                                      <Smile className="h-5 w-5 text-gray-800" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="p-2 mb-2 bg-white border-gray-300 rounded-full"
                                    side={isOwnMessage ? "left" : "right"}
                                    align="center"
                                  >
                                    <div className="flex gap-1">
                                      {quickReactions.map(({ emoji, type }) => (
                                        <Button
                                          key={emoji}
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-lg hover:bg-gray-100 reaction-btn"
                                          onClick={() =>
                                            handleToggleReaction(
                                              message.id,
                                              type
                                            )
                                          }
                                        >
                                          {emoji}
                                        </Button>
                                      ))}
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}

                          {/* Menu button - for all messages (own and others) with real IDs and not recalled */}
                          {!message.isRecalled &&
                            message.id &&
                            !message.id.startsWith("temp_") && (
                              <div
                                className={`absolute top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                  isOwnMessage ? "-left-16" : "-right-16"
                                }`}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 rounded-full bg-white border-gray-300 shadow-md hover:bg-gray-200 cursor-pointer z-10"
                                    >
                                      <MoreHorizontal className="h-4 w-4 text-gray-800" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align={isOwnMessage ? "start" : "end"}
                                    className="w-40 bg-white border-gray-300 rounded-lg mt-5 mr-20"
                                  >
                                    {isOwnMessage ? (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteMessage(message.id)
                                        }
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Thu hồi
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleReplyMessage(message)
                                        }
                                        className="text-gray-900 focus:text-gray-600"
                                      >
                                        <Reply className="h-3 w-3 mr-2" />
                                        Trả lời
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                        </div>

                        {/* Reactions display - hide for recalled messages */}
                        {!message.isRecalled &&
                          message.reactions &&
                          message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {Object.entries(
                                message.reactions.reduce((acc, reaction) => {
                                  const key = reaction.type || reaction.emoji; // Support both type and emoji
                                  acc[key] = (acc[key] || []).concat(reaction);
                                  return acc;
                                }, {} as Record<string, MessageReaction[]>)
                              ).map(([reactionKey, reactions]) => {
                                const userReacted = reactions.some(
                                  (r) => r.userId === myId
                                );
                                const reactionType = reactions[0].type;

                                // Better emoji resolution logic
                                let emoji = reactions[0].emoji;
                                if (!emoji) {
                                  // Find emoji from quickReactions array
                                  const quickReaction = quickReactions.find(
                                    (qr) => qr.type === reactionType
                                  );
                                  emoji = quickReaction?.emoji || "👍"; // fallback
                                }

                                return (
                                  <button
                                    key={reactionKey}
                                    onClick={() =>
                                      handleToggleReaction(
                                        message.id,
                                        reactionType
                                      )
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors message-reaction ${
                                      userReacted
                                        ? "bg-primary/10 text-primary border border-primary"
                                        : "bg-muted text-muted-foreground hover:bg-accent"
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    {reactions.length > 1 && (
                                      <span>{reactions.length}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                        {/* Show read status for own messages */}
                        {isOwnMessage && shouldShowReadStatus && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 justify-end">
                            {sequenceReadStatus ? (
                              <span title="Đã đọc">
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              </span>
                            ) : (
                              <span title="Đã gửi">
                                <Check className="h-3 w-3 text-gray-400" />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {selectedUser
                    ? "Chưa có tin nhắn nào"
                    : "Chọn một người dùng để bắt đầu chat"}
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 bg-background shadow-sm flex-shrink-0 input-area-container">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="max-w-[790px] mx-auto mb-3 bg-primary/10 border border-sky-500 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="h-4 w-4 text-primary" />
                      <span className="text-[14px] text-primary">
                        Đang trả lời{" "}
                        {replyingTo.senderId === myId
                          ? "chính mình"
                          : users.find((u) => u._id === replyingTo.senderId)
                              ?.name || "người dùng"}
                      </span>
                    </div>
                    <div className="text-sm text-foreground bg-card rounded-lg px-3 py-2 border-l-3 border-sky-500 shadow-sm">
                      {replyingTo.content.length > 80
                        ? `${replyingTo.content.substring(0, 80)}...`
                        : replyingTo.content}
                    </div>
                  </div>
                  <button
                    onClick={handleCancelReply}
                    className="ml-2 mb-10 p-1.5 hover:bg-primary/20 rounded-full transition-colors"
                    title="Hủy trả lời"
                  >
                    <X className="h-4 w-4  text-primary" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 max-w-[790px] mx-auto relative">
              <div className="flex-1 relative">
                <Textarea
                  value={messageInput}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Soạn tin nhắn..."
                  className="w-full pr-20 rounded-xl border-gray-300 focus:ring-sky-500 resize-none py-2 px-4 min-h-[40px] max-h-[120px] auto-expand-textarea text-foreground bg-background"
                  disabled={!selectedUser}
                  rows={1}
                  style={{
                    height: `${textareaHeight}px`,
                    overflowY: textareaHeight >= 120 ? "auto" : "hidden",
                  }}
                />
                <div className="absolute right-3 bottom-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-gray-100"
                  >
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-gray-100"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10 flex-shrink-0"
                disabled={!messageInput.trim() || !selectedUser}
              >
                <Send className="h-4 w-4" />
              </Button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
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
}
