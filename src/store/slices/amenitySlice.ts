import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { Amenity, CreateAmenityDto, UpdateAmenityDto, QueryAmenityDto } from "@/types/amenity";
import { RootState } from "..";
import { getErrorMessage } from "@/helper/message";

interface AmenityState {
  amenities: Amenity[];
  amenity?: Amenity;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: AmenityState = {
  amenities: [],
  amenity: undefined,
  total: 0,
  loading: false,
  error: null,
};

// Lấy danh sách amenities
export const fetchAmenities = createAsyncThunk<
  { amenities: Amenity[]; total: number },
  QueryAmenityDto,
  { state: RootState; rejectValue: string }
>("amenities/fetchAmenities", async (params, { getState, rejectWithValue }) => {
  try {
    // Lấy role từ redux state
    const role = getState().auth.user?.role;
    let response;
    if (role === "admin") {
      response = await api.get("/amenities", { params });
    } else {
      response = await api.get("/amenities/public", { params });
    }
    const amenities = response.data.data?.amenities ?? [];
    return {
      amenities,
      total: response.data.data?.meta?.total || 0,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Lấy chi tiết 1 amenity
export const fetchAmenityById = createAsyncThunk<
  Amenity,
  string,
  { rejectValue: string }
>("amenities/fetchAmenityById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/amenities/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Tạo amenity
export const createAmenity = createAsyncThunk<
  Amenity,
  CreateAmenityDto,
  { rejectValue: string }
>("amenities/createAmenity", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/amenities", data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Cập nhật amenity
export const updateAmenity = createAsyncThunk<
  Amenity,
  { id: string } & UpdateAmenityDto,
  { rejectValue: string }
>("amenities/updateAmenity", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    console.log('Sending update request:', { id, data }); // Debug log
    console.log('Request payload:', JSON.stringify(data, null, 2)); // Debug: xem payload chi tiết
    const response = await api.put(`/amenities/${id}`, data);
    console.log('Update API response:', response.data); // Debug log
    console.log('Response data.data:', response.data.data); // Debug: xem dữ liệu trả về
    return response.data.data;
  } catch (error) {
    console.error('Update error:', error); // Debug: xem lỗi nếu có
    return rejectWithValue(getErrorMessage(error));
  }
});

// Xóa amenity
export const deleteAmenity = createAsyncThunk(
  "amenities/deleteAmenity",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/amenities/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const amenitySlice = createSlice({
  name: "amenities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmenities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload.amenities;
        state.total = action.payload.total;
      })
      .addCase(fetchAmenities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi tải danh sách tiện ích";
      })
      .addCase(fetchAmenityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmenityById.fulfilled, (state, action) => {
        state.loading = false;
        state.amenity = action.payload;
      })
      .addCase(fetchAmenityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi tải chi tiết tiện ích";
      })
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.amenities.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        const idx = state.amenities.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.amenities[idx] = action.payload;
        if (state.amenity && state.amenity._id === action.payload._id) state.amenity = action.payload;
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.amenities = state.amenities.filter(a => a._id !== action.payload);
        state.total -= 1;
      });
  },
});

export default amenitySlice.reducer;
export const selectAmenities = (state: RootState) => state.amenities.amenities ?? [];
export const selectAmenitiesLoading = (state: RootState) => state.amenities.loading;
export const selectAmenitiesError = (state: RootState) => state.amenities.error;
export const selectAmenitiesTotal = (state: RootState) => state.amenities.total;
export const selectAmenityDetail = (state: RootState) => state.amenities.amenity; 