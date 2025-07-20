import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { api } from "@/services/api";

export type Review = {
  _id: string;
  user_id?: { _id: string; name?: string };
  rating: number;
  comment: string;
  created_at?: string;
  // ... các trường khác nếu cần
};

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
};

export const fetchReviewsByRoomId = createAsyncThunk<Review[], string>(
  "reviews/fetchByRoomId",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/reviews/rooms/${roomId}`);
      return res.data.data.reviews || [];
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || "Lỗi khi fetch reviews");
      }
      return rejectWithValue("Lỗi khi fetch reviews");
    }
  }
);

export const postReview = createAsyncThunk<
  Review,
  { roomId: string; rating: number; comment: string }
>(
  "reviews/postReview",
  async ({ roomId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/reviews`, {
        room_id: roomId,
        rating,
        comment,
      });
      return res.data.review;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || "Lỗi khi gửi đánh giá");
      }
      return rejectWithValue("Lỗi khi gửi đánh giá");
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByRoomId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByRoomId.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByRoomId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Thêm xử lý cho postReview
      .addCase(postReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.loading = false;
        // Thêm review mới vào đầu danh sách
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(postReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectReviews = (state: RootState) => state.reviews.reviews;
export const selectReviewsLoading = (state: RootState) => state.reviews.loading;
export const selectReviewsError = (state: RootState) => state.reviews.error;

export default reviewSlice.reducer;
