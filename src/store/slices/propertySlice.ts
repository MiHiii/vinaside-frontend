import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { RootState } from "..";
import { getErrorMessage } from "@/helper/message";
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  QueryPropertyDto,
} from "@/types/property";
import type { DateRange } from "react-day-picker";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";

// Room status type (theo từng phòng)
export interface RoomStatusItem {
  listingId: string;
  status: "occupied" | "available" | string;
}
export type PropertyRoomStatus = Record<string, string>; // { [listingId]: status }

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
  propertyRoomStatus: Record<string, PropertyRoomStatus>;
  // Property staff assignment states
  staffByProperty: unknown[];
  staffByPropertyLoading: boolean;
  staffByPropertyError: string | null;
  propertiesByStaff: Property[];
  propertiesByStaffLoading: boolean;
  propertiesByStaffError: string | null;
  staffAssignmentCheck: { isAssigned: boolean } | null;
  staffAssignmentCheckLoading: boolean;
  staffAssignmentCheckError: string | null;
  propertyRooms: unknown[];
  propertyRoomsLoading: boolean;
  propertyRoomsError: string | null;
  // Property rooms list state
  propertyRoomsList: unknown[];
  propertyRoomsListLoading: boolean;
  propertyRoomsListError: string | null;
  // Property locations state
  propertyLocations: Array<{
    _id?: string;
    id?: string;
    name: string;
    type: string;
    location: {
      place_id: string;
      lat: number;
      lng: number;
      address: string;
      city: string;
      district: string;
      ward: string;
      coordinates: [number, number];
    };
  }>;
  propertyLocationsLoading: boolean;
  propertyLocationsError: string | null;
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
  propertyRoomStatus: {},
  // Property staff assignment states
  staffByProperty: [],
  staffByPropertyLoading: false,
  staffByPropertyError: null,
  propertiesByStaff: [],
  propertiesByStaffLoading: false,
  propertiesByStaffError: null,
  staffAssignmentCheck: null,
  staffAssignmentCheckLoading: false,
  staffAssignmentCheckError: null,
  propertyRooms: [],
  propertyRoomsLoading: false,
  propertyRoomsError: null,
  // Property rooms list state
  propertyRoomsList: [],
  propertyRoomsListLoading: false,
  propertyRoomsListError: null,
  // Property locations state
  propertyLocations: [],
  propertyLocationsLoading: false,
  propertyLocationsError: null,
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
          if (value === "" || value === undefined || value === null)
            return false;
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
        indexes: null,
      },
    });

    // Xử lý response data
    const data = response.data?.data || response.data;
    const properties = Array.isArray(data) ? data : data?.data || [];
    const total = data?.total || properties.length;

    const mappedProperties = properties.map((property: Property) => ({
      ...property,
      id: property._id || property.id,
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

export const fetchPropertyById = createAsyncThunk<
  Property,
  string,
  { rejectValue: string }
>("properties/fetchPropertyById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/properties/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

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
>(
  "properties/updatePropertyStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/properties/${id}/status`, { status });
      const property = response.data.data;
      return { ...property, id: property._id };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyProperty = createAsyncThunk<
  Property,
  { id: string; isVerified: boolean },
  { rejectValue: string }
>(
  "properties/verifyProperty",
  async ({ id, isVerified }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/properties/${id}/verify`, {
        isVerified,
      });
      const property = response.data.data;
      return { ...property, id: property._id };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadPropertyImages = createAsyncThunk<
  string[], // Trả về mảng url ảnh
  File[],
  { rejectValue: string }
>("properties/uploadPropertyImages", async (files, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await api.post("/upload/multiple", formData);
    return response.data.data.urls;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const restoreProperty = createAsyncThunk<
  Property,
  string,
  { rejectValue: string }
>("properties/restoreProperty", async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/properties/${id}/restore`);
    const property = response.data.data;
    return { ...property, id: property._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const assignStaffToProperty = createAsyncThunk(
  "properties/assignStaff",
  async (
    { id, staffIds, role }: { id: string; staffIds: string[]; role?: string },
    { rejectWithValue }
  ) => {
    try {
      // Gửi từng staffId một với role
      const promises = staffIds.map((staffId) =>
        propertyStaffAssignmentApi.assignStaff({
          propertyId: id,
          staffId,
          role,
        })
      );
      const results = await Promise.all(promises);
      return results[0]; // Trả về kết quả đầu tiên
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } })
          .response === "object" &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        return rejectWithValue(
          (err as { response: { data: { message: string } } }).response.data
            .message
        );
      }
      return rejectWithValue("Lỗi gán nhân viên");
    }
  }
);

export const unassignStaffFromProperty = createAsyncThunk(
  "properties/unassignStaff",
  async (
    { id, staffIds }: { id: string; staffIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      // Gửi từng staffId một
      const promises = staffIds.map((staffId) =>
        propertyStaffAssignmentApi.unassignStaff({ propertyId: id, staffId })
      );
      const results = await Promise.all(promises);
      return results[0]; // Trả về kết quả đầu tiên
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } })
          .response === "object" &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        return rejectWithValue(
          (err as { response: { data: { message: string } } }).response.data
            .message
        );
      }
      return rejectWithValue("Lỗi bỏ gán nhân viên");
    }
  }
);

export const getStaffByProperty = createAsyncThunk(
  "properties/getStaffByProperty",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const res = await propertyStaffAssignmentApi.getStaffByProperty(
        propertyId
      );
      return res;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const getPropertiesByStaff = createAsyncThunk(
  "properties/getPropertiesByStaff",
  async (staffId: string, { rejectWithValue }) => {
    try {
      const res = await propertyStaffAssignmentApi.getPropertiesByStaff(
        staffId
      );
      return res;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const checkStaffAssignment = createAsyncThunk(
  "properties/checkStaffAssignment",
  async (
    { staffId, propertyId }: { staffId: string; propertyId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await propertyStaffAssignmentApi.checkStaffAssignment(
        staffId,
        propertyId
      );
      return res;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchPropertyStatistics = createAsyncThunk(
  "properties/fetchStatistics",
  async (
    {
      id,
      dateRange,
      startDate,
      endDate,
    }: {
      id: string;
      dateRange?:
        | "today"
        | "last_7_days"
        | "last_15_days"
        | "last_30_days"
        | "custom";
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Chuẩn bị query parameters
      const params = new URLSearchParams();

      // Chỉ append dateRange nếu được truyền vào
      if (dateRange) {
        if (dateRange === "custom" && startDate && endDate) {
          params.append("dateRange", "custom");
          params.append("startDate", startDate);
          params.append("endDate", endDate);
        } else {
          params.append("dateRange", dateRange);
        }
      }

      const queryString = params.toString();
      const url = `/properties/${id}/statistics${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await api.get(url);
      return res.data.data;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } })
          .response === "object" &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      ) {
        return rejectWithValue(
          (err as { response: { data: { message: string } } }).response.data
            .message
        );
      }
      return rejectWithValue("Lỗi lấy thống kê property");
    }
  }
);

// Thunk lấy trạng thái phòng của property
export const fetchPropertyRoomStatus = createAsyncThunk<
  { propertyId: string; status: PropertyRoomStatus },
  string,
  { rejectValue: string }
>(
  "properties/fetchPropertyRoomStatus",
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/properties/${propertyId}/room-status`);
      // res.data.data là mảng [{ listingId, status }]
      const arr: RoomStatusItem[] = Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      const status: PropertyRoomStatus = {};
      arr.forEach((item) => {
        if (item.listingId) status[String(item.listingId)] = item.status;
      });
      return { propertyId, status };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk lấy danh sách phòng trong property
export const fetchPropertyRooms = createAsyncThunk<
  unknown[],
  string,
  { rejectValue: string }
>("properties/fetchPropertyRooms", async (propertyId, { rejectWithValue }) => {
  try {
    // New API returns full room data with status and listingStatus
    const res = await api.get(`/properties/${propertyId}/room-status`);
    const rooms = res.data?.data || [];
    return rooms;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Thunk lấy danh sách phòng trong property
export const fetchPropertyRoomsList = createAsyncThunk<
  unknown[],
  string,
  { rejectValue: string }
>(
  "properties/fetchPropertyRoomsList",
  async (propertyId, { rejectWithValue }) => {
    try {
      console.log(
        "Calling API for property rooms:",
        `/properties/${propertyId}/rooms`
      );
      const res = await api.get(`/properties/${propertyId}/rooms`);
      console.log("API response for rooms:", res.data);
      // Fix: Extract rooms array from the correct path in response
      return res.data?.data?.rooms || [];
    } catch (err) {
      console.error("Error fetching property rooms:", err);
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk lấy danh sách địa điểm properties
export const fetchPropertyLocations = createAsyncThunk<
  Array<{
    _id?: string;
    id?: string;
    name: string;
    type: string;
    location: {
      place_id: string;
      lat: number;
      lng: number;
      address: string;
      city: string;
      district: string;
      ward: string;
      coordinates: [number, number];
    };
  }>,
  void,
  { rejectValue: string }
>("properties/fetchPropertyLocations", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/properties/nearby");
    return res.data?.data || [];
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

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
      .addCase(
        createProperty.fulfilled,
        (state, action: PayloadAction<Property>) => {
          state.createLoading = false;
          state.properties.unshift(action.payload);
          state.property = action.payload;
        }
      )
      .addCase(createProperty.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          (action.payload as string) ||
          action.error.message ||
          "Tạo property thất bại!";
      })

      // fetchProperties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProperties.fulfilled,
        (
          state,
          action: PayloadAction<{ properties: Property[]; total: number }>
        ) => {
          state.loading = false;
          state.properties = action.payload.properties;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải danh sách properties!";
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
        state.propertyDetailError =
          (action.payload as string) ||
          action.error.message ||
          "Không tìm thấy property!";
      })

      // updateProperty
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProperty.fulfilled,
        (state, action: PayloadAction<Property>) => {
          state.loading = false;
          state.property = action.payload;
          // Update in properties array
          const index = state.properties.findIndex(
            (property) => property.id === action.payload.id
          );
          if (index !== -1) {
            state.properties[index] = action.payload;
          }
        }
      )
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Cập nhật property thất bại!";
      })

      // deleteProperty
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteProperty.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.properties = state.properties.filter(
            (property) => property.id !== action.payload
          );
          if (state.property?.id === action.payload) {
            state.property = undefined;
          }
        }
      )
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Xóa property thất bại!";
      })

      // updatePropertyStatus
      .addCase(
        updatePropertyStatus.fulfilled,
        (state, action: PayloadAction<Property>) => {
          state.property = action.payload;
          // Update in properties array
          const index = state.properties.findIndex(
            (property) => property.id === action.payload.id
          );
          if (index !== -1) {
            state.properties[index] = action.payload;
          }
        }
      )

      // verifyProperty
      .addCase(
        verifyProperty.fulfilled,
        (state, action: PayloadAction<Property>) => {
          state.property = action.payload;
          // Update in properties array
          const index = state.properties.findIndex(
            (property) => property.id === action.payload.id
          );
          if (index !== -1) {
            state.properties[index] = action.payload;
          }
        }
      )

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
      .addCase(
        restoreProperty.fulfilled,
        (state, action: PayloadAction<Property>) => {
          // Cập nhật lại property trong danh sách nếu có
          const idx = state.properties.findIndex(
            (p) => p.id === action.payload.id
          );
          if (idx !== -1) {
            state.properties[idx] = action.payload;
          } else {
            state.properties.unshift(action.payload);
          }
          state.property = action.payload;
        }
      )
      .addCase(restoreProperty.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Khôi phục property thất bại!";
      })

      // assignStaffToProperty
      .addCase(assignStaffToProperty.fulfilled, (state, action) => {
        state.property = action.payload;
        // Update in properties array
        const index = state.properties.findIndex(
          (property) => property.id === action.payload.id
        );
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(assignStaffToProperty.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi gán nhân viên";
      })

      // unassignStaffFromProperty
      .addCase(unassignStaffFromProperty.fulfilled, (state, action) => {
        state.property = action.payload;
        // Update in properties array
        const index = state.properties.findIndex(
          (property) => property.id === action.payload.id
        );
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(unassignStaffFromProperty.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi bỏ gán nhân viên";
      })

      // getStaffByProperty
      .addCase(getStaffByProperty.pending, (state) => {
        state.staffByPropertyLoading = true;
        state.staffByPropertyError = null;
      })
      .addCase(getStaffByProperty.fulfilled, (state, action) => {
        state.staffByPropertyLoading = false;
        state.staffByProperty = action.payload;
      })
      .addCase(getStaffByProperty.rejected, (state, action) => {
        state.staffByPropertyLoading = false;
        state.staffByPropertyError = action.payload as string;
      })

      // getPropertiesByStaff
      .addCase(getPropertiesByStaff.pending, (state) => {
        state.propertiesByStaffLoading = true;
        state.propertiesByStaffError = null;
      })
      .addCase(getPropertiesByStaff.fulfilled, (state, action) => {
        state.propertiesByStaffLoading = false;
        state.propertiesByStaff = action.payload;
      })
      .addCase(getPropertiesByStaff.rejected, (state, action) => {
        state.propertiesByStaffLoading = false;
        state.propertiesByStaffError = action.payload as string;
      })

      // checkStaffAssignment
      .addCase(checkStaffAssignment.pending, (state) => {
        state.staffAssignmentCheckLoading = true;
        state.staffAssignmentCheckError = null;
      })
      .addCase(checkStaffAssignment.fulfilled, (state, action) => {
        state.staffAssignmentCheckLoading = false;
        state.staffAssignmentCheck = action.payload;
      })
      .addCase(checkStaffAssignment.rejected, (state, action) => {
        state.staffAssignmentCheckLoading = false;
        state.staffAssignmentCheckError = action.payload as string;
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
      })

      // fetchPropertyRoomStatus
      .addCase(fetchPropertyRoomStatus.fulfilled, (state, action) => {
        state.propertyRoomStatus[action.payload.propertyId] =
          action.payload.status;
      })

      // fetchPropertyRooms
      .addCase(fetchPropertyRooms.pending, (state) => {
        state.propertyRoomsLoading = true;
        state.propertyRoomsError = null;
      })
      .addCase(fetchPropertyRooms.fulfilled, (state, action) => {
        state.propertyRoomsLoading = false;
        state.propertyRooms = action.payload;
      })
      .addCase(fetchPropertyRooms.rejected, (state, action) => {
        state.propertyRoomsLoading = false;
        state.propertyRoomsError =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải danh sách phòng!";
      })

      // fetchPropertyRoomsList
      .addCase(fetchPropertyRoomsList.pending, (state) => {
        state.propertyRoomsListLoading = true;
        state.propertyRoomsListError = null;
      })
      .addCase(fetchPropertyRoomsList.fulfilled, (state, action) => {
        state.propertyRoomsListLoading = false;
        state.propertyRoomsList = action.payload;
      })
      .addCase(fetchPropertyRoomsList.rejected, (state, action) => {
        state.propertyRoomsListLoading = false;
        state.propertyRoomsListError =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải danh sách phòng!";
      })

      // fetchPropertyLocations
      .addCase(fetchPropertyLocations.pending, (state) => {
        state.propertyLocationsLoading = true;
        state.propertyLocationsError = null;
      })
      .addCase(fetchPropertyLocations.fulfilled, (state, action) => {
        state.propertyLocationsLoading = false;
        state.propertyLocations = action.payload;
      })
      .addCase(fetchPropertyLocations.rejected, (state, action) => {
        state.propertyLocationsLoading = false;
        state.propertyLocationsError = action.payload as string;
      });
  },
});

export const { clearProperty, clearCreateError } = propertySlice.actions;

// Selectors
export const selectProperties = (state: RootState) =>
  state.properties.properties;
export const selectProperty = (state: RootState) => state.properties.property;
export const selectPropertiesLoading = (state: RootState) =>
  state.properties.loading;
export const selectPropertiesError = (state: RootState) =>
  state.properties.error;
export const selectPropertiesTotal = (state: RootState) =>
  state.properties.total;
export const selectCreatePropertyLoading = (state: RootState) =>
  state.properties.createLoading;
export const selectCreatePropertyError = (state: RootState) =>
  state.properties.createError;
export const selectUploadImagesLoading = (state: RootState) =>
  state.properties.uploadImagesLoading;
export const selectUploadImagesError = (state: RootState) =>
  state.properties.uploadImagesError;
export const selectUploadedImageUrls = (state: RootState) =>
  state.properties.uploadedImageUrls;
export const selectPropertyStatistics = (state: RootState) =>
  state.properties.propertyStatistics;
export const selectPropertyStatisticsLoading = (state: RootState) =>
  state.properties.propertyStatisticsLoading;
export const selectPropertyStatisticsError = (state: RootState) =>
  state.properties.propertyStatisticsError;
export const selectPropertyDetail = (state: RootState) =>
  state.properties.propertyDetail;
export const selectPropertyRoomStatus = (
  state: RootState,
  propertyId: string
) => state.properties.propertyRoomStatus[propertyId];

// Property staff assignment selectors
export const selectStaffByProperty = (state: RootState) =>
  state.properties.staffByProperty;
export const selectStaffByPropertyLoading = (state: RootState) =>
  state.properties.staffByPropertyLoading;
export const selectStaffByPropertyError = (state: RootState) =>
  state.properties.staffByPropertyError;
export const selectPropertiesByStaff = (state: RootState) =>
  state.properties.propertiesByStaff;
export const selectPropertiesByStaffLoading = (state: RootState) =>
  state.properties.propertiesByStaffLoading;
export const selectPropertiesByStaffError = (state: RootState) =>
  state.properties.propertiesByStaffError;
export const selectStaffAssignmentCheck = (state: RootState) =>
  state.properties.staffAssignmentCheck;
export const selectStaffAssignmentCheckLoading = (state: RootState) =>
  state.properties.staffAssignmentCheckLoading;
export const selectStaffAssignmentCheckError = (state: RootState) =>
  state.properties.staffAssignmentCheckError;

export const selectPropertyRooms = (state: RootState) =>
  state.properties.propertyRooms;
export const selectPropertyRoomsLoading = (state: RootState) =>
  state.properties.propertyRoomsLoading;
export const selectPropertyRoomsError = (state: RootState) =>
  state.properties.propertyRoomsError;

export const selectPropertyRoomsList = (state: RootState) =>
  state.properties.propertyRoomsList;
export const selectPropertyRoomsListLoading = (state: RootState) =>
  state.properties.propertyRoomsListLoading;
export const selectPropertyRoomsListError = (state: RootState) =>
  state.properties.propertyRoomsListError;

export const selectPropertyLocations = (state: RootState) =>
  state.properties.propertyLocations;
export const selectPropertyLocationsLoading = (state: RootState) =>
  state.properties.propertyLocationsLoading;
export const selectPropertyLocationsError = (state: RootState) =>
  state.properties.propertyLocationsError;

export default propertySlice.reducer;
