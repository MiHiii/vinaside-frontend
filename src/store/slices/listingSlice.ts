import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { RootState } from "..";
import { getErrorMessage } from "@/helper/message";
import {
  Listing,
  CreateListingDto,
  UpdateListingDto,
  QueryListingDto,
} from "@/types/listing";

// Type cho thống kê listing mới theo API /listings/statistics/:id
export interface ListingStatistics {
  listingId: string;
  listingTitle: string;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  totalViews: number;
  totalReviews: number;
  averageRating: number;
  wishlistCount: number;
  totalVoucherDiscount: number;
  totalVouchersUsed: number;
  voucherDetails: {
    voucherId: string;
    voucherCode: string;
    usageCount: number;
    totalDiscount: number;
    averageDiscount: number;
  }[];
  totalServiceRevenue: number;
  totalServicesUsed: number;
  serviceDetails: {
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
    averagePrice: number;
  }[];
  chartData: {
    date: string;
    totalRevenue: number;
  }[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface ListingState {
  listings: Listing[];
  listing?: Listing;
  total: number;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  uploadImagesLoading: boolean;
  uploadImagesError: string | null;
  uploadedImageUrls: string[];
  // Thêm state cho thống kê
  listingStatistics?: ListingStatistics;
  listingStatisticsLoading?: boolean;
  listingStatisticsError?: string | null;
  // Thêm state cho top listings
  topViewedListings: Listing[];
  topRatedListings: Listing[];
  topWishlistListings: Listing[];
  topListingsLoading: boolean;
  topListingsError: string | null;
}

const initialState: ListingState = {
  listings: [],
  listing: undefined,
  total: 0,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  uploadImagesLoading: false,
  uploadImagesError: null,
  uploadedImageUrls: [],
  // Thêm state cho thống kê
  listingStatistics: undefined,
  listingStatisticsLoading: false,
  listingStatisticsError: null,
  // Thêm state cho top listings
  topViewedListings: [],
  topRatedListings: [],
  topWishlistListings: [],
  topListingsLoading: false,
  topListingsError: null,
};

// Async thunks
export const createListing = createAsyncThunk<
  Listing,
  CreateListingDto,
  { rejectValue: string }
>("listings/createListing", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/listings", data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Định nghĩa type cho params search location
export interface ListingSearchParams extends QueryListingDto {
  place_id?: string;
  fuzzy_place_search?: boolean;
  lat?: number;
  lng?: number;
  locationKeyword?: string;
  city?: string;
  district?: string;
  address?: string;
  radius?: number;
  [key: string]: unknown;
}

// fetchListings
export const fetchListings = createAsyncThunk<
  { listings: Listing[]; total: number },
  ListingSearchParams,
  { rejectValue: string }
>("listings/fetchListings", async (params, { rejectWithValue }) => {
  try {
    // Ưu tiên search theo lat/lng (gọi endpoint /listings/location/nearby)
    if (params.lat && params.lng) {
      const res = await api.get("/listings/location/nearby", { params });
      const data = res.data.data || res.data;
      const listings =
        data.listings || data.data || (Array.isArray(data) ? data : []);
      const total = data.meta?.total || data.total || listings.length;
      return { listings, total };
    }
    // Nếu có place_id thì gọi /listings?place_id=...
    if (params.place_id) {
      if (params.fuzzy_place_search === undefined)
        params.fuzzy_place_search = true;
      const res = await api.get("/listings", { params });
      const data = res.data.data || res.data;
      const listings =
        data.listings || data.data || (Array.isArray(data) ? data : []);
      const total = data.meta?.total || data.total || listings.length;
      return { listings, total };
    }
    // Nếu chỉ có keyword hoặc các trường khác
    const res = await api.get("/listings", { params });
    const data = res.data.data || res.data;
    const listings =
      data.listings || data.data || (Array.isArray(data) ? data : []);
    const total = data.meta?.total || data.total || listings.length;
    return { listings, total };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// fetchAdminListings - cho admin với staff filtering
export const fetchAdminListings = createAsyncThunk<
  { listings: Listing[]; total: number },
  ListingSearchParams,
  { rejectValue: string }
>("listings/fetchAdminListings", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/listings/admin", { params });
    const data = res.data.data || res.data;
    const listings =
      data.listings || data.data || (Array.isArray(data) ? data : []);
    const total = data.meta?.total || data.total || listings.length;
    return { listings, total };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchListingById = createAsyncThunk<
  Listing,
  string,
  { rejectValue: string }
>("listings/fetchListingById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/listings/${id}/view`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Thunk mới cho admin/staff - không tăng lượt xem
export const fetchListingByIdForAdmin = createAsyncThunk<
  Listing,
  string,
  { rejectValue: string }
>("listings/fetchListingByIdForAdmin", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/listings/admin/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateListing = createAsyncThunk<
  Listing,
  { id: string } & UpdateListingDto,
  { rejectValue: string }
>("listings/updateListing", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    // Lấy propertyId từ data
    const propertyId =
      typeof data.propertyId === "object" && data.propertyId !== null
        ? data.propertyId._id
        : data.propertyId;
    const res = await api.put(`/listings/property/${propertyId}/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteListing = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("listings/deleteListing", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/listings/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateListingStatus = createAsyncThunk<
  Listing,
  { id: string; status: string },
  { rejectValue: string }
>(
  "listings/updateListingStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/listings/${id}/status`, { status });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const uploadListingImages = createAsyncThunk<
  string[],
  File[],
  { rejectValue: string }
>("listings/uploadListingImages", async (files, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await api.post("/upload/multiple", formData);
    return res.data.data.urls;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const restoreListing = createAsyncThunk<
  Listing,
  string,
  { rejectValue: string }
>("listings/restoreListing", async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/listings/${id}/restore`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Thunk lấy thống kê listing với dateRange support
export const fetchListingStatistics = createAsyncThunk<
  ListingStatistics,
  {
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
  { rejectValue: string }
>(
  "listings/fetchListingStatistics",
  async ({ id, dateRange, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};

      if (dateRange && dateRange !== "custom") {
        params.dateRange = dateRange;
      } else if (dateRange === "custom" && startDate && endDate) {
        params.dateRange = "custom";
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await api.get(`/listings/statistics/${id}`, { params });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk tăng viewCount
export const incrementViewCount = createAsyncThunk<
  Listing,
  string,
  { rejectValue: string }
>("listings/incrementViewCount", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/listings/${id}/view`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Thunk lấy top listings theo view
export const fetchTopViewedListings = createAsyncThunk<
  Listing[],
  { limit?: number },
  { rejectValue: string }
>(
  "listings/fetchTopViewedListings",
  async ({ limit = 7 }, { rejectWithValue }) => {
    try {
      const res = await api.get("/listings/top/viewed", { params: { limit } });
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : data.listings || [];
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk lấy top listings theo rating
export const fetchTopRatedListings = createAsyncThunk<
  Listing[],
  { limit?: number },
  { rejectValue: string }
>(
  "listings/fetchTopRatedListings",
  async ({ limit = 7 }, { rejectWithValue }) => {
    try {
      const res = await api.get("/listings/top/rated", { params: { limit } });
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : data.listings || [];
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk lấy top listings theo wishlist
export const fetchTopWishlistListings = createAsyncThunk<
  Listing[],
  { limit?: number },
  { rejectValue: string }
>(
  "listings/fetchTopWishlistListings",
  async ({ limit = 7 }, { rejectWithValue }) => {
    try {
      const res = await api.get("/listings/top/wishlist", {
        params: { limit },
      });
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : data.listings || [];
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk tìm kiếm theo availability
export const fetchListingsByAvailability = createAsyncThunk<
  { listings: Listing[]; total: number },
  {
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    min_beds?: number;
    min_bathrooms?: number;
    locationKeyword?: string;
    place_id?: string;
    lat?: number;
    lng?: number;
    [key: string]: unknown;
  },
  { rejectValue: string }
>(
  "listings/fetchListingsByAvailability",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/listings/search/availability", { params });
      const data = res.data.data || res.data;
      const listings =
        data.listings || data.data || (Array.isArray(data) ? data : []);
      const total = data.meta?.total || data.total || listings.length;
      return { listings, total };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Slice
const listingSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    clearListing: (state) => {
      state.listing = undefined;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearListings: (state) => {
      state.listings = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // createListing
      .addCase(createListing.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(
        createListing.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.createLoading = false;
          state.listings.unshift(action.payload);
          state.listing = action.payload;
        }
      )
      .addCase(createListing.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          (action.payload as string) ||
          action.error.message ||
          "Tạo listing thất bại!";
      })

      // fetchListings
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchListings.fulfilled,
        (
          state,
          action: PayloadAction<{ listings: Listing[]; total: number }>
        ) => {
          state.loading = false;
          state.listings = action.payload.listings;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải danh sách listings!";
      })

      // fetchAdminListings
      .addCase(fetchAdminListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminListings.fulfilled,
        (
          state,
          action: PayloadAction<{ listings: Listing[]; total: number }>
        ) => {
          state.loading = false;
          state.listings = action.payload.listings;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchAdminListings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải danh sách listings!";
      })

      // fetchListingById
      .addCase(fetchListingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchListingById.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.loading = false;
          state.listing = action.payload;
        }
      )
      .addCase(fetchListingById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Không tìm thấy listing!";
      })

      // fetchListingByIdForAdmin - không tăng lượt xem
      .addCase(fetchListingByIdForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchListingByIdForAdmin.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.loading = false;
          state.listing = action.payload;
        }
      )
      .addCase(fetchListingByIdForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Không tìm thấy listing!";
      })

      // updateListing
      .addCase(updateListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateListing.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.loading = false;
          state.listing = action.payload;
          // Update in listings array
          const index = state.listings.findIndex(
            (listing) => listing._id === action.payload._id
          );
          if (index !== -1) {
            state.listings[index] = action.payload;
          }
        }
      )
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Cập nhật listing thất bại!";
      })

      // deleteListing
      .addCase(deleteListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteListing.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.listings = state.listings.filter(
            (listing) => listing._id !== action.payload
          );
          if (state.listing?._id === action.payload) {
            state.listing = undefined;
          }
        }
      )
      .addCase(deleteListing.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Xóa listing thất bại!";
      })

      // updateListingStatus
      .addCase(
        updateListingStatus.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.listing = action.payload;
          const index = state.listings.findIndex(
            (listing) => listing._id === action.payload._id
          );
          if (index !== -1) {
            state.listings[index] = action.payload;
          }
        }
      )

      // uploadListingImages
      .addCase(uploadListingImages.pending, (state) => {
        state.uploadImagesLoading = true;
        state.uploadImagesError = null;
        state.uploadedImageUrls = [];
      })
      .addCase(uploadListingImages.fulfilled, (state, action) => {
        state.uploadImagesLoading = false;
        state.uploadedImageUrls = action.payload;
      })
      .addCase(uploadListingImages.rejected, (state, action) => {
        state.uploadImagesLoading = false;
        state.uploadImagesError = action.payload || "Upload ảnh thất bại";
      })

      // restoreListing
      .addCase(
        restoreListing.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          const s = state as ListingState;
          // Cập nhật lại listing trong danh sách nếu có
          const idx = s.listings.findIndex((l) => l._id === action.payload._id);
          if (idx !== -1) {
            s.listings[idx] = action.payload;
          } else {
            s.listings.unshift(action.payload);
          }
          s.listing = action.payload;
        }
      )
      .addCase(restoreListing.rejected, (state, action) => {
        const s = state as ListingState;
        s.error =
          (action.payload as string) ||
          action.error.message ||
          "Khôi phục listing thất bại!";
      })

      // Thống kê listing
      .addCase(fetchListingStatistics.pending, (state) => {
        state.listingStatisticsLoading = true;
        state.listingStatisticsError = null;
      })
      .addCase(fetchListingStatistics.fulfilled, (state, action) => {
        state.listingStatisticsLoading = false;
        state.listingStatistics = action.payload;
      })
      .addCase(fetchListingStatistics.rejected, (state, action) => {
        state.listingStatisticsLoading = false;
        state.listingStatisticsError =
          action.payload || "Lỗi tải thống kê listing";
      })
      // incrementViewCount
      .addCase(incrementViewCount.fulfilled, (state, action) => {
        if (
          action.payload &&
          state.listing &&
          state.listing._id === action.payload._id
        ) {
          state.listing = action.payload;
        }
      })

      // fetchTopViewedListings
      .addCase(fetchTopViewedListings.pending, (state) => {
        state.topListingsLoading = true;
        state.topListingsError = null;
      })
      .addCase(fetchTopViewedListings.fulfilled, (state, action) => {
        state.topListingsLoading = false;
        state.topViewedListings = action.payload;
      })
      .addCase(fetchTopViewedListings.rejected, (state, action) => {
        state.topListingsLoading = false;
        state.topListingsError =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải top viewed listings!";
      })

      // fetchTopRatedListings
      .addCase(fetchTopRatedListings.pending, (state) => {
        state.topListingsLoading = true;
        state.topListingsError = null;
      })
      .addCase(fetchTopRatedListings.fulfilled, (state, action) => {
        state.topListingsLoading = false;
        state.topRatedListings = action.payload;
      })
      .addCase(fetchTopRatedListings.rejected, (state, action) => {
        state.topListingsLoading = false;
        state.topListingsError =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải top rated listings!";
      })

      // fetchTopWishlistListings
      .addCase(fetchTopWishlistListings.pending, (state) => {
        state.topListingsLoading = true;
        state.topListingsError = null;
      })
      .addCase(fetchTopWishlistListings.fulfilled, (state, action) => {
        state.topListingsLoading = false;
        state.topWishlistListings = action.payload;
      })
      .addCase(fetchTopWishlistListings.rejected, (state, action) => {
        state.topListingsLoading = false;
        state.topListingsError =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải top wishlist listings!";
      })

      // fetchListingsByAvailability
      .addCase(fetchListingsByAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchListingsByAvailability.fulfilled,
        (
          state,
          action: PayloadAction<{ listings: Listing[]; total: number }>
        ) => {
          state.loading = false;
          state.listings = action.payload.listings;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchListingsByAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tìm kiếm chỗ ở theo điều kiện!";
      });
  },
});

export const { clearListing, clearCreateError, clearListings } =
  listingSlice.actions;

// Selectors
export const selectListings = (state: RootState) => state.listings.listings;
export const selectListing = (state: RootState) => state.listings.listing;
export const selectListingsLoading = (state: RootState) =>
  state.listings.loading;
export const selectListingsError = (state: RootState) => state.listings.error;
export const selectListingsTotal = (state: RootState) => state.listings.total;
export const selectCreateListingLoading = (state: RootState) =>
  state.listings.createLoading;
export const selectCreateListingError = (state: RootState) =>
  state.listings.createError;
export const selectUploadListingImagesLoading = (state: RootState) =>
  state.listings.uploadImagesLoading;
export const selectUploadListingImagesError = (state: RootState) =>
  state.listings.uploadImagesError;
export const selectUploadedListingImageUrls = (state: RootState) =>
  state.listings.uploadedImageUrls;
export const selectListingStatistics = (state: RootState) =>
  state.listings.listingStatistics;
export const selectListingStatisticsLoading = (state: RootState) =>
  state.listings.listingStatisticsLoading;
export const selectListingStatisticsError = (state: RootState) =>
  state.listings.listingStatisticsError;

// Selectors cho top listings
export const selectTopViewedListings = (state: RootState) =>
  state.listings.topViewedListings;
export const selectTopRatedListings = (state: RootState) =>
  state.listings.topRatedListings;
export const selectTopWishlistListings = (state: RootState) =>
  state.listings.topWishlistListings;
export const selectTopListingsLoading = (state: RootState) =>
  state.listings.topListingsLoading;
export const selectTopListingsError = (state: RootState) =>
  state.listings.topListingsError;

export default listingSlice.reducer;
