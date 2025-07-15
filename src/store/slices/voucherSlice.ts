import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { voucherApi } from "@/services/voucherApi";
import { Voucher, CreateVoucherDto, UpdateVoucherDto } from "@/types/voucher";

interface VoucherState {
  vouchers: Voucher[];
  voucherDetail: Voucher | null;
  loading: boolean;
  error: string | null;
}

const initialState: VoucherState = {
  vouchers: [],
  voucherDetail: null,
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
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy danh sách voucher");
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
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết voucher");
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
      return rejectWithValue(error.response?.data || { message: "Lỗi tạo voucher" });
    }
  }
);

export const updateVoucher = createAsyncThunk(
  "voucher/updateVoucher",
  async ({ id, dto }: { id: string; dto: UpdateVoucherDto }, { rejectWithValue }) => {
    try {
      const { data } = await voucherApi.update(id, dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data || { message: "Lỗi cập nhật voucher" });
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
      return rejectWithValue(error.response?.data?.message || "Lỗi xóa voucher");
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
      return rejectWithValue(error.response?.data?.message || "Lỗi khôi phục voucher");
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
      return rejectWithValue(error.response?.data?.message || "Lỗi đổi trạng thái voucher");
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action: PayloadAction<Voucher[]>) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVoucherDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVoucherDetail.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.loading = false;
        state.voucherDetail = action.payload;
      })
      .addCase(fetchVoucherDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.vouchers.unshift(action.payload);
      })
      .addCase(updateVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.vouchers = state.vouchers.map(v =>
          v._id === action.payload._id ? action.payload : v
        );
        if (state.voucherDetail && state.voucherDetail._id === action.payload._id) {
          state.voucherDetail = action.payload;
        }
      })
      .addCase(removeVoucher.fulfilled, (state, action: PayloadAction<string>) => {
        state.vouchers = state.vouchers.filter(v => v._id !== action.payload);
      })
      .addCase(restoreVoucher.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.vouchers = state.vouchers.map(v =>
          v._id === action.payload._id ? action.payload : v
        );
      })
      .addCase(toggleVoucherStatus.fulfilled, (state, action: PayloadAction<Voucher>) => {
        state.vouchers = state.vouchers.map(v =>
          v._id === action.payload._id ? action.payload : v
        );
      });
  },
});

export const { clearVoucherError, clearVoucherDetail } = voucherSlice.actions;
export default voucherSlice.reducer; 