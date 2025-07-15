import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { houseRuleApi } from "@/services/houseRuleApi";
import { HouseRule, CreateHouseRuleDto, UpdateHouseRuleDto } from "@/types/house-rule";

interface HouseRuleState {
  houseRules: HouseRule[];
  houseRuleDetail: HouseRule | null;
  loading: boolean;
  error: string | null;
}

const initialState: HouseRuleState = {
  houseRules: [],
  houseRuleDetail: null,
  loading: false,
  error: null,
};

export const fetchHouseRules = createAsyncThunk(
  "houseRule/fetchHouseRules",
  async (params: Record<string, unknown> = {}, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.getAll(params);
      return data.data.houseRules;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy danh sách quy tắc nhà");
    }
  }
);

export const fetchHouseRuleDetail = createAsyncThunk(
  "houseRule/fetchHouseRuleDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.getById(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết quy tắc nhà");
    }
  }
);

export const createHouseRule = createAsyncThunk(
  "houseRule/createHouseRule",
  async (dto: CreateHouseRuleDto, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.create(dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi tạo quy tắc nhà");
    }
  }
);

export const updateHouseRule = createAsyncThunk(
  "houseRule/updateHouseRule",
  async ({ id, dto }: { id: string; dto: UpdateHouseRuleDto }, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.update(id, dto);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật quy tắc nhà");
    }
  }
);

export const removeHouseRule = createAsyncThunk(
  "houseRule/removeHouseRule",
  async (id: string, { rejectWithValue }) => {
    try {
      await houseRuleApi.remove(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi xóa quy tắc nhà");
    }
  }
);

export const restoreHouseRule = createAsyncThunk(
  "houseRule/restoreHouseRule",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.restore(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi khôi phục quy tắc nhà");
    }
  }
);

export const toggleHouseRuleStatus = createAsyncThunk(
  "houseRule/toggleHouseRuleStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.toggleStatus(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi đổi trạng thái quy tắc nhà");
    }
  }
);

export const toggleHouseRuleDefault = createAsyncThunk(
  "houseRule/toggleHouseRuleDefault",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await houseRuleApi.toggleDefault(id);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Lỗi đổi trạng thái default_checked");
    }
  }
);

const houseRuleSlice = createSlice({
  name: "houseRule",
  initialState,
  reducers: {
    clearHouseRuleError(state) {
      state.error = null;
    },
    clearHouseRuleDetail(state) {
      state.houseRuleDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHouseRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseRules.fulfilled, (state, action: PayloadAction<HouseRule[]>) => {
        state.loading = false;
        state.houseRules = action.payload;
      })
      .addCase(fetchHouseRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHouseRuleDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseRuleDetail.fulfilled, (state, action: PayloadAction<HouseRule>) => {
        state.loading = false;
        state.houseRuleDetail = action.payload;
      })
      .addCase(fetchHouseRuleDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createHouseRule.fulfilled, (state, action: PayloadAction<HouseRule>) => {
        state.houseRules.unshift(action.payload);
      })
      .addCase(updateHouseRule.fulfilled, (state, action: PayloadAction<HouseRule>) => {
        state.houseRules = state.houseRules.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
        if (state.houseRuleDetail && state.houseRuleDetail._id === action.payload._id) {
          state.houseRuleDetail = action.payload;
        }
      })
      .addCase(removeHouseRule.fulfilled, (state, action: PayloadAction<string>) => {
        state.houseRules = state.houseRules.filter(s => s._id !== action.payload);
      })
      .addCase(restoreHouseRule.fulfilled, (state, action: PayloadAction<HouseRule>) => {
        state.houseRules = state.houseRules.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(toggleHouseRuleStatus.fulfilled, (state, action: PayloadAction<HouseRule>) => {
        state.houseRules = state.houseRules.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(toggleHouseRuleDefault.fulfilled, (state, action: PayloadAction<HouseRule>) => {
        state.houseRules = state.houseRules.map(s =>
          s._id === action.payload._id ? action.payload : s
        );
      });
  },
});

export const { clearHouseRuleError, clearHouseRuleDetail } = houseRuleSlice.actions;
export default houseRuleSlice.reducer; 