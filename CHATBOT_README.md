# 🤖 Vinaside Chatbot

## 📋 Tổng quan

Chatbot được tích hợp vào ứng dụng Vinaside với khả năng chat realtime sử dụng WebSocket và API fallback.

## 🚀 Tính năng

### ✅ Đã hoàn thành

- **Realtime Chat**: Kết nối WebSocket để chat realtime
- **API Fallback**: Tự động chuyển sang API khi WebSocket không khả dụng
- **Auto Reconnect**: Tự động kết nối lại khi mất kết nối (tối đa 3 lần)
- **Connection Status**: Hiển thị trạng thái kết nối chi tiết
- **Unread Messages**: Thông báo tin nhắn chưa đọc
- **Message History**: Lưu trữ lịch sử tin nhắn
- **User Avatar**: Hiển thị avatar người dùng
- **Loading States**: Hiển thị trạng thái đang tải
- **Error Handling**: Xử lý lỗi và thông báo
- **Responsive Design**: Giao diện responsive
- **Debug Logging**: Console logs để debug

## 🛠️ Cấu trúc Files

```
src/
├── services/
│   └── chatbot.service.ts          # Service quản lý chatbot
├── hooks/
│   └── useChatbot.ts              # Hook quản lý state chatbot
├── pages/messages/
│   ├── ChatWindow.tsx             # Component cửa sổ chat
│   └── ChatWidget.tsx             # Component nút chat nổi
└── App.tsx                        # Tích hợp ChatWidget
```

## 🔧 Cấu hình

### Environment Variables

Thêm vào file `.env`:

```env
# WebSocket URL (sử dụng cùng cấu hình với socket.service.ts)
VITE_WS_URL=http://localhost:8080

# API Base URL (đã có sẵn trong api.ts)
VITE_API_URL=http://your-api-server.com/api/v1
```

### Backend API Endpoints

Chatbot sử dụng các endpoint sau:

```typescript
// Gửi tin nhắn
POST /api/v1/chatbot/message
Body: {
  message: string;
  userId?: string;
}

// WebSocket Connection (sử dụng cùng server với socket.service.ts)
WS ws://localhost:8080/ws/chatbot?userId={userId}
```

## 🔄 Fallback System

### WebSocket Connection Flow:

1. **Thử kết nối WebSocket** → `ws://localhost:8080/ws/chatbot`
2. **Nếu thành công** → Chat realtime
3. **Nếu thất bại** → Tự động chuyển sang API mode
4. **Auto Reconnect** → Thử kết nối lại tối đa 3 lần

### API Fallback:

- Khi WebSocket không khả dụng, chatbot tự động sử dụng API
- Gửi tin nhắn qua `POST /api/v1/chatbot/message`
- Nhận phản hồi từ API response
- Hiển thị thông báo "Chế độ API" cho user

## 📱 Sử dụng

### 1. Tích hợp vào App

ChatWidget đã được tích hợp sẵn trong `App.tsx`:

```tsx
import { ChatWidget } from "./pages/messages/ChatWidget";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <CustomToaster />
      <ChatWidget /> {/* Chatbot widget */}
    </>
  );
}
```

### 2. Sử dụng Hook

```tsx
import { useChatbot } from "@/hooks/useChatbot";

function MyComponent() {
  const {
    messages,
    isLoading,
    isConnected,
    hasUnreadMessages,
    connectionStatus,
    sendMessage,
    clearMessages,
    markAsRead,
  } = useChatbot();

  // Sử dụng các function và state
}
```

### 3. Sử dụng Service trực tiếp

```tsx
import { chatbotService } from "@/services/chatbot.service";

// Kết nối WebSocket
chatbotService.connectWebSocket(userId);

// Gửi tin nhắn
await chatbotService.sendMessage({
  message: "Hello",
  userId: "user123",
});

// Đăng ký listener
const unsubscribe = chatbotService.onMessage((message) => {
  console.log("New message:", message);
});
```

## 🎨 UI Components

### ChatWidget

- Nút chat nổi ở góc phải dưới
- Badge thông báo tin nhắn chưa đọc
- Indicator trạng thái kết nối
- Animation khi mở/đóng

### ChatWindow

- Header với thông tin bot và trạng thái kết nối
- Tooltip hiển thị chi tiết connection status
- Khu vực tin nhắn với scroll tự động
- Input area với validation
- Loading states và error handling
- Menu dropdown với tùy chọn xóa tin nhắn
- Thông báo khi sử dụng chế độ API

## 🔄 Workflow

1. **Khởi tạo**: ChatWidget được render trong App
2. **Kết nối**: Tự động kết nối WebSocket khi component mount
3. **Fallback**: Nếu WebSocket thất bại → Chuyển sang API mode
4. **Chat**: User gửi tin nhắn → Hiển thị ngay → Gửi qua WebSocket/API
5. **Nhận tin nhắn**: Bot trả lời → Hiển thị realtime → Cập nhật badge
6. **Reconnect**: Tự động kết nối lại khi mất kết nối (tối đa 3 lần)

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **WebSocket không kết nối được**

   ```bash
   # Kiểm tra console log
   Connecting to chatbot WebSocket: ws://localhost:8080/ws/chatbot?userId=...
   Chatbot WebSocket disconnected: 1006
   ```

   - **Giải pháp**: Chatbot sẽ tự động fallback sang API mode
   - **Kiểm tra**: Server WebSocket có chạy ở port 8080 không

2. **API không hoạt động**

   - Kiểm tra `VITE_API_URL` trong .env
   - Kiểm tra endpoint `/chatbot/message` có tồn tại không
   - Kiểm tra network tab trong DevTools

3. **Tin nhắn không hiển thị**
   - Kiểm tra console log có lỗi gì không
   - Kiểm tra WebSocket connection status
   - Kiểm tra API response

### Debug

```typescript
// Bật debug mode
localStorage.setItem("chatbot_debug", "true");

// Xem connection status
console.log("Chatbot Status:", chatbotService.getConnectionStatus());

// Xem logs trong console
console.log("Chatbot Debug:", {
  isConnected: chatbotService.isConnected(),
  messages: messages,
  user: user,
});
```

### Connection Status

- **🟢 Đã kết nối**: WebSocket hoạt động bình thường
- **🟡 Đang kết nối**: Đang thử kết nối WebSocket
- **🟠 Chế độ API**: Sử dụng API fallback
- **🔴 Mất kết nối**: Không thể kết nối

## 🔮 Tính năng tương lai

- [ ] Lưu tin nhắn vào localStorage
- [ ] Export chat history
- [ ] File upload support
- [ ] Voice messages
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Quick replies
- [ ] Chat analytics
- [ ] Multi-language support

## 📞 Support

Nếu có vấn đề, vui lòng:

1. Kiểm tra console log
2. Kiểm tra network tab
3. Kiểm tra WebSocket connection status
4. Kiểm tra API endpoint
5. Liên hệ team development

## 🔧 Technical Notes

### WebSocket URL Format:

```
ws://localhost:8080/ws/chatbot?userId={userId}
```

### API Request Format:

```typescript
POST /api/v1/chatbot/message
{
  "message": "Hello",
  "userId": "user123"
}
```

### Reconnection Logic:

- Tối đa 3 lần thử kết nối lại
- Delay 3 giây giữa các lần thử
- Tự động fallback sang API nếu thất bại
