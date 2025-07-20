import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { BookingData } from "@/types/booking";
import { Booking } from "@/types/booking.interface";
import { BookingStatus, PaymentStatus } from "@/types/enum";
// Thêm type RawBooking để hỗ trợ dữ liệu trả về từ API có thể có check_out_date
export type RawBooking = BookingData & { check_out_date?: string };

// Định nghĩa type tạm thời cho Booking và Statistics
export interface User {
  _id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface Property {
  _id: string;
  name?: string;
  address?: string;
  [key: string]: unknown;
}

export interface BookingStatistics {
  total?: number;
  revenue?: number;
  customers?: number;
  [key: string]: number | undefined;
}

interface BookingState {
  bookingData: BookingData | null;
  loading: boolean;
  error: string | null;
  myBookingHistory: BookingData[];
  guestBookingHistory: BookingData[];
  allBookings: Booking[];
  guestBookings: Booking[];
  staffBookings: Booking[];
  bookingDetail: Booking | null;
  statisticsOverview: BookingStatistics | null;
  statisticsFinancial: BookingStatistics | null;
  statisticsCustomers: BookingStatistics | null;
  adminBookings: Booking[];
  adminTotal: number;
  adminBookingDetail: Booking | null;
}

const initialState: BookingState = {
  bookingData: null,
  loading: false,
  error: null,
  myBookingHistory: [],
  guestBookingHistory: [],
  allBookings: [],
  guestBookings: [],
  staffBookings: [],
  bookingDetail: null,
  statisticsOverview: null,
  statisticsFinancial: null,
  statisticsCustomers: null,
  adminBookings: [],
  adminTotal: 0,
  adminBookingDetail: null,
};

// Async thunk để tạo booking
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData: {
    listingId: string;
    propertyId: string;
    price_per_night: number;
    total_price: number;
    final_amount: number;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    infants: number;
    guest_name: string;
    guest_email: string;
  }) => {
    const response = await api.post("/bookings", bookingData);
    return response.data?.data;
  }
);

// Async thunk để cập nhật booking
export const updateBooking = createAsyncThunk(
  "booking/updateBooking",
  async ({
    propertyId,
    bookingId,
    updateData,
  }: {
    propertyId: string;
    bookingId: string;
    updateData: {
      check_in_date?: Date;
      check_out_date?: Date;
      guests?: number;
      infants?: number;
    };
  }) => {
    const response = await api.patch(
      `/bookings/property/${propertyId}/${bookingId}`,
      updateData
    );
    return response.data?.data;
  }
);

// Lấy lịch sử booking của chính user (lịch sử đã trả, đã hủy, đã hoàn thành)
export const getMyBookingHistory = createAsyncThunk<
  BookingData[],
  Record<string, unknown> | undefined
>("booking/getMyBookingHistory", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/bookings/my-history", { params });
    const bookings = (
      Array.isArray(response.data?.data?.bookings)
        ? response.data.data.bookings
        : []
    ).map((b: RawBooking) => ({
      ...b,
      check_out_date: b.check_out_date,
    }));
    return bookings;
  } catch (error) {
    console.log(error);
    return rejectWithValue("Lỗi khi lấy lịch sử booking của tôi");
  }
});

// Lấy các booking hiện tại/sắp tới của user (my-bookings)
export const getMyBookings = createAsyncThunk<
  BookingData[],
  Record<string, unknown> | undefined
>("booking/getMyBookings", async (params) => {
  const response = await api.get("/bookings/my-bookings", { params });
  return Array.isArray(response.data?.data) ? response.data.data : [];
});

// Thunk khôi phục booking
export const restoreBooking = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>("booking/restoreBooking", async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/bookings/${id}/restore`);
    return res.data.data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue(
        (axiosErr.response?.data as string) || "Unknown error"
      );
    }
    return rejectWithValue("Unknown error");
  }
});

// Thống kê tổng quan booking
export const fetchBookingStatisticsOverview = createAsyncThunk<
  BookingStatistics,
  { startDate?: string; endDate?: string } | void,
  { rejectValue: string }
>(
  "booking/fetchBookingStatisticsOverview",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/bookings/statistics/overview", {
        params,
      });
      return res.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue(
          (axiosErr.response?.data as string) || "Unknown error"
        );
      }
      return rejectWithValue("Unknown error");
    }
  }
);

// Thống kê tài chính booking
export const fetchBookingStatisticsFinancial = createAsyncThunk<
  BookingStatistics,
  { startDate?: string; endDate?: string } | void,
  { rejectValue: string }
>(
  "booking/fetchBookingStatisticsFinancial",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/bookings/statistics/financial", {
        params,
      });
      return res.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue(
          (axiosErr.response?.data as string) || "Unknown error"
        );
      }
      return rejectWithValue("Unknown error");
    }
  }
);

// Thống kê khách hàng booking
export const fetchBookingStatisticsCustomers = createAsyncThunk<
  BookingStatistics,
  { startDate?: string; endDate?: string } | void,
  { rejectValue: string }
>(
  "booking/fetchBookingStatisticsCustomers",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/bookings/statistics/customers", {
        params,
      });
      return res.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue(
          (axiosErr.response?.data as string) || "Unknown error"
        );
      }
      return rejectWithValue("Unknown error");
    }
  }
);

// ADMIN BOOKING THUNKS
export const fetchAdminBookings = createAsyncThunk<
  { data: Booking[]; total: number },
  { status?: BookingStatus; paymentStatus?: PaymentStatus } & Record<
    string,
    unknown
  >,
  { rejectValue: string }
>("booking/adminFetchBookings", async (params, { rejectWithValue }) => {
  try {
    // Đảm bảo status và paymentStatus là đúng enum (chữ thường)
    const queryParams = { ...params };
    if (
      queryParams.status &&
      !Object.values(BookingStatus).includes(
        queryParams.status as BookingStatus
      )
    ) {
      queryParams.status = undefined;
    }
    if (
      queryParams.paymentStatus &&
      !Object.values(PaymentStatus).includes(
        queryParams.paymentStatus as PaymentStatus
      )
    ) {
      queryParams.paymentStatus = undefined;
    }
    const res = await api.get("/bookings", { params: queryParams });
    console.log("sdsdsdsds : ", res.data.data);

    return res.data.data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue(
        (axiosErr.response?.data as string) || "Unknown error"
      );
    }
    return rejectWithValue("Unknown error");
  }
});

export const fetchAdminBookingDetail = createAsyncThunk<
  Booking,
  { propertyId: string; id: string },
  { rejectValue: string }
>(
  "booking/adminFetchBookingDetail",
  async ({ propertyId, id }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bookings/property/${propertyId}/${id}`);
      console.log("fdfdfdfdf : ", res.data.data);

      return res.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue(
          (axiosErr.response?.data as string) || "Unknown error"
        );
      }
      return rejectWithValue("Unknown error");
    }
  }
);

export const updateAdminBookingStatus = createAsyncThunk<
  Booking,
  { propertyId: string; id: string; data: Partial<Booking> },
  { rejectValue: string }
>(
  "booking/adminUpdateBookingStatus",
  async ({ propertyId, id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/bookings/property/${propertyId}/${id}`,
        data
      );
      return res.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue(
          (axiosErr.response?.data as string) || "Unknown error"
        );
      }
      return rejectWithValue("Unknown error");
    }
  }
);

export const deleteAdminBooking = createAsyncThunk<
  string,
  { propertyId: string; id: string },
  { rejectValue: string }
>(
  "booking/adminDeleteBooking",
  async ({ propertyId, id }, { rejectWithValue }) => {
    try {
      await api.delete(`/bookings/property/${propertyId}/${id}`);
      return id;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue(
          (axiosErr.response?.data as string) || "Unknown error"
        );
      }
      return rejectWithValue("Unknown error");
    }
  }
);

// Tạo payment cho booking
export const createPayment = createAsyncThunk<
  { paymentUrl: string; orderId: string; amount: number; message: string },
  {
    bookingId: string;
    paymentMethod: string;
    notifyUrl?: string;
  },
  { rejectValue: string }
>(
  "booking/createPayment",
  async ({ bookingId, paymentMethod, notifyUrl }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/payment`, {
        paymentMethod,
        notifyUrl,
      });
      return res.data.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || "Lỗi khi tạo thanh toán");
      }
      return rejectWithValue("Lỗi khi tạo thanh toán");
    }
  }
);

// Lấy danh sách phương thức thanh toán được hỗ trợ
export const fetchSupportedPaymentMethods = createAsyncThunk<
  { supportedMethods: string[]; default: string },
  void,
  { rejectValue: string }
>("booking/fetchSupportedPaymentMethods", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/bookings/payment/supported-methods");
    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(
        err.message || "Lỗi khi lấy phương thức thanh toán"
      );
    }
    return rejectWithValue("Lỗi khi lấy phương thức thanh toán");
  }
});

// Kiểm tra trạng thái thanh toán của booking
export const fetchPaymentStatus = createAsyncThunk<
  {
    bookingId: string;
    paymentStatus: string;
    amount: number;
    paymentMethod?: string;
    gatewayTransactionId?: string;
    paidAt?: string;
    gatewayDetails?: Record<string, unknown>;
  },
  { bookingId: string },
  { rejectValue: string }
>("booking/fetchPaymentStatus", async ({ bookingId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/${bookingId}/payment/status`);
    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(
        err.message || "Lỗi khi kiểm tra trạng thái thanh toán"
      );
    }
    return rejectWithValue("Lỗi khi kiểm tra trạng thái thanh toán");
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingState: (state) => {
      state.bookingData = null;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingData = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi tạo booking";
      })
      // Cập nhật booking (user)
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingData = action.payload;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi cập nhật booking";
      })
      // Cập nhật booking (system)

      // Lấy lịch sử booking của chính user
      .addCase(getMyBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookingHistory = action.payload;
      })
      .addCase(getMyBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Lỗi khi lấy lịch sử booking của tôi";
      })

      // Thống kê overview
      .addCase(fetchBookingStatisticsOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingStatisticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.statisticsOverview = action.payload;
      })
      .addCase(fetchBookingStatisticsOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Thống kê financial
      .addCase(fetchBookingStatisticsFinancial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingStatisticsFinancial.fulfilled, (state, action) => {
        state.loading = false;
        state.statisticsFinancial = action.payload;
      })
      .addCase(fetchBookingStatisticsFinancial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Thống kê customers
      .addCase(fetchBookingStatisticsCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingStatisticsCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.statisticsCustomers = action.payload;
      })
      .addCase(fetchBookingStatisticsCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Xoá booking

      // ADMIN: Danh sách booking
      .addCase(fetchAdminBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBookings = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
        state.adminTotal = action.payload.total || 0;
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : typeof action.payload === "object" &&
              action.payload &&
              "error" in action.payload
            ? (action.payload as { error?: string }).error ?? "Đã xảy ra lỗi"
            : JSON.stringify(action.payload) || "Đã xảy ra lỗi";
      })
      // ADMIN: Chi tiết booking
      .addCase(fetchAdminBookingDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookingDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBookingDetail = action.payload;
      })
      .addCase(fetchAdminBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : typeof action.payload === "object" &&
              action.payload &&
              "error" in action.payload
            ? (action.payload as { error?: string }).error ?? "Đã xảy ra lỗi"
            : JSON.stringify(action.payload) || "Đã xảy ra lỗi";
      })
      // ADMIN: Cập nhật trạng thái
      .addCase(updateAdminBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBookingDetail = action.payload;
      })
      .addCase(updateAdminBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : typeof action.payload === "object" &&
              action.payload &&
              "error" in action.payload
            ? (action.payload as { error?: string }).error ?? "Đã xảy ra lỗi"
            : JSON.stringify(action.payload) || "Đã xảy ra lỗi";
      })
      // ADMIN: Xóa booking
      .addCase(deleteAdminBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBookings = state.adminBookings.map((b) =>
          b._id === action.payload ? { ...b, deleted: true } : b
        );
      })
      .addCase(deleteAdminBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : typeof action.payload === "object" &&
              action.payload &&
              "error" in action.payload
            ? (action.payload as { error?: string }).error ?? "Đã xảy ra lỗi"
            : JSON.stringify(action.payload) || "Đã xảy ra lỗi";
      })
      // ADMIN: Khôi phục booking
      .addCase(restoreBooking.fulfilled, (state, action) => {
        state.adminBookings = state.adminBookings.map((b) =>
          b._id === action.payload._id ? { ...b, deleted: false } : b
        );
      });
  },
});

export const { clearBookingState, setError, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
