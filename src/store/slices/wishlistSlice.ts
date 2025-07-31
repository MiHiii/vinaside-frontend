import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { RootState } from "../index";
import { Listing } from "@/types/listing";
import { AdminQueryWishlistDto } from "@/services/wishlistApi";

export interface WishlistState {
  loading: boolean;
  error: string | null;
  data: WishlistItem[];
  // Admin state
  adminWishlists: AdminWishlistItem[];
  adminStatistics: WishlistStatistics | null;
  adminLoading: boolean;
  adminError: string | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

const initialState: WishlistState = {
  loading: false,
  error: null,
  data: [],
  // Admin state
  adminWishlists: [],
  adminStatistics: null,
  adminLoading: false,
  adminError: null,
  totalPages: 1,
  currentPage: 1,
  totalItems: 0,
};

export interface WishlistItem {
  _id: string;
  room_id: {
    _id: string;
    title: string;
    images: string[];
    price_per_night: number;
    guests: number;
    max_guests: number;
    average_rating: number;
    reviews_count: number;
  };
}

export interface AdminWishlistItem {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  } | null;
  room_id: {
    _id: string;
    title: string;
    images: string[];
    price_per_night: number;
    guests: number;
    max_guests: number;
    average_rating: number;
    reviews_count: number;
    location?: {
      address: string;
    };
  };
  isDelete: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface WishlistStatistics {
  topRooms: Array<{
    _id: string;
    count: number;
    roomInfo: {
      _id: string;
      title: string;
      images: string[];
    };
  }>;
  topUsers: Array<{
    _id: string;
    count: number;
    userInfo: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
  last7Days: number;
  summary: {
    totalTopRooms: number;
    totalTopUsers: number;
    recentActivity: number;
  };
}

// User thunks
export const toggleWishlistRoom = createAsyncThunk<
  unknown,
  string,
  { rejectValue: string }
>("wishlist/toggleWishlistRoom", async (roomId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/wishlists/rooms/${roomId}/toggle`);
    return res.data;
  } catch (err: unknown) {
    let message = "Có lỗi khi cập nhật trạng thái yêu thích!";
    if (err && typeof err === "object" && "response" in err) {
      // @ts-expect-error: axios error shape
      message = err.response?.data?.message || message;
    }
    return rejectWithValue(message);
  }
});

export const toggleWishlistAndFetchListings = createAsyncThunk<
  Listing[],
  string,
  { rejectValue: string }
>(
  "wishlist/toggleWishlistAndFetchListings",
  async (roomId, { rejectWithValue }) => {
    try {
      await api.post(`/wishlists/rooms/${roomId}/toggle`);
      const res = await api.get("/listings", { params: { limit: 14 } });
      return res.data.data.listings || res.data.data || [];
    } catch {
      return rejectWithValue("Có lỗi khi cập nhật trạng thái yêu thích!");
    }
  }
);

export const fetchWishlist = createAsyncThunk<
  WishlistItem[],
  void,
  { rejectValue: string }
>("wishlist/fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/wishlists");
    return res.data.data.data || [];
  } catch {
    return rejectWithValue("Không thể tải danh sách yêu thích");
  }
});

export const removeWishlist = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("wishlist/removeWishlist", async (wishlistId, { rejectWithValue }) => {
  try {
    await api.delete(`/wishlists/${wishlistId}`);
    return wishlistId;
  } catch {
    return rejectWithValue("Xóa wishlist thất bại");
  }
});

// Admin thunks
export const fetchAdminWishlists = createAsyncThunk<
  {
    wishlists: AdminWishlistItem[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  },
  AdminQueryWishlistDto,
  { rejectValue: string }
>('wishlist/fetchAdminWishlists', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/admin/wishlists", { params });
    const responseData = res.data.data; // Access nested data
    return {
      wishlists: responseData.data,
      totalPages: responseData.meta.totalPages,
      currentPage: responseData.meta.page,
      totalItems: responseData.meta.total
    };
  } catch  {
    return rejectWithValue("Không thể tải danh sách wishlist");
  }
});

export const fetchWishlistStatistics = createAsyncThunk<
  WishlistStatistics,
  void,
  { rejectValue: string }
>("wishlist/fetchWishlistStatistics", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/admin/wishlists/statistics");
    console.log('API Response:', res.data);
    console.log('Nested data:', res.data.data);
    console.log('Final data:', res.data.data.data);
    return res.data.data.data; // Access nested data structure
  } catch {
    return rejectWithValue("Không thể tải thống kê wishlist");
  }
});

export const forceDeleteWishlist = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("wishlist/forceDeleteWishlist", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/wishlists/${id}`);
    return id;
  } catch  {
    return rejectWithValue("Xóa wishlist thất bại");
  }
});

export const restoreWishlist = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("wishlist/restoreWishlist", async (id, { rejectWithValue }) => {
  try {
    await api.put(`/admin/wishlists/${id}/restore`);
    return id;
  } catch  {
    return rejectWithValue("Khôi phục wishlist thất bại");
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearAdminError: (state) => {
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // User thunks
      .addCase(toggleWishlistRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlistRoom.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleWishlistRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Có lỗi xảy ra";
      })
      .addCase(toggleWishlistAndFetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlistAndFetchListings.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleWishlistAndFetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Có lỗi xảy ra";
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Có lỗi xảy ra";
      })
      .addCase(removeWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(item => item._id !== action.payload);
      })
      .addCase(removeWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Có lỗi xảy ra";
      })
      // Admin thunks
      .addCase(fetchAdminWishlists.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminWishlists.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminWishlists = action.payload.wishlists;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAdminWishlists.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload || "Có lỗi xảy ra";
      })
      .addCase(fetchWishlistStatistics.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchWishlistStatistics.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminStatistics = action.payload;
      })
      .addCase(fetchWishlistStatistics.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload || "Có lỗi xảy ra";
      })
      .addCase(forceDeleteWishlist.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(forceDeleteWishlist.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminWishlists = state.adminWishlists.filter(item => item._id !== action.payload);
        state.totalItems -= 1;
      })
      .addCase(forceDeleteWishlist.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload || "Có lỗi xảy ra";
      })
      .addCase(restoreWishlist.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(restoreWishlist.fulfilled, (state, action) => {
        state.adminLoading = false;
        const wishlist = state.adminWishlists.find(item => item._id === action.payload);
        if (wishlist) {
          wishlist.isDelete = false;
        }
      })
      .addCase(restoreWishlist.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload || "Có lỗi xảy ra";
      });
  },
});

export const { setCurrentPage, clearAdminError } = wishlistSlice.actions;

// Selectors
export const selectWishlistData = (state: RootState) => state.wishlist.data;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;
export const selectWishlistError = (state: RootState) => state.wishlist.error;

// Admin selectors
export const selectAdminWishlists = (state: RootState) => state.wishlist.adminWishlists;
export const selectAdminWishlistLoading = (state: RootState) => state.wishlist.adminLoading;
export const selectAdminWishlistError = (state: RootState) => state.wishlist.adminError;
export const selectWishlistStatistics = (state: RootState) => state.wishlist.adminStatistics;
export const selectWishlistPagination = (state: RootState) => ({
  currentPage: state.wishlist.currentPage,
  totalPages: state.wishlist.totalPages,
  totalItems: state.wishlist.totalItems,
});

export default wishlistSlice.reducer;
