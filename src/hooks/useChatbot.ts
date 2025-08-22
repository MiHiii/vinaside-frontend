import { useState, useEffect, useCallback } from "react";
import {
  chatbotService,
  ChatbotMessage,
  BotMessage,
} from "@/services/chatbot.service";
import { useAppSelector } from "@/hooks/useRedux";

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");
  const { user } = useAppSelector((state) => state.auth);

  // Kết nối WebSocket
  const connectWebSocket = useCallback(() => {
    chatbotService.connectWebSocket(user?._id);
  }, [user?._id]);

  // Load chat history - removed since we don't use conversation API anymore
  const loadChatHistory = useCallback(async () => {
    // No longer loading history from API
    console.log("Chat history loading disabled");
  }, []);

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const messageId = Date.now().toString();
      const userMessage: ChatbotMessage = {
        _id: messageId,
        content: content.trim(),
        reply: "",
        createdAt: new Date().toISOString(),
        user_id: user?._id,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Chỉ gửi qua API, không gửi qua WebSocket để tránh duplicate
        const response = await chatbotService.sendMessage({
          content: content.trim(),
          user_id: user?._id,
        });

        // Cập nhật tin nhắn với response ngay lập tức
        if (response.success && response.data) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, reply: response.data } : msg
            )
          );
        } else {
          // Fallback message khi không có response data
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    reply: {
                      type: "text",
                      text: "Xin lỗi, tôi không thể xử lý tin nhắn của bạn ngay lúc này. Vui lòng thử lại sau.",
                    },
                  }
                : msg
            )
          );
        }
      } catch (error: any) {
        console.error("useChatbot: Error sending message:", error);

        // Xử lý các loại lỗi khác nhau
        let errorMessage = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";

        if (error?.response) {
          // Lỗi từ API response
          const status = error.response.status;
          const data = error.response.data;

          if (status === 503) {
            errorMessage =
              "Dịch vụ chatbot tạm thời không khả dụng. Vui lòng thử lại sau.";
          } else if (status === 500) {
            errorMessage = "Lỗi server. Vui lòng thử lại sau.";
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } else if (error?.request) {
          // Lỗi network
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        }

        // Cập nhật tin nhắn hiện có với error message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  reply: {
                    type: "text",
                    text: errorMessage,
                  },
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isConnected, user?._id]
  );

  // Xóa tin nhắn
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = useCallback(() => {
    setHasUnreadMessages(false);
  }, []);

  // Khởi tạo khi component mount
  useEffect(() => {
    connectWebSocket();

    // Chat history loading disabled - no longer using conversation API

    // Đăng ký listener cho tin nhắn mới từ WebSocket
    const unsubscribeMessage = chatbotService.onMessage((message) => {
      // Chỉ xử lý tin nhắn mới từ WebSocket, không duplicate với API response
      setMessages((prev) => {
        // Kiểm tra xem tin nhắn này đã tồn tại chưa để tránh duplicate
        const existingMessage = prev.find(
          (msg) =>
            msg.content === message.content &&
            (typeof msg.reply === "string"
              ? msg.reply ===
                (typeof message.reply === "string" ? message.reply : "")
              : JSON.stringify(msg.reply) === JSON.stringify(message.reply))
        );

        if (!existingMessage) {
          return [...prev, message];
        }

        // Nếu tin nhắn đã tồn tại, chỉ cập nhật nếu reply rỗng
        return prev.map((msg) => {
          if (
            msg.content === message.content &&
            (typeof msg.reply === "string" ? msg.reply === "" : !msg.reply)
          ) {
            return { ...msg, reply: message.reply };
          }
          return msg;
        });
      });
      setHasUnreadMessages(true);
    });

    // Đăng ký listener cho trạng thái kết nối
    const unsubscribeConnection = chatbotService.onConnectionChange(
      (connected) => {
        setIsConnected(connected);
        setConnectionStatus(connected ? "connected" : "disconnected");
      }
    );

    // Cleanup khi component unmount
    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
    };
  }, [connectWebSocket]);

  return {
    messages,
    isLoading,
    isConnected,
    hasUnreadMessages,
    connectionStatus,
    sendMessage,
    clearMessages,
    markAsRead,
    connectWebSocket,
  };
};
