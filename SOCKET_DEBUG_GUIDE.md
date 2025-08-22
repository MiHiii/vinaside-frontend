# 🔌 Socket.IO Debug Guide

## 🚨 Vấn đề hiện tại

Frontend có thể chưa kết nối đúng với Socket.IO server hoặc chưa listen đúng events.

## 🔍 Cách Debug

### 1. Kiểm tra Console Browser

Mở Developer Tools (F12) và kiểm tra Console tab để xem các log messages:

```javascript
// Các log messages cần tìm:
🔌 [useMessages] Setting up Socket.IO connection...
🔌 [useMessages] Connecting to socket...
✅ Socket connected
🏠 [useMessages] Joined user room: user_123
🔔 [useMessages] Connected to notifications
```

### 2. Kiểm tra Network Tab

- Mở Network tab trong Developer Tools
- Lọc theo "WS" (WebSocket)
- Kiểm tra xem có WebSocket connection nào không
- Kiểm tra status của WebSocket connection

### 3. Sử dụng Socket Debug Component

- Mở Messages page
- Nhấn vào button "🔌 Socket Debug" ở góc dưới bên phải
- Kiểm tra:
  - Status: Connected/Disconnected
  - User ID: Có đúng không
  - Token: Present/Missing
  - Connection Attempts: Số lần thử kết nối

### 4. Test Socket Connection

Trong Console browser, chạy các lệnh sau:

```javascript
// Kiểm tra socket service
console.log('Socket Status:', window.socketService?.getSocketStatus());

// Force reconnect
window.socketService?.forceReconnect(token, userId);

// Test emit event (nếu cần)
window.socketService?.socket?.emit('test', { message: 'Hello' });
```

## 🛠️ Các bước sửa lỗi

### 1. Kiểm tra Environment Variables

Đảm bảo `VITE_WS_URL` được set đúng trong `.env`:

```env
VITE_WS_URL=http://localhost:8080
```

### 2. Kiểm tra Backend Socket.IO Server

Đảm bảo backend đang chạy và Socket.IO server đang listen:

```bash
# Kiểm tra backend logs
# Tìm các log như:
# Socket.IO server started on port 8080
# User connected: userId
# User joined room: user_123
```

### 3. Kiểm tra CORS

Đảm bảo backend cho phép CORS từ frontend:

```javascript
// Backend CORS config
app.use(
  cors({
    origin: 'http://localhost:5174', // Frontend URL
    credentials: true,
  }),
);
```

### 4. Kiểm tra Authentication

Đảm bảo token được gửi đúng trong socket connection:

```javascript
// Socket connection với auth
this.socket = io(WS_URL, {
  auth: { token }, // Token phải hợp lệ
  transports: ['websocket'],
});
```

## 📋 Checklist Debug

- [ ] Backend Socket.IO server đang chạy
- [ ] Frontend có token hợp lệ
- [ ] WebSocket connection thành công
- [ ] User join đúng room (`user_${userId}`)
- [ ] Event listeners được setup
- [ ] Backend emit events đúng format
- [ ] Frontend receive events

## 🔧 Các lỗi thường gặp

### 1. "Socket connection failed"

- Kiểm tra `VITE_WS_URL`
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS config

### 2. "Authentication failed"

- Kiểm tra token có hợp lệ không
- Kiểm tra token format trong localStorage

### 3. "Events not received"

- Kiểm tra event names có đúng không
- Kiểm tra user có join đúng room không
- Kiểm tra backend có emit events không

### 4. "Room subscription failed"

- Kiểm tra room name format
- Kiểm tra user permissions
- Kiểm tra backend room logic

## 📞 Support

Nếu vẫn gặp vấn đề, hãy:

1. Chụp screenshot Console logs
2. Chụp screenshot Network tab
3. Chụp screenshot Socket Debug component
4. Gửi cho team backend để kiểm tra server logs
