import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { RootState } from "../index";
import { Listing } from "@/types/listing";

export interface WishlistState {
  loading: boolean;
  error: string | null;
  data: WishlistItem[];
}

const initialState: WishlistState = {
  loading: false,
  error: null,
  data: [],
};

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

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleWishlistRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlistRoom.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(
        toggleWishlistRoom.rejected,
        (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      )
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<WishlistItem[]>) => {
          state.loading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(
        fetchWishlist.rejected,
        (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  },
});

// Selectors
// Lưu ý: Đảm bảo đã thêm wishlist: wishlistReducer vào rootReducer trong store/index.ts
export const selectWishlistLoading = (state: RootState) =>
  state.wishlist.loading;
export const selectWishlistError = (state: RootState) => state.wishlist.error;

export default wishlistSlice.reducer;
