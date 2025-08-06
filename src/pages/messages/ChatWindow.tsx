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
} from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { useAppSelector } from "@/hooks/useRedux";
import { format } from "date-fns";
import { MarkdownText } from "@/components/common/MarkdownText";
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

export function ChatWindow({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input.trim());
    setInput("");
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
    <div className="flex flex-col h-full rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 dark:bg-gray-100 text-white p-4 relative flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-white dark:border-gray-900">
              <AvatarImage src="/logo.png" alt="Vinaside Bot" />
              <AvatarFallback className="bg-gray-700 text-white dark:bg-gray-200 ">
                VB
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm opacity-80">Chat với</div>
              <div className="font-semibold text-lg">Vinaside Bot</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status indicator */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs cursor-help">
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-green-400" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-400" />
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
                  className="text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-5 w-5" />
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
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 bg-white">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Chào mừng bạn đến với Vinaside Bot!
                </p>
                <p className="text-sm">Tôi có thể giúp bạn:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Tìm hiểu về dịch vụ của chúng tôi</li>
                  <li>• Hỗ trợ đặt phòng</li>
                  <li>• Giải đáp thắc mắc</li>
                </ul>
                {!isConnected && (
                  <div className="mt-4 p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600 ">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">Đang sử dụng chế độ API</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {messages.map((message) => (
              <div key={message._id} className="space-y-2">
                {/* User Message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gray-900 text-white dark:bg-gray-100 rounded-xl p-3 max-w-[75%]">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="text-xs opacity-60 mt-1">
                      {format(new Date(message.createdAt), "HH:mm")}
                    </div>
                  </div>
                  <Avatar className="flex-shrink-0">
                    <AvatarImage
                      src={
                        user?.avatar_url ||
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt="Bạn"
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "B"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Bot Reply - chỉ hiển thị khi có reply */}
                {message.reply && message.reply.trim() !== "" && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar className="flex-shrink-0">
                      <AvatarImage src="/logo.png" alt="Vinaside Bot" />
                      <AvatarFallback>VB</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 text-gray-900 rounded-xl p-3 max-w-[75%]">
                      <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        <MarkdownText text={message.reply} />
                      </div>
                      <div className="text-xs opacity-60 mt-2 flex items-center gap-1">
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
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="flex-shrink-0">
                  <AvatarImage src="/logo.png" alt="Vinaside Bot" />
                  <AvatarFallback>VB</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50 rounded-xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
      <div className="flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col p-4 border-t border-gray-300 bg-white"
        >
          <div className="flex items-center justify-between">
            <Input
              className="flex-1 mb-2 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              placeholder={
                isLoading ? "Đang tải..." : "Nhập tin nhắn của bạn..."
              }
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="icon"
                className="rounded-full h-10 w-10 bg-sky-900 hover:bg-sky-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 shadow-md ml-2"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
