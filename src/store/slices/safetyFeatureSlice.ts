import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { safetyFeatureApi } from "@/services/safetyFeatureApi";
import { SafetyFeature, CreateSafetyFeatureDto, UpdateSafetyFeatureDto } from "@/types/safety-feature";

interface SafetyFeatureState {
  safetyFeatures: SafetyFeature[];
  safetyFeatureDetail: SafetyFeature | null;
  loading: boolean;
  error: string | null;
}

const initialState: SafetyFeatureState = {
  safetyFeatures: [],
  safetyFeatureDetail: null,
  loading: false,
  error: null,
};

export const fetchSafetyFeatures = createAsyncThunk(
  "safetyFeature/fetchSafetyFeatures",
  async (params: Record<string, unknown> = {}, { getState, rejectWithValue }) => {
    try {
      const role = (getState() as import('..').RootState).auth.user?.role;
      let data;
      if (role === "admin") {
        ({ data } = await safetyFeatureApi.getAll(params));
      } else {
        ({ data } = await safetyFeatureApi.getPublic(params));
      }
      return data.data.safetyFeatures;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy danh sách tính năng an toàn");
    }
  }
);

export const fetchSafetyFeatureDetail = createAsyncThunk(
  "safetyFeature/fetchSafetyFeatureDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await safetyFeatureApi.getById(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết tính năng an toàn");
    }
  }
);

export const createSafetyFeature = createAsyncThunk(
  "safetyFeature/createSafetyFeature",
  async (dto: CreateSafetyFeatureDto, { rejectWithValue }) => {
    try {
      const { data } = await safetyFeatureApi.create(dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi tạo tính năng an toàn");
    }
  }
);

export const updateSafetyFeature = createAsyncThunk(
  "safetyFeature/updateSafetyFeature",
  async ({ id, dto }: { id: string; dto: UpdateSafetyFeatureDto }, { rejectWithValue }) => {
    try {
      const { data } = await safetyFeatureApi.update(id, dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật tính năng an toàn");
    }
  }
);

export const removeSafetyFeature = createAsyncThunk(
  "safetyFeature/removeSafetyFeature",
  async (id: string, { rejectWithValue }) => {
    try {
      await safetyFeatureApi.remove(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi xóa tính năng an toàn");
    }
  }
);

export const restoreSafetyFeature = createAsyncThunk(
  "safetyFeature/restoreSafetyFeature",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await safetyFeatureApi.restore(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi khôi phục tính năng an toàn");
    }
  }
);

export const toggleSafetyFeatureStatus = createAsyncThunk(
  "safetyFeature/toggleSafetyFeatureStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await safetyFeatureApi.toggleStatus(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi đổi trạng thái tính năng an toàn");
    }
  }
);

export const toggleSafetyFeatureDefault = createAsyncThunk(
  "safetyFeature/toggleSafetyFeatureDefault",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await safetyFeatureApi.toggleDefault(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi đổi trạng thái default_checked");
    }
  }
);

const safetyFeatureSlice = createSlice({
  name: "safetyFeature",
  initialState,
  reducers: {
    clearSafetyFeatureError(state) {
      state.error = null;
    },
    clearSafetyFeatureDetail(state) {
      state.safetyFeatureDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSafetyFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSafetyFeatures.fulfilled, (state, action: PayloadAction<SafetyFeature[]>) => {
        state.loading = false;
        state.safetyFeatures = action.payload;
      })
      .addCase(fetchSafetyFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSafetyFeatureDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSafetyFeatureDetail.fulfilled, (state, action: PayloadAction<SafetyFeature>) => {
        state.loading = false;
        state.safetyFeatureDetail = action.payload;
      })
      .addCase(fetchSafetyFeatureDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSafetyFeature.fulfilled, (state, action: PayloadAction<SafetyFeature>) => {
        state.safetyFeatures.unshift(action.payload);
      })
      .addCase(updateSafetyFeature.fulfilled, (state, action: PayloadAction<SafetyFeature>) => {
        state.safetyFeatures = state.safetyFeatures.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
        if (state.safetyFeatureDetail && state.safetyFeatureDetail._id === action.payload._id) {
          state.safetyFeatureDetail = action.payload;
        }
      })
      .addCase(removeSafetyFeature.fulfilled, (state, action: PayloadAction<string>) => {
        state.safetyFeatures = state.safetyFeatures.filter(s => s._id !== action.payload);
      })
      .addCase(restoreSafetyFeature.fulfilled, (state, action: PayloadAction<SafetyFeature>) => {
        state.safetyFeatures = state.safetyFeatures.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(toggleSafetyFeatureStatus.fulfilled, (state, action: PayloadAction<SafetyFeature>) => {
        state.safetyFeatures = state.safetyFeatures.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(toggleSafetyFeatureDefault.fulfilled, (state, action: PayloadAction<SafetyFeature>) => {
        state.safetyFeatures = state.safetyFeatures.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      });
  },
});

export const { clearSafetyFeatureError, clearSafetyFeatureDetail } = safetyFeatureSlice.actions;
export default safetyFeatureSlice.reducer; 