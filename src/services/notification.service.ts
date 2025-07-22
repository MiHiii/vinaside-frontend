import { api } from "./api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface NotificationRaw {
  _id: string;
  type: string;
  title: string;
  message: string;
  sent_at?: string;
  createdAt?: string;
  created_at?: string;
  is_read: boolean;
  avatar?: string;
  [key: string]: unknown;
}

const notificationService = {
  async getNotifications(params?: NotificationQuery) {
    const res = await api.get("/notifications", { params });
    const notifications: NotificationRaw[] = res.data.data?.notifications || [];
    // Chuẩn hóa dữ liệu cho UI
    return notifications.map((n) => ({
      id: n._id, // FE sẽ dùng id là _id backend
      type: n.type,
      title: n.title,
      message: n.message,
      time: n.sent_at || n.createdAt || n.created_at || "",
      isRead: n.is_read,
      avatar: n.avatar || undefined,
      _id: n._id, // giữ lại _id để dùng khi gọi API nếu cần
    }));
  },
  async getUnreadCount() {
    const res = await api.get("/notifications/unread-count");
    // Lấy unreadCount từ data nếu có
    return res.data.data?.unreadCount ?? res.data.unreadCount ?? 0;
  },
  async markAsRead(idOrObj: string | { id?: string; _id?: string }) {
    // Nếu truyền object notification, ưu tiên _id
    const realId =
      typeof idOrObj === "string" ? idOrObj : idOrObj._id || idOrObj.id || "";
    const res = await api.patch(`/notifications/${realId}/read`);
    return res.data;
  },
  async markAllAsRead() {
    const res = await api.post("/notifications/all-read");
    return res.data;
  },
  async deleteNotification(idOrObj: string | { id?: string; _id?: string }) {
    const realId =
      typeof idOrObj === "string" ? idOrObj : idOrObj._id || idOrObj.id || "";
    const res = await api.delete(`/notifications/${realId}`);
    return res.data;
  },
  async getNotificationDetail(id: string) {
    const res = await api.get(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationService;
