import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { RootState } from "..";
import { getErrorMessage } from "@/helper/message";
import { Listing, CreateListingDto, UpdateListingDto, QueryListingDto } from "@/types/listing";

// Thêm type cho thống kê listing
export interface ListingStatistics {
  listingId: string;
  listingTitle: string;
  businessPerformance: {
    totalBookings: number;
    occupancyRate: number;
    monthlyRevenue: number;
    cancellationRate: number;
    returningGuests: number;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    recentComment: string;
  };
  engagement: {
    viewCount: number;
    wishlistCount: number;
  };
  voucherImpact: {
    totalDiscountAmount: number;
    mostPopularVoucher: string;
  };
  // Thêm trường doanh thu theo ngày cho biểu đồ
  revenueByDate?: { date: string; revenue: number }[];
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
};

// Async thunks
export const createListing = createAsyncThunk<Listing, CreateListingDto, { rejectValue: string }>(
  "listings/createListing",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/listings", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchListings = createAsyncThunk<
  { listings: Listing[]; total: number },
  QueryListingDto,
  { rejectValue: string }
>("listings/fetchListings", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/listings", { params });
    const data = res.data.data || res.data;
    const listings = data.listings || data.data || (Array.isArray(data) ? data : []);
    const total = data.meta?.total || data.total || listings.length;
    return {
      listings,
      total,
    };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchListingById = createAsyncThunk<Listing, string, { rejectValue: string }>(
  "listings/fetchListingById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/listings/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateListing = createAsyncThunk<Listing, { id: string } & UpdateListingDto, { rejectValue: string }>(
  "listings/updateListing",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      // Lấy propertyId từ data
      const propertyId = typeof data.propertyId === "object" && data.propertyId !== null ? data.propertyId._id : data.propertyId;
      const res = await api.put(`/listings/property/${propertyId}/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteListing = createAsyncThunk<string, string, { rejectValue: string }>(
  "listings/deleteListing",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/listings/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateListingStatus = createAsyncThunk<Listing, { id: string; status: string }, { rejectValue: string }>(
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

export const uploadListingImages = createAsyncThunk<string[], File[], { rejectValue: string }>(
  "listings/uploadListingImages",
  async (files, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await api.post("/upload/multiple", formData);
      return res.data.data.urls;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const restoreListing = createAsyncThunk<Listing, string, { rejectValue: string }>(
  "listings/restoreListing",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/listings/${id}/restore`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Thunk lấy thống kê listing
export const fetchListingStatistics = createAsyncThunk<
  ListingStatistics,
  { id: string; startDate?: string; endDate?: string },
  { rejectValue: string }
>(
  'listings/fetchListingStatistics',
  async ({ id, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/listings/statistics/${id}`, {
        params: { startDate, endDate }
      });
      return res.data.data;
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
  },
  extraReducers: (builder) => {
    builder
      // createListing
      .addCase(createListing.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createListing.fulfilled, (state, action: PayloadAction<Listing>) => {
        state.createLoading = false;
        state.listings.unshift(action.payload);
        state.listing = action.payload;
      })
      .addCase(createListing.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = (action.payload as string) || action.error.message || "Tạo listing thất bại!";
      })

      // fetchListings
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action: PayloadAction<{ listings: Listing[]; total: number }>) => {
        state.loading = false;
        state.listings = action.payload.listings;
        state.total = action.payload.total;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Lỗi tải danh sách listings!";
      })

      // fetchListingById
      .addCase(fetchListingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListingById.fulfilled, (state, action: PayloadAction<Listing>) => {
        state.loading = false;
        state.listing = action.payload;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Không tìm thấy listing!";
      })

      // updateListing
      .addCase(updateListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateListing.fulfilled, (state, action: PayloadAction<Listing>) => {
        state.loading = false;
        state.listing = action.payload;
        // Update in listings array
        const index = state.listings.findIndex(listing => listing._id === action.payload._id);
        if (index !== -1) {
          state.listings[index] = action.payload;
        }
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Cập nhật listing thất bại!";
      })

      // deleteListing
      .addCase(deleteListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteListing.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.listings = state.listings.filter(listing => listing._id !== action.payload);
        if (state.listing?._id === action.payload) {
          state.listing = undefined;
        }
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Xóa listing thất bại!";
      })

      // updateListingStatus
      .addCase(updateListingStatus.fulfilled, (state, action: PayloadAction<Listing>) => {
        state.listing = action.payload;
        const index = state.listings.findIndex(listing => listing._id === action.payload._id);
        if (index !== -1) {
          state.listings[index] = action.payload;
        }
      })

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
      .addCase(restoreListing.fulfilled, (state, action: PayloadAction<Listing>) => {
        const s = state as ListingState;
        // Cập nhật lại listing trong danh sách nếu có
        const idx = s.listings.findIndex(l => l._id === action.payload._id);
        if (idx !== -1) {
          s.listings[idx] = action.payload;
        } else {
          s.listings.unshift(action.payload);
        }
        s.listing = action.payload;
      })
      .addCase(restoreListing.rejected, (state, action) => {
        const s = state as ListingState;
        s.error = (action.payload as string) || action.error.message || "Khôi phục listing thất bại!";
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
        state.listingStatisticsError = action.payload || 'Lỗi tải thống kê listing';
      });
  },
});

export const { clearListing, clearCreateError } = listingSlice.actions;

// Selectors
export const selectListings = (state: RootState) => state.listings.listings;
export const selectListing = (state: RootState) => state.listings.listing;
export const selectListingsLoading = (state: RootState) => state.listings.loading;
export const selectListingsError = (state: RootState) => state.listings.error;
export const selectListingsTotal = (state: RootState) => state.listings.total;
export const selectCreateListingLoading = (state: RootState) => state.listings.createLoading;
export const selectCreateListingError = (state: RootState) => state.listings.createError;
export const selectUploadListingImagesLoading = (state: RootState) => state.listings.uploadImagesLoading;
export const selectUploadListingImagesError = (state: RootState) => state.listings.uploadImagesError;
export const selectUploadedListingImageUrls = (state: RootState) => state.listings.uploadedImageUrls;
export const selectListingStatistics = (state: RootState) => state.listings.listingStatistics;
export const selectListingStatisticsLoading = (state: RootState) => state.listings.listingStatisticsLoading;
export const selectListingStatisticsError = (state: RootState) => state.listings.listingStatisticsError;

export default listingSlice.reducer; 