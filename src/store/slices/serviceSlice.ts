import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { serviceApi } from "@/services/serviceApi";
import { Service, CreateServiceDto, UpdateServiceDto } from "@/types/services";

interface ServiceState {
  services: Service[];
  serviceDetail: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  serviceDetail: null,
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  "service/fetchServices",
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.getAll(params);
      return data.data.services;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy danh sách dịch vụ");
    }
  }
);

export const fetchServiceDetail = createAsyncThunk(
  "service/fetchServiceDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.getById(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết dịch vụ");
    }
  }
);

export const createService = createAsyncThunk(
  "service/createService",
  async (dto: CreateServiceDto, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.create(dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi tạo dịch vụ");
    }
  }
);

export const updateService = createAsyncThunk(
  "service/updateService",
  async ({ id, dto }: { id: string; dto: UpdateServiceDto }, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.update(id, dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật dịch vụ");
    }
  }
);

export const removeService = createAsyncThunk(
  "service/removeService",
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceApi.remove(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi xóa dịch vụ");
    }
  }
);

export const restoreService = createAsyncThunk(
  "service/restoreService",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.restore(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi khôi phục dịch vụ");
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  "service/toggleServiceStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.toggleStatus(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi đổi trạng thái dịch vụ");
    }
  }
);

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    clearServiceError(state) {
      state.error = null;
    },
    clearServiceDetail(state) {
      state.serviceDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchServiceDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceDetail.fulfilled, (state, action: PayloadAction<Service>) => {
        state.loading = false;
        state.serviceDetail = action.payload;
      })
      .addCase(fetchServiceDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.services.unshift(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.services = state.services.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
        if (state.serviceDetail && state.serviceDetail._id === action.payload._id) {
          state.serviceDetail = action.payload;
        }
      })
      .addCase(removeService.fulfilled, (state, action: PayloadAction<string>) => {
        state.services = state.services.filter(s => s._id !== action.payload);
      })
      .addCase(restoreService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.services = state.services.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(toggleServiceStatus.fulfilled, (state, action: PayloadAction<Service>) => {
        state.services = state.services.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      });
  },
});

export const { clearServiceError, clearServiceDetail } = serviceSlice.actions;
export default serviceSlice.reducer; 