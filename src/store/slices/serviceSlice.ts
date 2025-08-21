import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { serviceApi } from "@/services/serviceApi";
import { Service, CreateServiceDto, UpdateServiceDto } from "@/types/services";

// Interfaces for ServiceUsagePage
interface ServiceUsageData {
  _id: string;
  name: string;
  description: string;
  icon_url: string;
  unit: string;
  default_price: number;
  is_active: boolean;
  allow_quantity: boolean; // Trường mới
  isDeleted: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceBookingData {
  _id: string;
  propertyId: string;
  listingId: string;
  checkInDate: string;
  nights: number;
  guest_name: string;
  guest_email: string;
  created_at: string;
  property_name: string;
  listing_title: string;
  service_quantity: number;
  service_total_price: number;
  booking_status: string;
  final_price: number;
}

interface ServiceState {
  services: Service[];
  serviceDetail: Service | null;
  serviceUsage: ServiceUsageData | null;
  serviceBookings: ServiceBookingData[];
  serviceDetailedStats?: ServiceDetailedStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  serviceDetail: null,
  serviceUsage: null,
  serviceBookings: [],
  serviceDetailedStats: null,
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  "service/fetchServices",
  async (
    params: Record<string, unknown> = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const role = (getState() as import("..").RootState).auth.user?.role;
      let data;
      if (role === "admin") {
        ({ data } = await serviceApi.getAll(params));
        return data.data.services;
      } else {
        ({ data } = await serviceApi.getActive());
        return data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách dịch vụ"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy chi tiết dịch vụ"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Lỗi tạo dịch vụ"
      );
    }
  }
);

export const updateService = createAsyncThunk(
  "service/updateService",
  async (
    { id, dto }: { id: string; dto: UpdateServiceDto },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await serviceApi.update(id, dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi cập nhật dịch vụ"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Lỗi xóa dịch vụ"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khôi phục dịch vụ"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Lỗi đổi trạng thái dịch vụ"
      );
    }
  }
);

// Async thunks for ServiceUsagePage
export const fetchServiceUsage = createAsyncThunk(
  "service/fetchServiceUsage",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("fetchServiceUsage - Calling API with ID:", id);
      const { data } = await serviceApi.getById(id);
      console.log("fetchServiceUsage - API response:", data);
      return data.data;
    } catch (err: unknown) {
      console.error("fetchServiceUsage - API error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy thông tin service"
      );
    }
  }
);

export const fetchServiceBookings = createAsyncThunk(
  "service/fetchServiceBookings",
  async (id: string, { rejectWithValue }) => {
    try {
      console.log("fetchServiceBookings - Calling API with ID:", id);
      const { data } = await serviceApi.getBookings(id);
      console.log("fetchServiceBookings - API response:", data);
      // API response có cấu trúc: { success: true, data: { data: [...], total: 1, ... } }
      return data.data?.data || [];
    } catch (err: unknown) {
      console.error("fetchServiceBookings - API error:", err);
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách booking"
      );
    }
  }
);

export const fetchServiceDetailedStats = createAsyncThunk(
  "service/fetchServiceDetailedStats",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await serviceApi.getDetailedStats(id);
      // API wraps inside data.data.data
      const stats = data?.data?.data || data?.data || data;
      return stats as ServiceDetailedStats;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy thống kê chi tiết dịch vụ"
      );
    }
  }
);

// Detailed stats interface for service
interface ServiceDetailedStats {
  _id: string;
  service_name: string;
  service_price: number;
  total_bookings: number;
  total_revenue: number;
  average_price: number;
}

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
    clearServiceUsage(state) {
      state.serviceUsage = null;
      state.serviceBookings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServices.fulfilled,
        (state, action: PayloadAction<Service[]>) => {
          state.loading = false;
          state.services = action.payload;
        }
      )
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchServiceDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServiceDetail.fulfilled,
        (state, action: PayloadAction<Service>) => {
          state.loading = false;
          state.serviceDetail = action.payload;
        }
      )
      .addCase(fetchServiceDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        createService.fulfilled,
        (state, action: PayloadAction<Service>) => {
          state.services.unshift(action.payload);
        }
      )
      .addCase(
        updateService.fulfilled,
        (state, action: PayloadAction<Service>) => {
          state.services = state.services.map((s) =>
            s._id === action.payload._id ? action.payload : s
          );
          if (
            state.serviceDetail &&
            state.serviceDetail._id === action.payload._id
          ) {
            state.serviceDetail = action.payload;
          }
        }
      )
      .addCase(
        removeService.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.services = state.services.filter(
            (s) => s._id !== action.payload
          );
        }
      )
      .addCase(
        restoreService.fulfilled,
        (state, action: PayloadAction<Service>) => {
          state.services = state.services.map((s) =>
            s._id === action.payload._id ? action.payload : s
          );
        }
      )
      .addCase(
        toggleServiceStatus.fulfilled,
        (state, action: PayloadAction<Service>) => {
          state.services = state.services.map((s) =>
            s._id === action.payload._id ? action.payload : s
          );
        }
      )
      .addCase(toggleServiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchServiceUsage
      .addCase(fetchServiceUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServiceUsage.fulfilled,
        (state, action: PayloadAction<ServiceUsageData>) => {
          state.loading = false;
          state.serviceUsage = action.payload;
        }
      )
      .addCase(fetchServiceUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchServiceBookings
      .addCase(fetchServiceBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.serviceBookings = [];
      })
      .addCase(
        fetchServiceBookings.fulfilled,
        (state, action: PayloadAction<ServiceBookingData[]>) => {
          state.loading = false;
          state.serviceBookings = action.payload || [];
        }
      )
      .addCase(fetchServiceBookings.rejected, (state, action) => {
        state.loading = false;
        state.serviceBookings = [];
        state.error = action.payload as string;
      })
      // fetchServiceDetailedStats
      .addCase(fetchServiceDetailedStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServiceDetailedStats.fulfilled,
        (state, action: PayloadAction<ServiceDetailedStats>) => {
          state.loading = false;
          state.serviceDetailedStats = action.payload;
        }
      )
      .addCase(fetchServiceDetailedStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearServiceError, clearServiceDetail, clearServiceUsage } =
  serviceSlice.actions;
export default serviceSlice.reducer;
