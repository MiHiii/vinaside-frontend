import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { voucherApi } from "@/services/voucherApi";
import { Voucher, CreateVoucherDto, UpdateVoucherDto } from "@/types/voucher";

// Interfaces for VoucherUsagePage
interface VoucherUsageData {
  _id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  uses_count: number;
  max_uses_per_user: number;
  expiration_date: string;
  is_active: boolean;
  description: string;
  min_order_value: number;
  created_at: string;
  updated_at: string;
}

interface VoucherBookingData {
  _id: string;
  propertyId: string;
  listingId: string;
  checkInDate: string;
  guest_name: string;
  guest_email: string;
  voucher_discount_amount: number;
  nights: number;
  final_price: number;
  created_at: string;
  property_name: string;
  listing_title: string;
  booking_status: string;
}

interface VoucherState {
  vouchers: Voucher[];
  voucherDetail: Voucher | null;
  voucherUsage: VoucherUsageData | null;
  voucherBookings: VoucherBookingData[];
  loading: boolean;
  error: string | null;
}

const initialState: VoucherState = {
  vouchers: [],
  voucherDetail: null,
  voucherUsage: null,
  voucherBookings: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchVouchers = createAsyncThunk(
  "voucher/fetchVouchers",
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const { data } = await voucherApi.getAll(params);
      return data.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách voucher"
      );
    }
  }
);

export const fetchVoucherDetail = createAsyncThunk(
  "voucher/fetchVoucherDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await voucherApi.getById(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy chi tiết voucher"
      );
    }
  }
);

export const createVoucher = createAsyncThunk(
  "voucher/createVoucher",
  async (dto: CreateVoucherDto, { rejectWithValue }) => {
    try {
      const { data } = await voucherApi.create(dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data || { message: "Lỗi tạo voucher" }
      );
    }
  }
);

export const updateVoucher = createAsyncThunk(
  "voucher/updateVoucher",
  async (
    { id, dto }: { id: string; dto: UpdateVoucherDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await voucherApi.update(id, dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data || { message: "Lỗi cập nhật voucher" }
      );
    }
  }
);

export const removeVoucher = createAsyncThunk(
  "voucher/removeVoucher",
  async (id: string, { rejectWithValue }) => {
    try {
      await voucherApi.remove(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi xóa voucher"
      );
    }
  }
);

export const restoreVoucher = createAsyncThunk(
  "voucher/restoreVoucher",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await voucherApi.restore(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khôi phục voucher"
      );
    }
  }
);

export const toggleVoucherStatus = createAsyncThunk(
  "voucher/toggleVoucherStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await voucherApi.toggleStatus(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi đổi trạng thái voucher"
      );
    }
  }
);

// Async thunks for VoucherUsagePage
export const fetchVoucherUsage = createAsyncThunk(
  "voucher/fetchVoucherUsage",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("fetchVoucherUsage - Calling API with ID:", id);
      const { data } = await voucherApi.getById(id);
      console.log("fetchVoucherUsage - API response:", data);
      return data.data;
    } catch (err: unknown) {
      console.error("fetchVoucherUsage - API error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy thông tin voucher"
      );
    }
  }
);

export const fetchVoucherBookings = createAsyncThunk(
  "voucher/fetchVoucherBookings",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("fetchVoucherBookings - Calling API with ID:", id);
      const { data } = await voucherApi.getBookings(id);
      console.log("fetchVoucherBookings - API response:", data);
      // API response có cấu trúc: { success: true, data: { data: [...], total: 1, ... } }
      return data.data?.data || [];
    } catch (err: unknown) {
      console.error("fetchVoucherBookings - API error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách booking"
      );
    }
  }
);

// Slice
const voucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {
    clearVoucherError(state) {
      state.error = null;
    },
    clearVoucherDetail(state) {
      state.voucherDetail = null;
    },
    clearVoucherUsage(state) {
      state.voucherUsage = null;
      state.voucherBookings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVouchers.fulfilled,
        (state, action: PayloadAction<Voucher[]>) => {
          state.loading = false;
          state.vouchers = action.payload;
        }
      )
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVoucherDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVoucherDetail.fulfilled,
        (state, action: PayloadAction<Voucher>) => {
          state.loading = false;
          state.voucherDetail = action.payload;
        }
      )
      .addCase(fetchVoucherDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        createVoucher.fulfilled,
        (state, action: PayloadAction<Voucher>) => {
          state.vouchers.unshift(action.payload);
        }
      )
      .addCase(
        updateVoucher.fulfilled,
        (state, action: PayloadAction<Voucher>) => {
          state.vouchers = state.vouchers.map((v) =>
            v._id === action.payload._id ? action.payload : v
          );
          if (
            state.voucherDetail &&
            state.voucherDetail._id === action.payload._id
          ) {
            state.voucherDetail = action.payload;
          }
        }
      )
      .addCase(
        removeVoucher.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.vouchers = state.vouchers.filter(
            (v) => v._id !== action.payload
          );
        }
      )
      .addCase(
        restoreVoucher.fulfilled,
        (state, action: PayloadAction<Voucher>) => {
          state.vouchers = state.vouchers.map((v) =>
            v._id === action.payload._id ? action.payload : v
          );
        }
      )
      .addCase(
        toggleVoucherStatus.fulfilled,
        (state, action: PayloadAction<Voucher>) => {
          state.vouchers = state.vouchers.map((v) =>
            v._id === action.payload._id ? action.payload : v
          );
        }
      )
      // fetchVoucherUsage
      .addCase(fetchVoucherUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVoucherUsage.fulfilled,
        (state, action: PayloadAction<VoucherUsageData>) => {
          state.loading = false;
          state.voucherUsage = action.payload;
        }
      )
      .addCase(fetchVoucherUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchVoucherBookings
      .addCase(fetchVoucherBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.voucherBookings = [];
      })
      .addCase(
        fetchVoucherBookings.fulfilled,
        (state, action: PayloadAction<VoucherBookingData[]>) => {
          state.loading = false;
          state.voucherBookings = action.payload || [];
        }
      )
      .addCase(fetchVoucherBookings.rejected, (state, action) => {
        state.loading = false;
        state.voucherBookings = [];
        state.error = action.payload as string;
      });
  },
});

export const { clearVoucherError, clearVoucherDetail, clearVoucherUsage } =
  voucherSlice.actions;
export default voucherSlice.reducer;
