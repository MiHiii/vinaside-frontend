import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  fetchNotificationDetail,
  clearNotificationDetail,
  clearNotificationError,
  addNotification,
  clearNotifications,
} from "@/store/slices/notificationSlice";
import { useCallback } from "react";
import {
  Notification,
  NotificationQuery,
} from "@/services/notification.service";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading, error, notificationDetail } =
    useAppSelector((state) => state.notification);

  const getNotifications = useCallback(
    (params?: NotificationQuery) => {
      dispatch(fetchNotifications(params));
    },
    [dispatch]
  );

  const getUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const markNotificationAsRead = useCallback(
    (id: string) => {
      dispatch(markAsRead(id));
    },
    [dispatch]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const removeNotification = useCallback(
    (id: string) => {
      dispatch(deleteNotification(id));
    },
    [dispatch]
  );

  const getNotificationDetail = useCallback(
    (id: string) => {
      dispatch(fetchNotificationDetail(id));
    },
    [dispatch]
  );

  const clearDetail = useCallback(() => {
    dispatch(clearNotificationDetail());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearNotificationError());
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Hàm thêm notification mới từ socket
  const addNotificationRealtime = useCallback(
    (notification: Notification | Record<string, unknown>) => {
      // Chuẩn hóa lại object notification nhận từ socket
      const n = notification as Record<string, unknown>;
      const normalized = {
        id:
          typeof n._id === "string"
            ? n._id
            : typeof n.id === "string"
            ? n.id
            : "",
        type: typeof n.type === "string" ? n.type : "",
        title: typeof n.title === "string" ? n.title : "",
        message: typeof n.message === "string" ? n.message : "",
        time:
          (typeof n.time === "string" && n.time) ||
          (typeof n.sent_at === "string" && n.sent_at) ||
          (typeof n.createdAt === "string" && n.createdAt) ||
          (typeof n.created_at === "string" && n.created_at) ||
          new Date().toISOString(),
        isRead:
          typeof n.isRead === "boolean"
            ? n.isRead
            : typeof n.is_read === "boolean"
            ? n.is_read
            : false,
        avatar: typeof n.avatar === "string" ? n.avatar : undefined,
        _id:
          typeof n._id === "string"
            ? n._id
            : typeof n.id === "string"
            ? n.id
            : "",
      };
      dispatch(addNotification(normalized));
    },
    [dispatch]
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    notificationDetail,
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    getNotificationDetail,
    clearDetail,
    clearError,
    addNotificationRealtime,
    clearNotifications: clearAllNotifications,
  };
};
