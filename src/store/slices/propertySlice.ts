import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { RootState } from "..";
import { getErrorMessage } from "@/helper/message";
import { Property, CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from "@/types/property";
import type { DateRange } from "react-day-picker";

interface PropertyState {
  properties: Property[];
  property?: Property;
  total: number;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  uploadImagesLoading: boolean;
  uploadImagesError: string | null;
  uploadedImageUrls: string[];
  propertyStatistics: unknown | null;
  propertyStatisticsLoading: boolean;
  propertyStatisticsError: string | null;
  propertyDetail?: Property;
  propertyDetailLoading?: boolean;
  propertyDetailError?: string | null;
}

const initialState: PropertyState = {
  properties: [],
  property: undefined,
  total: 0,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  uploadImagesLoading: false,
  uploadImagesError: null,
  uploadedImageUrls: [],
  propertyStatistics: null,
  propertyStatisticsLoading: false,
  propertyStatisticsError: null,
  propertyDetail: undefined,
  propertyDetailLoading: false,
  propertyDetailError: null,
};

// Async thunks
export const createProperty = createAsyncThunk<
  Property,
  CreatePropertyDto,
  { rejectValue: string }
>("properties/createProperty", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/properties", data);
    const property = response.data.data;
    return { ...property, id: property._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchProperties = createAsyncThunk<
  { properties: Property[]; total: number },
  QueryPropertyDto,
  { rejectValue: string }
>("properties/fetchProperties", async (params, { rejectWithValue }) => {
  try {
    // Xử lý params trước khi gửi request
    const { search, ...restParams } = params;
    const cleanParams = Object.fromEntries(
      Object.entries({
        ...restParams,
        // Thử các tham số khác nhau cho search
        name: search?.trim(), // Thử với tham số name
        // keyword: search?.trim(), // Hoặc có thể thử với keyword
        // q: search?.trim(), // Hoặc q
      })
        .filter(([, value]) => {
          if (value === "" || value === undefined || value === null) return false;
          return true;
        })
        .map(([key, value]) => {
          if (key === "page" || key === "limit") return [key, Number(value)];
          return [key, value];
        })
    );

    console.log("Clean params being sent to API:", cleanParams);
    const response = await api.get("/properties", { 
      params: cleanParams,
      paramsSerializer: {
        indexes: null
      }
    });
    
    // Xử lý response data
    const data = response.data?.data || response.data;
    const properties = Array.isArray(data) ? data : data?.data || [];
    const total = data?.total || properties.length;
    
    const mappedProperties = properties.map((property: Property) => ({
      ...property,
      id: property._id || property.id
    }));
    
    return {
      properties: mappedProperties,
      total,
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchPropertyById = createAsyncThunk<Property, string, { rejectValue: string }>(
  'properties/fetchPropertyById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/properties/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateProperty = createAsyncThunk<
  Property,
  { id: string } & UpdatePropertyDto,
  { rejectValue: string }
>("properties/updateProperty", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/properties/${id}`, data);
    const property = response.data.data;
    return { ...property, id: property._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteProperty = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("properties/deleteProperty", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/properties/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updatePropertyStatus = createAsyncThunk<
  Property,
  { id: string; status: string },
  { rejectValue: string }
>("properties/updatePropertyStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/properties/${id}/status`, { status });
    const property = response.data.data;
    return { ...property, id: property._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const verifyProperty = createAsyncThunk<
  Property,
  { id: string; isVerified: boolean },
  { rejectValue: string }
>("properties/verifyProperty", async ({ id, isVerified }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/properties/${id}/verify`, { isVerified });
    const property = response.data.data;
    return { ...property, id: property._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const uploadPropertyImages = createAsyncThunk<
  string[], // Trả về mảng url ảnh
  File[],
  { rejectValue: string }
>(
  "properties/uploadPropertyImages",
  async (files, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      for (const pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }
      // Truyền trực tiếp formData vào api.post, không truyền object
      const response = await api.post("/upload/multiple", formData);
      // Sửa: lấy đúng mảng urls từ response.data.data.urls
      return response.data.data.urls;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const restoreProperty = createAsyncThunk<Property, string, { rejectValue: string }>(
  "properties/restoreProperty",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/properties/${id}/restore`);
      const property = response.data.data;
      return { ...property, id: property._id };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const assignStaffToProperty = createAsyncThunk(
  "properties/assignStaff",
  async ({ id, staffIds }: { id: string; staffIds: string[] }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/properties/${id}/staff`, { staffIds });
      return res.data;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response === 'object' &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        return rejectWithValue((err as { response: { data: { message: string } } }).response.data.message);
      }
      return rejectWithValue("Lỗi gán nhân viên");
    }
  }
);

export const fetchPropertyStatistics = createAsyncThunk(
  "properties/fetchStatistics",
  async (
    { id, dateRange }: { id: string; dateRange?: DateRange },
    { rejectWithValue }
  ) => {
    try {
      // Chuẩn bị query string nếu có dateRange
      let query = "";
      if (dateRange?.from && dateRange?.to) {
        const from = dateRange.from.toISOString().split("T")[0];
        const to = dateRange.to.toISOString().split("T")[0];
        query = `?from=${from}&to=${to}`;
      }
      const res = await api.get(`/properties/${id}/statistics${query}`);
      return res.data.data;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response === 'object' &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        return rejectWithValue((err as { response: { data: { message: string } } }).response.data.message);
      }
      return rejectWithValue("Lỗi lấy thống kê property");
    }
  }
);

// Slice
const propertySlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    clearProperty: (state) => {
      state.property = undefined;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createProperty
      .addCase(createProperty.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.createLoading = false;
        state.properties.unshift(action.payload);
        state.property = action.payload;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = (action.payload as string) || action.error.message || "Tạo property thất bại!";
      })

      // fetchProperties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action: PayloadAction<{ properties: Property[]; total: number }>) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.total = action.payload.total;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Lỗi tải danh sách properties!";
      })

      // fetchPropertyById
      .addCase(fetchPropertyById.pending, (state) => {
        state.propertyDetailLoading = true;
        state.propertyDetailError = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.propertyDetailLoading = false;
        state.propertyDetail = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.propertyDetailLoading = false;
        state.propertyDetailError = (action.payload as string) || action.error.message || 'Không tìm thấy property!';
      })

      // updateProperty
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.loading = false;
        state.property = action.payload;
        // Update in properties array
        const index = state.properties.findIndex(property => property.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Cập nhật property thất bại!";
      })

      // deleteProperty
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.properties = state.properties.filter(property => property.id !== action.payload);
        if (state.property?.id === action.payload) {
          state.property = undefined;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Xóa property thất bại!";
      })

      // updatePropertyStatus
      .addCase(updatePropertyStatus.fulfilled, (state, action: PayloadAction<Property>) => {
        state.property = action.payload;
        // Update in properties array
        const index = state.properties.findIndex(property => property.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })

      // verifyProperty
      .addCase(verifyProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.property = action.payload;
        // Update in properties array
        const index = state.properties.findIndex(property => property.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })

      // uploadPropertyImages
      .addCase(uploadPropertyImages.pending, (state) => {
        state.uploadImagesLoading = true;
        state.uploadImagesError = null;
        state.uploadedImageUrls = [];
      })
      .addCase(uploadPropertyImages.fulfilled, (state, action) => {
        state.uploadImagesLoading = false;
        state.uploadedImageUrls = action.payload;
      })
      .addCase(uploadPropertyImages.rejected, (state, action) => {
        state.uploadImagesLoading = false;
        state.uploadImagesError = action.payload || "Upload ảnh thất bại";
      })

      // restoreProperty
      .addCase(restoreProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        // Cập nhật lại property trong danh sách nếu có
        const idx = state.properties.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) {
          state.properties[idx] = action.payload;
        } else {
          state.properties.unshift(action.payload);
        }
        state.property = action.payload;
      })
      .addCase(restoreProperty.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || "Khôi phục property thất bại!";
      })

      // assignStaffToProperty
      .addCase(assignStaffToProperty.fulfilled, (state, action) => {
        state.property = action.payload;
        // Update in properties array
        const index = state.properties.findIndex(property => property.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(assignStaffToProperty.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || "Lỗi gán nhân viên";
      })

      // fetchPropertyStatistics
      .addCase(fetchPropertyStatistics.pending, (state) => {
        state.propertyStatisticsLoading = true;
        state.propertyStatisticsError = null;
      })
      .addCase(fetchPropertyStatistics.fulfilled, (state, action) => {
        state.propertyStatisticsLoading = false;
        state.propertyStatistics = action.payload;
      })
      .addCase(fetchPropertyStatistics.rejected, (state, action) => {
        state.propertyStatisticsLoading = false;
        state.propertyStatisticsError = action.payload as string;
      });
  },
});

export const { clearProperty, clearCreateError } = propertySlice.actions;

// Selectors
export const selectProperties = (state: RootState) => state.properties.properties;
export const selectProperty = (state: RootState) => state.properties.property;
export const selectPropertiesLoading = (state: RootState) => state.properties.loading;
export const selectPropertiesError = (state: RootState) => state.properties.error;
export const selectPropertiesTotal = (state: RootState) => state.properties.total;
export const selectCreatePropertyLoading = (state: RootState) => state.properties.createLoading;
export const selectCreatePropertyError = (state: RootState) => state.properties.createError;
export const selectUploadImagesLoading = (state: RootState) => state.properties.uploadImagesLoading;
export const selectUploadImagesError = (state: RootState) => state.properties.uploadImagesError;
export const selectUploadedImageUrls = (state: RootState) => state.properties.uploadedImageUrls;
export const selectPropertyStatistics = (state: RootState) => state.properties.propertyStatistics;
export const selectPropertyStatisticsLoading = (state: RootState) => state.properties.propertyStatisticsLoading;
export const selectPropertyStatisticsError = (state: RootState) => state.properties.propertyStatisticsError;
export const selectPropertyDetail = (state: RootState) => state.properties.propertyDetail;

export default propertySlice.reducer; 