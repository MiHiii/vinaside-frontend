import { useState, useEffect, useCallback } from "react";
import { chatbotService, ChatbotMessage } from "@/services/chatbot.service";
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

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      const response = await chatbotService.getConversation(20, 1);
      if (response.success && response.data) {
        // Loại bỏ duplicate messages dựa trên content và reply
        const uniqueMessages = response.data.filter(
          (message, index, self) =>
            index ===
            self.findIndex(
              (m) => m.content === message.content && m.reply === message.reply
            )
        );
        setMessages(uniqueMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
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
        if (isConnected) {
          // Gửi qua WebSocket nếu đã kết nối
          // Không tạo bot reply ở đây, đợi WebSocket response
          chatbotService.sendMessageViaWebSocket(content.trim());
        } else {
          // Fallback: gửi qua API
          const response = await chatbotService.sendMessage({
            content: content.trim(),
            user_id: user?._id,
          });

          // Chỉ tạo bot reply khi không có WebSocket connection
          if (response.success && response.data?.reply) {
            // Cập nhật tin nhắn hiện có thay vì tạo tin nhắn mới
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId
                  ? { ...msg, reply: response.data.reply || "" }
                  : msg
              )
            );
          } else if (response.success && response.data?.message) {
            // Fallback cho trường hợp response có data.message
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId
                  ? { ...msg, reply: response.data.message || "" }
                  : msg
              )
            );
          } else {
            // Fallback message khi không có response data
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId
                  ? {
                      ...msg,
                      reply:
                        "Xin lỗi, tôi không thể xử lý tin nhắn của bạn ngay lúc này. Vui lòng thử lại sau.",
                    }
                  : msg
              )
            );
          }
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
            msg._id === messageId ? { ...msg, reply: errorMessage } : msg
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

    // Load chat history
    loadChatHistory();

    // Đăng ký listener cho tin nhắn mới
    const unsubscribeMessage = chatbotService.onMessage((message) => {
      // Chỉ cập nhật tin nhắn cuối cùng nếu nó chưa có reply
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (
          lastMessage &&
          lastMessage.reply === "" &&
          lastMessage.content === message.content
        ) {
          // Cập nhật tin nhắn cuối cùng với reply, giữ nguyên content
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, reply: message.reply || "" },
          ];
        } else if (
          lastMessage &&
          lastMessage.reply === "" &&
          lastMessage.content !== message.reply
        ) {
          // Cập nhật tin nhắn cuối cùng với reply, giữ nguyên content
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, reply: message.reply || "" },
          ];
        } else {
          // Kiểm tra xem tin nhắn này đã tồn tại chưa để tránh duplicate
          const existingMessage = prev.find(
            (msg) =>
              msg.content === message.content && msg.reply === message.reply
          );
          if (!existingMessage) {
            return [...prev, message];
          }
          return prev;
        }
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
  }, [connectWebSocket, loadChatHistory]);

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
    loadChatHistory,
  };
};
