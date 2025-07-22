import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import notificationService, {
  Notification,
  NotificationQuery,
} from "@/services/notification.service";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  notificationDetail?: Notification | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  notificationDetail: null,
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_: NotificationQuery | undefined, { rejectWithValue }) => {
    try {
      const data = await notificationService.getNotifications(_);
      return data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || "Lỗi tải thông báo");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationService.getUnreadCount();
      return data; // trả về đúng số từ service
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Lỗi tải số lượng thông báo chưa đọc"
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || "Lỗi đánh dấu đã đọc");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Lỗi đánh dấu tất cả đã đọc"
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || "Lỗi xóa thông báo");
    }
  }
);

export const fetchNotificationDetail = createAsyncThunk(
  "notification/fetchNotificationDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await notificationService.getNotificationDetail(id);
      return data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Lỗi tải chi tiết thông báo"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationDetail(state) {
      state.notificationDetail = null;
    },
    clearNotificationError(state) {
      state.error = null;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      })
      .addCase(fetchNotificationDetail.fulfilled, (state, action) => {
        state.notificationDetail = action.payload;
      });
  },
});

export const {
  clearNotificationDetail,
  clearNotificationError,
  addNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
