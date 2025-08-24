import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Send, Smile, Reply, X, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker from "emoji-picker-react";
import { format, isSameDay as dfIsSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { useMessages } from "@/hooks/useMessages";
import { ReactionType, ConversationUI, MessageWithUI } from "@/types/message";

// Utility function to safely parse dates
const safeParseDate = (
  dateString: string | undefined,
  fallback: Date = new Date()
): Date => {
  if (!dateString) {
    console.warn("⚠️ [Messages] Date string is undefined or null");
    return fallback;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("⚠️ [Messages] Invalid date string:", dateString);
      return fallback;
    }
    return date;
  } catch (error) {
    console.error("❌ [Messages] Error parsing date:", dateString, error);
    return fallback;
  }
};

function DayDivider({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center my-6">
      <span className="text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1 shadow-sm">
        {format(date, "d 'thg' M", { locale: vi })}
      </span>
    </div>
  );
}

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
    testSocketConnection, // Add test function
  } = useMessages();

  if (!myId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[750px] bg-background justify-center mt-6 mb-6"
      style={{ scrollBehavior: "auto" }}
    >
      <div className="flex w-full max-w-[1350px] h-full overflow-hidden rounded-lg shadow-lg">
        {/* Sidebar */}
        <div className="w-100 bg-card border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
            <h1 className="text-[20px] font-semibold text-foreground">
              Tin nhắn
            </h1>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full h-8 px-3 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full h-8 px-3 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
              >
                Chưa đọc
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {isLoadingConversations ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 rounded bg-gray-200 mb-2" />
                        <div className="h-3 rounded bg-gray-200 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có cuộc hội thoại nào
                  </p>
                </div>
              ) : (
                conversations.map((c: ConversationUI) => (
                  <button
                    key={c._id}
                    onClick={() => selectConversation(c)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition
                      ${
                        selectedConversation?._id === c._id
                          ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                          : "bg-transparent"
                      } hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] focus:outline-none`}
                  >
                    <Avatar className="h-12 w-12 ring-1 ring-gray-200">
                      <AvatarImage
                        src={c.display.avatar_url || "/placeholder.svg"}
                        alt={c.display.title}
                      />
                      <AvatarFallback>
                        {c.display.title?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate text-foreground">
                          {c.display.title}
                        </h3>
                        {c.lastMessage && (
                          <span className="text-[11px] text-muted-foreground">
                            {format(
                              safeParseDate(c.lastMessage.sent_at),
                              "HH:mm"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {c.display.subtitle || "Chưa có tin nhắn"}
                        </p>
                        {c.display.unreadCount > 0 && (
                          <span className="text-[11px] px-2 py-[2px] rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            {c.display.unreadCount > 99
                              ? "99+"
                              : c.display.unreadCount}
                          </span>
                        )}
                      </div>
                      {c.display.badge && (
                        <div className="mt-1">
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-[2px] rounded">
                            {c.display.badge.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Header giống Airbnb */}
              <div className="h-19 px-6 flex items-center justify-between bg-card border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-1 ring-gray-200">
                    <AvatarImage
                      src={
                        selectedConversation.display?.avatar_url ||
                        "/placeholder.svg"
                      }
                      alt={selectedConversation.display?.title}
                    />
                    <AvatarFallback>
                      {selectedConversation.display?.title?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate text-foreground">
                      {selectedConversation.display?.title}
                    </div>
                    {selectedConversation.display?.subtitle && (
                      <div className="text-sm text-muted-foreground truncate">
                        {selectedConversation.display.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea
                className="flex-1 min-h-0"
                style={{ scrollBehavior: "smooth" }}
                data-radix-scroll-area-viewport
              >
                <div
                  className="px-6 py-4 max-w-4xl mx-auto"
                  style={{ scrollBehavior: "auto" }}
                >
                  <div ref={topSentinelRef} />

                  {hasMoreMessages && (
                    <div className="flex justify-center py-4">
                      <Button
                        onClick={loadMoreMessages}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="rounded-full hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                      >
                        {isLoading ? "Đang tải..." : "Tải thêm tin nhắn cũ"}
                      </Button>
                    </div>
                  )}

                  {/* render với mốc ngày ở giữa */}
                  {(() => {
                    const blocks: React.ReactNode[] = [];
                    let lastDate: Date | null = null;

                    // Messages are now in chronological order (oldest to newest)
                    messages.forEach((m: MessageWithUI, idx: number) => {
                      // Use safe date parsing to prevent "Invalid time value" errors
                      const sentAt = safeParseDate(m.sent_at);

                      if (!lastDate || !dfIsSameDay(lastDate, sentAt)) {
                        blocks.push(
                          <DayDivider key={`d-${idx}`} date={sentAt} />
                        );
                        lastDate = sentAt;
                      }

                      const isMine = m.ui?.mine ?? m.sender_id === myId;
                      const showSenderMeta = m.ui?.show_sender_meta ?? false;

                      blocks.push(
                        <div
                          key={m._id}
                          className={`mb-3 flex ${
                            isMine ? "justify-end" : "justify-start"
                          } gap-2`}
                        >
                          {/* avatar người kia */}
                          {!isMine &&
                            (showSenderMeta ? (
                              <Avatar className="h-8 w-8 mt-5">
                                <AvatarImage
                                  src={
                                    m.ui?.sender_avatar_url ||
                                    "/placeholder.svg"
                                  }
                                />
                                <AvatarFallback className="text-xs">
                                  {m.ui?.sender_display_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            ))}

                          <div className={`max-w-[72%] ${isMine ? "" : ""}`}>
                            {/* meta giờ */}
                            <div
                              className={`mb-1 ${
                                isMine ? "text-right" : "text-left"
                              }`}
                            >
                              {!isMine && showSenderMeta && (
                                <span className="text-[13px] font-medium">
                                  {m.ui?.sender_display_name}
                                </span>
                              )}
                              <span
                                className={`text-[11px] text-muted-foreground ${
                                  !isMine && showSenderMeta ? "ml-2" : ""
                                }`}
                              >
                                {format(sentAt, "HH:mm")}
                              </span>
                            </div>

                            {/* reply preview */}
                            {m.reply_to && !m.is_recalled && (
                              <div
                                className={`mb-2 rounded-xl border border-gray-200 bg-gray-50 p-2`}
                              >
                                <div className="text-[11px] text-muted-foreground">
                                  Trả lời {m.reply_to.sender_name || "Unknown"}
                                </div>
                                <div className="text-sm line-clamp-2 text-foreground">
                                  {(m.reply_to.content || "").length > 80
                                    ? `${(m.reply_to.content || "").slice(
                                        0,
                                        80
                                      )}...`
                                    : m.reply_to.content || ""}
                                </div>
                              </div>
                            )}

                            {/* bubble */}
                            <div
                              className={[
                                "group relative px-4 py-3 rounded-2xl shadow-sm border",
                                m.is_recalled
                                  ? "bg-gray-100 border-gray-200 text-gray-500 italic"
                                  : isMine
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-white border-gray-200",
                              ].join(" ")}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {m.content || ""}
                              </p>

                              {!m.is_recalled && (
                                <div
                                  className={`absolute top-2 ${
                                    isMine ? "left-[-70px]" : "right-[-70px]"
                                  } opacity-0 group-hover:opacity-100 transition`}
                                >
                                  <div className="flex gap-1">
                                    <DropdownMenu
                                      open={showReactionPicker === m._id}
                                      onOpenChange={(o) =>
                                        setShowReactionPicker(o ? m._id : null)
                                      }
                                    >
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 rounded-full p-0 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                                        >
                                          <Smile className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="p-2">
                                        <div className="flex gap-1">
                                          {quickReactions.map(
                                            ({
                                              emoji,
                                              type,
                                            }: {
                                              emoji: string;
                                              type: ReactionType;
                                            }) => (
                                              <Button
                                                key={type}
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-lg hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                                                onClick={() =>
                                                  toggleReaction(m._id, type)
                                                }
                                              >
                                                {emoji}
                                              </Button>
                                            )
                                          )}
                                        </div>
                                      </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 rounded-full p-0 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align={isMine ? "start" : "end"}
                                      >
                                        {isMine ? (
                                          <DropdownMenuItem
                                            onClick={() => recallMessage(m._id)}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Thu hồi
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem
                                            onClick={() => replyToMessage(m)}
                                          >
                                            <Reply className="h-4 w-4 mr-2" />
                                            Trả lời
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* reactions */}
                            {!m.is_recalled &&
                              m.reactions &&
                              m.reactions.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {Object.entries(
                                    m.reactions.reduce((acc, r) => {
                                      const k = r.type;
                                      (acc[k] ||= []).push(r);
                                      return acc;
                                    }, {} as Record<string, typeof m.reactions>)
                                  ).map(([type, rs]) => {
                                    const me = rs.some(
                                      (r) => r.userId === myId
                                    );
                                    const emoji = rs[0]?.emoji || "👍";
                                    return (
                                      <button
                                        key={type}
                                        onClick={() =>
                                          toggleReaction(
                                            m._id,
                                            type as ReactionType
                                          )
                                        }
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition
                                      ${
                                        me
                                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                          : "bg-gray-100 text-gray-700 border-gray-200"
                                      }`}
                                      >
                                        <span>{emoji}</span>
                                        {rs.length > 1 && (
                                          <span className="font-medium">
                                            {rs.length}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    });

                    blocks.push(<div key="end" ref={messagesEndRef} />);
                    return blocks;
                  })()}
                </div>
              </ScrollArea>

              {/* Composer */}
              <div className="border-t border-gray-200 bg-card/90 backdrop-blur flex-shrink-0">
                <div className="max-w-4xl mx-auto px-6 py-4">
                  {/* banner chú thích giờ như ảnh */}

                  {replyingTo && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Reply className="h-4 w-4 text-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Đang trả lời{" "}
                            {replyingTo.ui?.sender_display_name ||
                              "Unknown User"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelReply}
                          className="h-6 w-6 p-0 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(replyingTo.content || "").length > 100
                          ? `${(replyingTo.content || "").substring(0, 100)}...`
                          : replyingTo.content || ""}
                      </div>
                    </div>
                  )}

                  <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Soạn tin nhắn..."
                        className="min-h-[80px] max-h-[150px] resize-none pr-24 rounded-xl
                          border border-gray-200 
                          bg-white
                          shadow-sm
                          transition-all
                          duration-200
                          placeholder:text-gray-400
                          focus:border-blue-400
                          focus:ring-2 
                          focus:ring-blue-100
                          focus:outline-none
                          hover:border-gray-300
                          active:border-blue-500
                          disabled:bg-gray-50
                          disabled:text-gray-500
                          disabled:border-gray-200
                          disabled:shadow-none"
                        rows={1}
                        autoFocus={false}
                        onFocus={(e) => {
                          // Prevent auto-scroll on focus
                          e.target.scrollIntoView = () => {};
                        }}
                        onBlur={(e) => {
                          // Prevent auto-scroll on blur
                          e.target.scrollIntoView = () => {};
                        }}
                      />
                      <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-full hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] transition"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={sendMessage}
                          disabled={!messageInput.trim() || isSending}
                          className="h-9 w-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600 transition"
                          title="Gửi"
                        >
                          {isSending ? (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                              />
                            </svg>
                          ) : (
                            <Send className="h-4 w-4 text-white" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-[72px] right-6 z-50">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
                          <EmojiPicker
                            onEmojiClick={handleEmojiSelect}
                            width={320}
                            height={400}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  Chọn một cuộc hội thoại
                </h2>
                <p className="text-muted-foreground">
                  Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu nhắn
                  tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
