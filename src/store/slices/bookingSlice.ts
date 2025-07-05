import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { BookingData } from "@/types/booking";


interface BookingState {
  bookingData: BookingData | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookingData: null,
  loading: false,
  error: null,
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

// Async thunk để lấy danh sách booking của user
export const fetchUserBookings = createAsyncThunk(
  "booking/fetchUserBookings",
  async (userId: string) => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data?.data;
  }
);

// Async thunk để lấy chi tiết booking
export const fetchBookingDetail = createAsyncThunk(
  "booking/fetchBookingDetail",
  async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data?.data;
  }
);

// Async thunk để hủy booking
export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId: string) => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data?.data;
  }
);

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
      // Update booking
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
      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state) => {
        state.loading = false;
        // Có thể thêm state để lưu danh sách bookings nếu cần
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi lấy danh sách booking";
      })
      // Fetch booking detail
      .addCase(fetchBookingDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingData = action.payload;
      })
      .addCase(fetchBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi lấy chi tiết booking";
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingData = action.payload;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi hủy booking";
      });
  },
});

export const { clearBookingState, setError, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
