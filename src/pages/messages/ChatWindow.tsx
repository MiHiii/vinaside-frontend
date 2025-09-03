import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Bot,
  Send,
  X,
  Wifi,
  WifiOff,
  Trash2,
  AlertCircle,
  MapPin,
  Users,
  Calendar,
  Star,
  Heart,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { useAppSelector } from "@/hooks/useRedux";
import { format } from "date-fns";
import { MarkdownText } from "@/components/common/MarkdownText";
import { BotMessage } from "@/services/chatbot.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Component for text messages
function TextMessage({ message }: { message: BotMessage }) {
  return (
    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
      <MarkdownText text={message.text || ""} />
    </div>
  );
}

// Component for listings messages
function ListingsMessage({ message }: { message: BotMessage }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCtaClick = (cta: any) => {
    if (cta.action === "HOLD") {
      // Handle booking action
      console.log("Booking action:", cta);
    } else if (cta.action === "DETAIL") {
      // Handle detail action
      console.log("Detail action:", cta);
    }
  };

  const handleViewDetail = (detailUrl?: string, id?: string) => {
    if (detailUrl) {
      window.open(detailUrl, "_blank");
    } else if (id) {
      window.open(`/room-detail/${id}`, "_blank");
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      {message.header && (
        <div className="text-sm text-gray-700 mb-2 sm:mb-3">
          {message.header}
        </div>
      )}

      {/* Meta info */}
      {message.meta && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mb-2 sm:mb-3">
          {message.meta.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{message.meta.city}</span>
            </div>
          )}
          {message.meta.guests && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{message.meta.guests} khách</span>
            </div>
          )}
          {message.meta.total && (
            <div className="flex items-center gap-1">
              <span>{message.meta.total} phòng</span>
            </div>
          )}
        </div>
      )}

      {/* Listings */}
      {message.items && message.items.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          {message.items.map((item, index) => {
            // Debug log để kiểm tra dữ liệu
            console.log("Listing item:", item);
            return (
              <Card
                key={item.id || index}
                className="border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <CardHeader className="pb-2 px-3 sm:px-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.log("Image failed to load:", item.imageUrl);
                            e.currentTarget.style.display = "none";
                          }}
                          onLoad={(e) => {
                            console.log(
                              "Image loaded successfully:",
                              item.imageUrl
                            );
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium text-gray-900 overflow-hidden">
                        <div className="line-clamp-2">{item.title}</div>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
                  {/* Price */}
                  {item.pricePerNight > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base sm:text-lg font-bold text-green-600">
                        {formatPrice(item.pricePerNight)}
                      </span>
                      <span className="text-xs text-gray-500">/đêm</span>
                    </div>
                  )}

                  {/* Address */}
                  {item.address && (
                    <div className="flex items-start gap-1 mb-2">
                      <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-600 overflow-hidden">
                        <div className="line-clamp-2">{item.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs bg-white text-black border border-gray-200 hover:bg-gray-100"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Detail button */}
                  {(item.detailUrl || item.id) && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs bg-white text-black border border-gray-200 hover:bg-gray-100"
                        onClick={() =>
                          handleViewDetail(item.detailUrl, item.id)
                        }
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Xem chi tiết
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CTA Button */}
      {message.cta && (
        <div className="pt-2">
          <Button
            onClick={() => handleCtaClick(message.cta)}
            className="w-full text-xs bg-white text-black border border-gray-200 hover:bg-gray-100"
            size="sm"
          >
            {message.cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

// Component to render bot message based on type
function BotMessageRenderer({ message }: { message: string | BotMessage }) {
  // Handle string messages (legacy support)
  if (typeof message === "string") {
    return <TextMessage message={{ type: "text", text: message }} />;
  }

  // Handle BotMessage objects
  if (typeof message === "object" && message !== null) {
    switch (message.type) {
      case "text":
        return <TextMessage message={message} />;
      case "listings":
        return <ListingsMessage message={message} />;
      default:
        // Fallback for unknown types - try to display as text if possible
        if (message.text) {
          return <TextMessage message={{ type: "text", text: message.text }} />;
        }
        if (message.header) {
          return (
            <TextMessage message={{ type: "text", text: message.header }} />
          );
        }
        // Last resort fallback
        return (
          <TextMessage
            message={{
              type: "text",
              text: "Không thể hiển thị tin nhắn này. Vui lòng thử lại.",
            }}
          />
        );
    }
  }

  // Fallback for invalid message format
  return (
    <TextMessage
      message={{
        type: "text",
        text: "Tin nhắn không hợp lệ. Vui lòng thử lại.",
      }}
    />
  );
}

export function ChatWindow({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const {
    messages,
    isLoading,
    isConnected,
    connectionStatus,
    sendMessage,
    clearMessages,
    markAsRead,
  } = useChatbot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Đánh dấu tin nhắn đã đọc khi mở chat
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  // Focus input khi component mount và khi loading kết thúc
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input.trim());
    setInput("");

    // Focus lại input sau khi gửi tin nhắn
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleClearMessages = () => {
    clearMessages();
  };

  const getConnectionStatusColor = () => {
    if (isConnected) return "text-green-400";
    if (connectionStatus === "connecting") return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-3 sm:p-4 relative flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="border-2 border-white/20 w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src="/logo.png" alt="Vinaside Bot" />
              <AvatarFallback className="bg-white/10 text-white text-xs sm:text-sm">
                VB
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm opacity-90">Chat với</div>
              <div className="font-semibold text-base sm:text-lg truncate">
                Vinaside Bot
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Connection status indicator */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs cursor-help">
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-green-300" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-300" />
                    )}
                    <span
                      className={cn("opacity-80", getConnectionStatusColor())}
                    ></span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isConnected
                      ? "Kết nối WebSocket thành công - Chat realtime"
                      : "Sử dụng API fallback - Chat qua HTTP"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                >
                  <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleClearMessages}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tin nhắn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
              onClick={onClose}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <ScrollArea className="h-full p-2 sm:p-4">
          <div className="space-y-3 sm:space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-6 sm:py-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <p className="text-base sm:text-lg font-medium mb-2 text-gray-700">
                  Chào mừng bạn đến với Vinaside Bot!
                </p>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                  Tôi có thể giúp bạn:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Tìm hiểu về dịch vụ của chúng tôi</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Hỗ trợ đặt phòng</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Giải đáp thắc mắc</span>
                  </div>
                </div>
                {!isConnected && (
                  <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs font-medium">
                        Đang sử dụng chế độ API
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {messages.map((message) => (
              <div key={message._id} className="space-y-2 sm:space-y-3">
                {/* User Message */}
                <div className="flex items-start gap-2 sm:gap-3 justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-2 sm:p-3 max-w-[75%] sm:max-w-[70%] shadow-sm">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="text-xs opacity-70 mt-1">
                      {format(new Date(message.createdAt), "HH:mm")}
                    </div>
                  </div>
                  <Avatar className="flex-shrink-0 border-2 border-gray-200 w-7 h-7 sm:w-8 sm:h-8">
                    <AvatarImage
                      src={
                        user?.avatar_url ||
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt="Bạn"
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs sm:text-sm">
                      {user?.name?.charAt(0) || "B"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Bot Reply - chỉ hiển thị khi có reply */}
                {message.reply && (
                  <div className="flex items-start gap-2 sm:gap-3 justify-start">
                    <Avatar className="flex-shrink-0 border-2 border-blue-200 w-7 h-7 sm:w-8 sm:h-8">
                      <AvatarImage src="/logo.png" alt="Vinaside Bot" />
                      <AvatarFallback className="bg-blue-50 text-blue-600 text-xs sm:text-sm">
                        VB
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl p-3 sm:p-4 max-w-[75%] sm:max-w-[70%] shadow-sm border border-gray-200">
                      <BotMessageRenderer message={message.reply} />
                      <div className="text-xs text-gray-500 mt-2 sm:mt-3 flex items-center gap-1">
                        <span>
                          {format(new Date(message.createdAt), "HH:mm")}
                        </span>
                        <span>•</span>
                        <span>Vinaside Bot</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2 sm:gap-3 justify-start">
                <Avatar className="flex-shrink-0 border-2 border-blue-200 w-7 h-7 sm:w-8 sm:h-8">
                  <AvatarImage src="/logo.png" alt="Vinaside Bot" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-xs sm:text-sm">
                    VB
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-4"
        >
          <Input
            ref={inputRef}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            value={input}
            placeholder={isLoading ? "Đang tải..." : "Nhập tin nhắn của bạn..."}
            onChange={handleInputChange}
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
