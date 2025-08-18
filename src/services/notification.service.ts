import { api } from "./api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  metadata?: {
    bookingId?: string;
    propertyId?: string;
    listingId?: string;
    bookingStatus?: string;
    previousStatus?: string;
    roomName?: string;
    propertyName?: string;
    listingTitle?: string;
    bookingCode?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
    finalAmount?: number;
    nights?: number;
    amount?: number;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    allAdminEmails?: string;
    paymentStatus?: string;
    totalPrice?: number;
    serviceFee?: number;
    taxAmount?: number;
    [key: string]: unknown;
  };
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
  metadata?: {
    bookingId?: string | { $oid: string };
    propertyId?: string | { $oid: string };
    listingId?: string | { $oid: string };
    bookingStatus?: string;
    previousStatus?: string;
    roomName?: string;
    propertyName?: string;
    listingTitle?: string;
    bookingCode?: string;
    checkInDate?: string | { $date: string };
    checkOutDate?: string | { $date: string };
    guests?: number;
    finalAmount?: number;
    nights?: number;
    amount?: number;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    allAdminEmails?: string;
    paymentStatus?: string;
    totalPrice?: number;
    serviceFee?: number;
    taxAmount?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const notificationService = {
  async getNotifications(params?: NotificationQuery): Promise<Notification[]> {
    const res = await api.get("/notifications", { params });
    const notifications: NotificationRaw[] = res.data.data?.notifications || [];
    // Chuẩn hóa dữ liệu cho UI
    return notifications.map<Notification>((n) => {
      // Debug: log raw notification để kiểm tra
      console.log("Raw notification:", n);
      console.log("Raw metadata:", n.metadata);

      // Xử lý metadata để chuẩn hóa ObjectId và Date
      let normalizedMetadata: Notification["metadata"] | undefined = undefined;
      if (n.metadata) {
        const meta = {
          ...n.metadata,
          // Xử lý bookingId
          bookingId:
            typeof n.metadata.bookingId === "object" &&
            n.metadata.bookingId?.$oid
              ? n.metadata.bookingId.$oid
              : n.metadata.bookingId,
          // Xử lý propertyId
          propertyId:
            typeof n.metadata.propertyId === "object" &&
            n.metadata.propertyId?.$oid
              ? n.metadata.propertyId.$oid
              : n.metadata.propertyId,
          // Xử lý listingId
          listingId:
            typeof n.metadata.listingId === "object" &&
            n.metadata.listingId?.$oid
              ? n.metadata.listingId.$oid
              : n.metadata.listingId,
          // Xử lý checkInDate
          checkInDate:
            typeof n.metadata.checkInDate === "object" &&
            n.metadata.checkInDate?.$date
              ? n.metadata.checkInDate.$date
              : n.metadata.checkInDate,
          // Xử lý checkOutDate
          checkOutDate:
            typeof n.metadata.checkOutDate === "object" &&
            n.metadata.checkOutDate?.$date
              ? n.metadata.checkOutDate.$date
              : n.metadata.checkOutDate,
        } as Notification["metadata"]; // cast to normalized metadata type
        normalizedMetadata = meta;
      }

      return {
        id: n._id, // FE sẽ dùng id là _id backend
        type: n.type,
        title: n.title,
        message: n.message,
        time: n.sent_at || n.createdAt || n.created_at || "",
        isRead: n.is_read,
        avatar: n.avatar || undefined,
        metadata: normalizedMetadata,
      };
    });
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
