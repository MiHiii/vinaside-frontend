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
import { NavLink } from "react-router-dom";

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
    currentPropertyId,
    isLoadingConversations,

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
    hasValidParticipants,
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
        className="
          flex flex-col md:flex-row
          p-3 mx-auto
          h-[calc(90vh-40px)]
          bg-background
          gap-3 md:gap-0
          max-w-[1400px]
        "
      >
        {/* Sidebar */}
        <div
          className="
            sidebar-card
            w-full md:w-[300px] lg:w-[340px] xl:w-[380px]
            md:border-r border-gray-200
            p-2 bg-background
            rounded-xl md:rounded-none
          "
        >
          <div className="bg-background mt-1 md:mt-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Tin nhắn
              </h1>
              <div className="flex space-x-1 md:space-x-2">
                <button className="p-2 bg-background rounded-full">
                  <Search className="w-4 h-4 text-foreground" />
                </button>
                <Button
                  className="p-2 bg-background rounded-full"
                  variant="ghost"
                >
                  <Settings className="w-4 h-4 text-foreground" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
            {isLoadingConversations ? (
              // Loading skeleton
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full justify-start text-base font-medium px-4 py-3 min-h-20 rounded-2xl shadow-none transition flex items-center gap-3 animate-pulse"
                  >
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Chưa có cuộc hội thoại nào.
              </div>
            ) : (
              users
                .filter((u) => {
                  const id = u?._id;
                  const isValid = id && myId && id !== myId;
                  return isValid;
                })
                .map((u) => {
                  const conversation = Array.isArray(conversations)
                    ? conversations.find((c: any) => {
                        if (!c) return false;
                        const byId = c.id && u._id && c.id === u._id;
                        const byParticipants = hasValidParticipants(
                          c,
                          u._id,
                          user._id
                        );
                        return Boolean(byId || byParticipants);
                      })
                    : undefined;

                  return (
                    <div
                      key={u._id}
                      className={`
                        conversation-item
                        w-full justify-start text-base font-medium
                        px-4 py-3 min-h-20 rounded-2xl shadow-none transition
                        flex items-center gap-3
                        ${
                          selectedUser?.id === u._id
                            ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                            : "bg-transparent"
                        }
                        hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]
                        focus:outline-none
                      `}
                      onClick={() => handleConnect(u._id!)}
                    >
                      <Avatar
                        className={`h-10 w-10 ${
                          conversation &&
                          typeof conversation.unreadCount === "number" &&
                          conversation.unreadCount > 0
                            ? "ring-2 ring-red-300 ring-offset-2"
                            : ""
                        }`}
                      >
                        <AvatarImage
                          src={u.avatar_url || "/placeholder.svg"}
                          alt={u.name}
                        />
                        <AvatarFallback>
                          {u.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <div
                            className={`font-medium truncate ${
                              conversation &&
                              typeof conversation.unreadCount === "number" &&
                              conversation.unreadCount > 0
                                ? "text-red-400 font-bold"
                                : "text-foreground"
                            }`}
                          >
                            {u.name || `User ${u._id}`}
                          </div>

                          {conversation?.lastMessage?.createdAt && (
                            <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                              {(() => {
                                const date =
                                  conversation?.lastMessage?.createdAt;
                                if (!date) return "";
                                const d = new Date(date);
                                return isNaN(d.getTime())
                                  ? "N/A"
                                  : format(d, "HH:mm");
                              })()}
                            </div>
                          )}
                        </div>

                        <div
                          className={`
                            text-xs md:text-sm truncate text-foreground
                            ${
                              conversation &&
                              typeof conversation.unreadCount === "number" &&
                              conversation.unreadCount > 0
                                ? "text-blue-600 font-semibold"
                                : "text-muted-foreground"
                            }
                          `}
                        >
                          {isLoadingConversations
                            ? "Đang tải..."
                            : conversation
                            ? conversation.lastMessage
                              ? conversation.lastMessage.content
                                ? conversation.lastMessage.content.length > 50
                                  ? `${conversation.lastMessage.content.substring(
                                      0,
                                      50
                                    )}...`
                                  : conversation.lastMessage.content
                                : "Tin nhắn đã bị thu hồi"
                              : "Chưa có tin nhắn"
                            : "Đang tải..."}
                        </div>

                        {conversation &&
                          typeof conversation.unreadCount === "number" &&
                          conversation.unreadCount > 0 && (
                            <div className="inline-flex items-center justify-center bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full min-w-[18px] h-4 md:h-5 px-1 md:px-1.5 mt-1 animate-pulse">
                              {conversation.unreadCount > 99
                                ? "99+"
                                : conversation.unreadCount}
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
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 md:p-4 border-b border-gray-100 flex items-center justify-between bg-background shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3 md:gap-4 ml-1 md:ml-5 min-w-0">
              <NavLink to={`/property/${selectedUser?.id}`}>
                <Avatar className="h-10 w-10 md:h-12 md:w-12 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src={selectedUser?.avatar}
                    alt={selectedUser?.name || "User"}
                  />
                  <AvatarFallback>
                    {selectedUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </NavLink>
              <div className="min-w-0">
                <NavLink to={`/property/${selectedUser?.id}`}>
                  <h2 className="font-semibold text-foreground text-[16px] md:text-[20px] truncate">
                    {selectedUser?.name}
                  </h2>
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4 text-foreground" />
              </Button>
            </div>
          </div>

          <ScrollArea
            className="flex-1 pt-3 md:pt-4 messages-scroll"
            style={{
              height: `calc(100vh - ${
                280 + (textareaHeight - 40) + (replyingTo ? 120 : 0)
              }px)`,
            }}
          >
            <div className="space-y-3 md:space-y-4 max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] px-2 sm:px-3 md:px-4 mx-auto">
              {/* Load more */}
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

              {/* Indicator */}
              {messages.length > displayedMessages.length && (
                <div className="text-center py-2">
                  <span className="text-[10px] md:text-xs text-muted-foreground bg-muted px-2 md:px-3 py-1 rounded-full">
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

                  const isLastInSequence =
                    !displayedMessages[index + 1] ||
                    displayedMessages[index + 1].senderId !== message.senderId;

                  const shouldShowReadStatus = isOwnMessage && isLastInSequence;

                  let sequenceReadStatus = message.isRead;
                  if (shouldShowReadStatus) {
                    const sequenceMessages: typeof displayedMessages = [];
                    let i = index;
                    while (
                      i >= 0 &&
                      displayedMessages[i]?.senderId === message.senderId
                    ) {
                      sequenceMessages.unshift(displayedMessages[i]);
                      i--;
                    }
                    i = index + 1;
                    while (
                      i < displayedMessages.length &&
                      displayedMessages[i]?.senderId === message.senderId
                    ) {
                      sequenceMessages.push(displayedMessages[i]);
                      i++;
                    }
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
                        <Avatar className="h-7 w-7 md:h-8 md:w-8 mt-8 md:mt-10 flex-shrink-0">
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
                      {!showAvatar && !isOwnMessage && (
                        <div className="w-7 md:w-8" />
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[78%] md:max-w-[70%] ${
                          isOwnMessage ? "order-1" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1 md:mb-2">
                          <div className="flex-1 min-w-0">
                            {showAvatar && !isOwnMessage && (
                              <span className="text-[11px] md:text-[12px] font-semibold text-muted-foreground ml-1 truncate">
                                {sender?.name || "Unknown"}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] md:text-[10px] text-muted-foreground ml-2 whitespace-nowrap">
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

                        {/* Reply/Quote */}
                        {message.replyTo && !message.isRecalled && (
                          <div
                            key={`reply-${message.id}-${message.replyTo.messageId}`}
                            className={`${
                              isOwnMessage ? "ml-auto" : "mr-auto"
                            } mb-2 reply-container`}
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
                              <div className="text-[10px] md:text-[11px] mb-1 opacity-70">
                                Đang trả lời {message.replyTo.senderName}
                              </div>
                              <div className="text-[14px] md:text-[15px] text-foreground opacity-80 line-clamp-2">
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
                          className={`
                            p-2.5 md:p-3 transition-all duration-200 hover:shadow-md relative group message-bubble
                            ${
                              message.replyTo && !message.isRecalled
                                ? "rounded-t-sm rounded-b-2xl message-with-reply"
                                : "rounded-2xl"
                            }
                            ${
                              message.isRecalled
                                ? "bg-muted border border-border"
                                : isOwnMessage
                                ? "bg-sky-600 text-white"
                                : "bg-card text-foreground shadow-sm"
                            }
                          `}
                          style={{ minHeight: "40px" }}
                        >
                          <p
                            className={`text-[15px] md:text-[16px] whitespace-pre-wrap break-words ${
                              message.isRecalled
                                ? "text-muted-foreground italic"
                                : ""
                            }`}
                          >
                            {message.content}
                          </p>

                          {/* Quick reaction */}
                          {!message.isRecalled &&
                            message.id &&
                            !message.id.startsWith("temp_") && (
                              <div
                                className={`absolute top-2.5 md:top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                  isOwnMessage
                                    ? "-left-7 md:-left-8"
                                    : "-right-7 md:-right-8"
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
                                      <Smile className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
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

                          {/* Menu */}
                          {!message.isRecalled &&
                            message.id &&
                            !message.id.startsWith("temp_") && (
                              <div
                                className={`absolute top-2.5 md:top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                  isOwnMessage
                                    ? "-left-14 md:-left-16"
                                    : "-right-14 md:-right-16"
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
                                    className="w-36 md:w-40 bg-white border-gray-300 rounded-lg mt-4 md:mt-5 mr-10 md:mr-20"
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

                        {/* Reactions display */}
                        {!message.isRecalled &&
                          message.reactions &&
                          message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {Object.entries(
                                message.reactions.reduce((acc, reaction) => {
                                  const key = reaction.type || reaction.emoji;
                                  acc[key] = (acc[key] || []).concat(reaction);
                                  return acc;
                                }, {} as Record<string, MessageReaction[]>)
                              ).map(
                                ([reactionKey, reactions]: [
                                  string,
                                  MessageReaction[]
                                ]) => {
                                  const userReacted = reactions.some(
                                    (r) => r.userId === myId
                                  );
                                  const reactionType = reactions[0].type;

                                  let emoji = reactions[0].emoji;
                                  if (!emoji) {
                                    const quickReaction = quickReactions.find(
                                      (qr) => qr.type === reactionType
                                    );
                                    emoji = quickReaction?.emoji || "👍";
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
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs md:text-sm transition-colors message-reaction ${
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
                                }
                              )}
                            </div>
                          )}

                        {/* Read status */}
                        {isOwnMessage && shouldShowReadStatus && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-gray-500 justify-end">
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
                <div className="text-center text-muted-foreground py-6 md:py-8">
                  {selectedUser
                    ? "Chưa có tin nhắn nào"
                    : "Chọn một người dùng để bắt đầu chat"}
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-gray-200 bg-background shadow-sm flex-shrink-0 input-area-container">
            {replyingTo && (
              <div className="max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] mx-auto mb-3 bg-primary/10 border border-sky-500 rounded-lg p-2.5 md:p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="h-4 w-4 text-primary" />
                      <span className="text-[13px] md:text-[14px] text-primary truncate">
                        Đang trả lời{" "}
                        {replyingTo.senderId === myId
                          ? "chính mình"
                          : users.find((u) => u._id === replyingTo.senderId)
                              ?.name || "người dùng"}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-foreground bg-card rounded-lg px-3 py-2 border-l-3 border-sky-500 shadow-sm">
                      {replyingTo.content.length > 80
                        ? `${replyingTo.content.substring(0, 80)}...`
                        : replyingTo.content}
                    </div>
                  </div>
                  <button
                    onClick={handleCancelReply}
                    className="ml-2 mb-8 md:mb-10 p-1.5 hover:bg-primary/20 rounded-full transition-colors"
                    title="Hủy trả lời"
                  >
                    <X className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 max-w-full md:max-w-[680px] lg:max-w-[760px] xl:max-w-[790px] mx-auto relative">
              <div className="flex-1 relative">
                <Textarea
                  value={messageInput}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  placeholder="Soạn tin nhắn..."
                  className="
                    w-full pr-20 rounded-xl border-gray-300 focus:ring-sky-500 resize-none
                    py-2 px-3 md:px-4 min-h-[40px] max-h-[120px] auto-expand-textarea
                    text-foreground bg-background
                  "
                  disabled={!selectedUser}
                  rows={1}
                  style={{
                    height: `${textareaHeight}px`,
                    overflowY: textareaHeight >= 120 ? "auto" : "hidden",
                  }}
                />
                <div className="absolute right-2 md:right-3 bottom-1.5 md:bottom-2 flex items-center gap-1">
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

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
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
        </div>
      </div>
    </>
  );
}
