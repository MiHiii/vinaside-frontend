import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { BookingData } from '@/types/booking';
import { Booking } from '@/types/booking.interface';
import { BookingStatus, PaymentStatus } from '@/types/enum';
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

export interface SelectedService {
  service_id: string;
  service_name: string;
  service_price: number;
  quantity: number;
  total_price: number;
}

export interface BookingDetail {
  _id: string;
  guest_name: string;
  guest_email: string;
  propertyId: string;
  property_name: string;
  listingId: string;
  listing_title: string;
  listing_images: string[];
  checkInDate: string;
  check_out_date: string;
  guests: number;
  infants: number;
  nights: number;
  final_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  additionalCost: number;
}

export interface BookingStatistics {
  totalBookings?: number;
  totalRevenue?: number;
  totalNights?: number;
  averageOccupancyRate?: number;
  averageBookingValue?: number;
  totalGuests?: number;
  totalInfants?: number;
  totalVouchersUsed?: number;
  totalVoucherDiscount?: number;
  averageVoucherDiscount?: number;
  voucherUsageRate?: number;
  totalVoucherDiscountPercent?: number;
  averageVoucherDiscountPercent?: number;
  totalServicesRevenue?: number;
  totalServicesBooked?: number;
  averageServicesPerBooking?: number;
  topServicesUsed?: Array<{
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
  }>;
  topVouchersUsed?: Array<{
    voucherCode: string;
    usageCount: number;
    totalDiscount: number;
    averageDiscount: number;
  }>;
  statusBreakdown?: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    rejected: number;
    confirmationRate: number;
    cancellationRate: number;
  };
  paymentStatusBreakdown?: {
    unpaid: number;
    partially_paid: number;
    paid: number;
    refunding: number;
    refunded: number;
    failed: number;
  };
  chartData?: Array<{
    label: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }>;
  bookingDetails?: BookingDetail[];
  [key: string]: any;
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
  adminBookings: Booking[];
  adminTotal: number;
  adminBookingDetail: Booking | null;
  selectedServices: SelectedService[];
  bookingsByListing?: Booking[];
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
  adminBookings: [],
  adminTotal: 0,
  adminBookingDetail: null,
  selectedServices: [],
  bookingsByListing: [],
};

// Async thunk để tạo booking
export const createBooking = createAsyncThunk(
  'booking/createBooking',
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
    specialRequests?: string;
    voucherCode?: string;
    selected_services?: Array<{
      service_id: string;
      service_name: string;
      service_price: number;
      quantity: number;
      total_price: number;
    }>;
    services_total_amount?: number;
  }) => {
    const response = await api.post('/bookings', bookingData);
    return response.data?.data;
  },
);

// Async thunk để cập nhật booking
export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
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
    const response = await api.patch(`/bookings/property/${propertyId}/${bookingId}`, updateData);
    return response.data?.data;
  },
);

// Async thunk để cập nhật chi phí phát sinh cho booking
export const updateAdditionalCost = createAsyncThunk(
  'booking/updateAdditionalCost',
  async (
    {
      propertyId,
      bookingId,
      additionalCost,
      additionalCostReason,
    }: {
      propertyId: string;
      bookingId: string;
      additionalCost: number;
      additionalCostReason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/bookings/${propertyId}/${bookingId}/additional-cost`, {
        additionalCost,
        additionalCostReason,
      });

      // Handle different possible response structures
      let responseData = response.data;

      // If response has a data property, use it
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        responseData = response.data.data;
      }

      // If responseData is still the full response object, try to extract the booking data
      if (responseData && typeof responseData === 'object' && !responseData._id) {
        // Look for booking data in the response
        if (responseData.booking) {
          responseData = responseData.booking;
        } else if (responseData.result) {
          responseData = responseData.result;
        } else if (responseData.data) {
          responseData = responseData.data;
        }
      }

      if (!responseData) {
        return rejectWithValue('Không có dữ liệu trả về từ server');
      }

      // Ensure we have the required fields
      if (!responseData._id) {
        return rejectWithValue('Dữ liệu trả về không hợp lệ - thiếu _id');
      }

      // Ensure we have the additionalCost field
      if (typeof responseData.additionalCost === 'undefined') {
        responseData.additionalCost = additionalCost;
      }

      if (typeof responseData.additionalCostReason === 'undefined') {
        responseData.additionalCostReason = additionalCostReason;
      }

      return responseData;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        const errorMessage = axiosErr.response?.data
          ? typeof axiosErr.response.data === 'string'
            ? axiosErr.response.data
            : JSON.stringify(axiosErr.response.data)
          : 'Unknown error';
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Lỗi khi cập nhật chi phí phát sinh');
    }
  },
);

// Lấy lịch sử booking của chính user (lịch sử đã trả, đã hủy, đã hoàn thành)
export const getMyBookingHistory = createAsyncThunk<BookingData[], Record<string, unknown> | undefined>(
  'booking/getMyBookingHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/my-history', { params });
      const bookings = (Array.isArray(response.data?.data?.bookings) ? response.data.data.bookings : []).map(
        (b: RawBooking) => ({
          ...b,
          check_out_date: b.check_out_date,
        }),
      );
      return bookings;
    } catch (error) {
      return rejectWithValue('Lỗi khi lấy lịch sử booking của tôi');
    }
  },
);

// Lấy các booking hiện tại/sắp tới của user (my-bookings)
export const getMyBookings = createAsyncThunk<BookingData[], Record<string, unknown> | undefined>(
  'booking/getMyBookings',
  async (params) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
);

// Thống kê tổng quan booking
export const fetchBookingStatisticsOverview = createAsyncThunk<
  BookingStatistics,
  {
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    propertyId?: string;
  } | void,
  { rejectValue: string }
>('booking/fetchBookingStatisticsOverview', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/statistics/overview', {
      params,
    });
    return res.data.data;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
    }
    return rejectWithValue('Unknown error');
  }
});

// ADMIN BOOKING THUNKS
export const fetchAdminBookings = createAsyncThunk<
  { data: Booking[]; total: number },
  { status?: BookingStatus; paymentStatus?: PaymentStatus | 'unpaid' } & Record<string, unknown>,
  { rejectValue: string }
>('booking/adminFetchBookings', async (params, { rejectWithValue }) => {
  try {
    // Đảm bảo status và paymentStatus là đúng enum (chữ thường)
    const queryParams = { ...params };
    if (queryParams.status && !Object.values(BookingStatus).includes(queryParams.status as BookingStatus)) {
      queryParams.status = undefined;
    }
    if (
      queryParams.paymentStatus &&
      ![...Object.values(PaymentStatus), 'unpaid'].includes(queryParams.paymentStatus as PaymentStatus)
    ) {
      queryParams.paymentStatus = undefined;
    }
    const res = await api.get('/bookings', { params: queryParams });

    return res.data.data;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
    }
    return rejectWithValue('Unknown error');
  }
});

// Staff bookings thunk
export const fetchStaffBookings = createAsyncThunk<
  { data: Booking[]; total: number },
  { status?: BookingStatus; paymentStatus?: PaymentStatus | 'unpaid' } & Record<string, unknown>,
  { rejectValue: string }
>('booking/staffFetchBookings', async (params, { rejectWithValue }) => {
  try {
    // Đảm bảo status và paymentStatus là đúng enum (chữ thường)
    const queryParams = { ...params };
    if (queryParams.status && !Object.values(BookingStatus).includes(queryParams.status as BookingStatus)) {
      queryParams.status = undefined;
    }
    if (
      queryParams.paymentStatus &&
      ![...Object.values(PaymentStatus), 'unpaid'].includes(queryParams.paymentStatus as PaymentStatus)
    ) {
      queryParams.paymentStatus = undefined;
    }
    // Sử dụng cùng endpoint với Admin để lấy danh sách + bộ lọc
    const res = await api.get('/bookings', { params: queryParams });

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy danh sách bookings');
  }
});

export const fetchAdminBookingDetail = createAsyncThunk<
  Booking,
  { propertyId: string; id: string },
  { rejectValue: string }
>('booking/adminFetchBookingDetail', async ({ propertyId, id }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/property/${propertyId}/${id}`);

    return res.data.data;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
    }
    return rejectWithValue('Unknown error');
  }
});

export const updateAdminBookingStatus = createAsyncThunk<
  Booking,
  { propertyId: string; id: string; data: Partial<Booking> },
  { rejectValue: string }
>('booking/adminUpdateBookingStatus', async ({ propertyId, id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/bookings/property/${propertyId}/${id}`, data);
    return res.data;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
    }
    return rejectWithValue('Unknown error');
  }
});

export const deleteAdminBooking = createAsyncThunk<string, { propertyId: string; id: string }, { rejectValue: string }>(
  'booking/adminDeleteBooking',
  async ({ propertyId, id }, { rejectWithValue }) => {
    try {
      await api.delete(`/bookings/property/${propertyId}/${id}`);
      return id;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  },
);

export const confirmAdminBooking = createAsyncThunk<
  Booking,
  { propertyId: string; id: string },
  { rejectValue: string }
>('booking/adminConfirmBooking', async ({ propertyId, id }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/bookings/property/${propertyId}/${id}/confirm`);
    return res.data;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
    }
    return rejectWithValue('Unknown error');
  }
});

export const completeAdminBooking = createAsyncThunk<
  Booking,
  { propertyId: string; id: string },
  { rejectValue: string }
>('booking/adminCompleteBooking', async ({ propertyId, id }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/bookings/property/${propertyId}/${id}`, {
      status: 'completed',
    });
    return res.data;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Unknown error');
    }
    return rejectWithValue('Unknown error');
  }
});

// Lấy danh sách booking của một listing cụ thể (admin)
export const fetchBookingsByListing = createAsyncThunk<
  Booking[],
  { propertyId: string; listingId: string },
  { rejectValue: string }
>('booking/fetchBookingsByListing', async ({ propertyId, listingId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/property/${propertyId}/listing/${listingId}`);
    return Array.isArray(res.data.data?.bookings) ? res.data.data.bookings : [];
  } catch {
    return rejectWithValue('Lỗi khi lấy danh sách booking của listing');
  }
});

// Tạo payment cho booking
export const createPayment = createAsyncThunk<
  { paymentUrl: string; orderId: string; amount: number; message: string },
  {
    bookingId: string;
    paymentMethod: string;
    paymentType?: 'full' | 'deposit';
    notifyUrl?: string;
  },
  { rejectValue: string }
>('booking/createPayment', async ({ bookingId, paymentMethod, paymentType, notifyUrl }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/payment`, {
      paymentMethod,
      paymentType,
      notifyUrl,
    });
    return res.data.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message || 'Lỗi khi tạo thanh toán');
    }
    return rejectWithValue('Lỗi khi tạo thanh toán');
  }
});

// Lấy danh sách phương thức thanh toán được hỗ trợ
export const fetchSupportedPaymentMethods = createAsyncThunk<
  { supportedMethods: string[]; default: string },
  void,
  { rejectValue: string }
>('booking/fetchSupportedPaymentMethods', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/payment/supported-methods');
    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message || 'Lỗi khi lấy phương thức thanh toán');
    }
    return rejectWithValue('Lỗi khi lấy phương thức thanh toán');
  }
});

// Export bookings CSV
export const exportBookingsCsv = createAsyncThunk<
  { blobUrl: string },
  Record<string, unknown> | void,
  { rejectValue: string }
>('booking/exportCsv', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/bookings/export/csv', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl };
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: unknown } };
      return rejectWithValue((axiosErr.response?.data as string) || 'Không thể xuất báo cáo CSV');
    }
    return rejectWithValue('Không thể xuất báo cáo CSV');
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
>('booking/fetchPaymentStatus', async ({ bookingId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/${bookingId}/payment/status`);
    return res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return rejectWithValue(err.message || 'Lỗi khi kiểm tra trạng thái thanh toán');
    }
    return rejectWithValue('Lỗi khi kiểm tra trạng thái thanh toán');
  }
});

// Thêm interface cho payment data
interface CreatePaymentDto {
  paymentMethod: string;
  amount?: number;
  note?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

interface PaymentResponseDto {
  success: boolean;
  paymentMethod: string;
  paymentUrl?: string;
  orderId: string;
  amount: number;
  message: string;
  expiresAt: string;
  createdAt: string;
}

// Thêm async thunk cho staff remaining payment
export const createStaffRemainingPayment = createAsyncThunk(
  'booking/createStaffRemainingPayment',
  async ({
    propertyId,
    bookingId,
    paymentData,
  }: {
    propertyId: string;
    bookingId: string;
    paymentData: CreatePaymentDto;
  }) => {
    const response = await api.post<PaymentResponseDto>(
      `/bookings/${propertyId}/${bookingId}/payment/remaining/staff`,
      paymentData,
    );
    return response.data;
  },
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingState: (state) => {
      state.bookingData = null;
      state.error = null;
      state.selectedServices = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedServices: (state, action) => {
      state.selectedServices = action.payload;
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
        state.error = action.error.message || 'Lỗi khi tạo booking';
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
        state.error = action.error.message || 'Lỗi khi cập nhật booking';
      })
      // Cập nhật chi phí phát sinh cho booking
      .addCase(updateAdditionalCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdditionalCost.fulfilled, (state, action) => {
        state.loading = false;

        if (!action.payload) {
          state.error = 'Không có dữ liệu trả về từ server';
          return;
        }

        // Ensure we have the required _id field
        if (!action.payload._id) {
          state.error = 'Dữ liệu trả về không hợp lệ';
          return;
        }

        // Cập nhật booking detail nếu đang xem chi tiết booking
        if (state.adminBookingDetail && state.adminBookingDetail._id === action.payload._id) {
          const updatedBooking = {
            ...state.adminBookingDetail,
            ...action.payload,
            additionalCost:
              action.payload.additionalCost !== undefined
                ? action.payload.additionalCost
                : state.adminBookingDetail.additionalCost,
            additionalCostReason:
              action.payload.additionalCostReason !== undefined
                ? action.payload.additionalCostReason
                : state.adminBookingDetail.additionalCostReason,
            final_amount: action.payload.final_amount || state.adminBookingDetail.final_amount,
          };
          state.adminBookingDetail = updatedBooking;
        }
        if (state.bookingDetail && state.bookingDetail._id === action.payload._id) {
          const updatedBooking = {
            ...state.bookingDetail,
            ...action.payload,
            additionalCost:
              action.payload.additionalCost !== undefined
                ? action.payload.additionalCost
                : state.bookingDetail.additionalCost,
            additionalCostReason:
              action.payload.additionalCostReason !== undefined
                ? action.payload.additionalCostReason
                : state.bookingDetail.additionalCostReason,
            final_amount: action.payload.final_amount || state.bookingDetail.final_amount,
          };
          state.bookingDetail = updatedBooking;
        }
        // Cập nhật trong danh sách bookings nếu có
        state.adminBookings = state.adminBookings.map((booking) =>
          booking._id === action.payload._id
            ? {
                ...booking,
                ...action.payload,
                additionalCost:
                  action.payload.additionalCost !== undefined ? action.payload.additionalCost : booking.additionalCost,
                additionalCostReason:
                  action.payload.additionalCostReason !== undefined
                    ? action.payload.additionalCostReason
                    : booking.additionalCostReason,
                final_amount: action.payload.final_amount || booking.final_amount,
              }
            : booking,
        );
        state.staffBookings = state.staffBookings.map((booking) =>
          booking._id === action.payload._id
            ? {
                ...booking,
                ...action.payload,
                additionalCost:
                  action.payload.additionalCost !== undefined ? action.payload.additionalCost : booking.additionalCost,
                additionalCostReason:
                  action.payload.additionalCostReason !== undefined
                    ? action.payload.additionalCostReason
                    : booking.additionalCostReason,
                final_amount: action.payload.final_amount || booking.final_amount,
              }
            : booking,
        );
      })
      .addCase(updateAdditionalCost.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Lỗi khi cập nhật chi phí phát sinh';
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
        state.error = action.error.message || 'Lỗi khi lấy lịch sử booking của tôi';
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

      // Xoá booking

      // ADMIN: Danh sách booking
      .addCase(fetchAdminBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBookings = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.adminTotal = action.payload.total || 0;
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })
      // STAFF: Danh sách booking
      .addCase(fetchStaffBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.staffBookings = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.adminTotal = action.payload.total || 0;
      })
      .addCase(fetchStaffBookings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })
      // ADMIN: Chi tiết booking
      .addCase(fetchAdminBookingDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookingDetail.fulfilled, (state, action) => {
        state.loading = false;
        // Merge state thay vì thay thế hoàn toàn để giữ lại additionalCost
        if (state.adminBookingDetail && action.payload) {
          state.adminBookingDetail = {
            ...state.adminBookingDetail,
            ...action.payload,
            // Giữ lại additionalCost nếu payload không có hoặc là null/undefined
            additionalCost:
              action.payload.additionalCost !== null && action.payload.additionalCost !== undefined
                ? action.payload.additionalCost
                : state.adminBookingDetail.additionalCost,
            additionalCostReason:
              action.payload.additionalCostReason !== null && action.payload.additionalCostReason !== undefined
                ? action.payload.additionalCostReason
                : state.adminBookingDetail.additionalCostReason,
          };
        } else {
          state.adminBookingDetail = action.payload;
        }
      })
      .addCase(fetchAdminBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })
      // ADMIN: Cập nhật trạng thái
      .addCase(updateAdminBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Merge state thay vì thay thế hoàn toàn để giữ lại additionalCost
        if (state.adminBookingDetail && action.payload) {
          state.adminBookingDetail = {
            ...state.adminBookingDetail,
            ...action.payload,
            // Giữ lại additionalCost nếu payload không có hoặc là null/undefined
            additionalCost:
              action.payload.additionalCost !== null && action.payload.additionalCost !== undefined
                ? action.payload.additionalCost
                : state.adminBookingDetail.additionalCost,
            additionalCostReason:
              action.payload.additionalCostReason !== null && action.payload.additionalCostReason !== undefined
                ? action.payload.additionalCostReason
                : state.adminBookingDetail.additionalCostReason,
          };
        } else {
          state.adminBookingDetail = action.payload;
        }
      })
      .addCase(updateAdminBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })
      // ADMIN: Xóa booking
      .addCase(deleteAdminBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBookings = state.adminBookings.map((b) => (b._id === action.payload ? { ...b, deleted: true } : b));
      })
      .addCase(deleteAdminBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })

      // ADMIN: Xác nhận booking
      .addCase(confirmAdminBooking.fulfilled, (state, action) => {
        // Merge state thay vì thay thế hoàn toàn để giữ lại additionalCost
        if (state.adminBookingDetail && action.payload) {
          state.adminBookingDetail = {
            ...state.adminBookingDetail,
            ...action.payload,
            // Giữ lại additionalCost nếu payload không có hoặc là null/undefined
            additionalCost:
              action.payload.additionalCost !== null && action.payload.additionalCost !== undefined
                ? action.payload.additionalCost
                : state.adminBookingDetail.additionalCost,
            additionalCostReason:
              action.payload.additionalCostReason !== null && action.payload.additionalCostReason !== undefined
                ? action.payload.additionalCostReason
                : state.adminBookingDetail.additionalCostReason,
          };
        } else {
          state.adminBookingDetail = action.payload;
        }
      })
      .addCase(confirmAdminBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })
      // ADMIN: Hoàn thành booking
      .addCase(completeAdminBooking.fulfilled, (state, action) => {
        // Merge state thay vì thay thế hoàn toàn để giữ lại additionalCost
        if (state.adminBookingDetail && action.payload) {
          state.adminBookingDetail = {
            ...state.adminBookingDetail,
            ...action.payload,
            // Giữ lại additionalCost nếu payload không có hoặc là null/undefined
            additionalCost:
              action.payload.additionalCost !== null && action.payload.additionalCost !== undefined
                ? action.payload.additionalCost
                : state.adminBookingDetail.additionalCost,
            additionalCostReason:
              action.payload.additionalCostReason !== null && action.payload.additionalCostReason !== undefined
                ? action.payload.additionalCostReason
                : state.adminBookingDetail.additionalCostReason,
          };
        } else {
          state.adminBookingDetail = action.payload;
        }
      })
      .addCase(completeAdminBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : typeof action.payload === 'object' && action.payload && 'error' in action.payload
            ? (action.payload as { error?: string }).error ?? 'Đã xảy ra lỗi'
            : JSON.stringify(action.payload) || 'Đã xảy ra lỗi';
      })
      // Lấy danh sách booking của một listing cụ thể
      .addCase(fetchBookingsByListing.fulfilled, (state, action) => {
        state.bookingsByListing = action.payload;
      })
      // Staff remaining payment
      .addCase(createStaffRemainingPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaffRemainingPayment.fulfilled, (state) => {
        state.loading = false;
        // Có thể cập nhật booking data nếu cần
      })
      .addCase(createStaffRemainingPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Thanh toán thất bại';
      })
      .addCase(exportBookingsCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportBookingsCsv.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportBookingsCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingState, setError, clearError, setSelectedServices } = bookingSlice.actions;
export default bookingSlice.reducer;
