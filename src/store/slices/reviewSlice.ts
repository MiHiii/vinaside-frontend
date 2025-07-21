import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/services/api';

const initialState: ReviewState = {
  reviews: [],
  statistics: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  totalItems: 0,
};

// Thunks
export const fetchAdminReviews = createAsyncThunk(
  'reviews/fetchAdminReviews',
  async (params: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const res = await api.get('/reviews/admin/all', { params });
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách đánh giá');
    }
  }
);

export const fetchReviewStatistics = createAsyncThunk(
  'reviews/fetchStatistics', 
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/reviews/admin/statistics');
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thống kê đánh giá');
    }
  }
);

export const searchReviews = createAsyncThunk(
  'reviews/search',
  async (params: { search: string }, { rejectWithValue }) => {
    try {
      const res = await api.get('/reviews/admin/search', { params });
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tìm kiếm đánh giá');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/admin/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa đánh giá');
    }
  }
);

// Thunk fetch reviews by roomId (dùng cho RoomReviews, ListingDetail)
export const fetchReviewsByRoomId = createAsyncThunk<Review[], string>(
  'reviews/fetchByRoomId',
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/reviews/rooms/${roomId}`);
      // Map lại dữ liệu từ snake_case sang camelCase
      const reviews = (res.data.data.reviews || []).map((r: Record<string, unknown>) => ({
        ...r,
        user: r.user_id,
        room: r.room_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
      return reviews;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi fetch reviews');
    }
  }
);

// Thunk post review (dùng cho RoomReviews)
export const postReview = createAsyncThunk<
  Review,
  { roomId: string; rating: number; comment: string }
>(
  'reviews/postReview',
  async ({ roomId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/reviews`, {
        room_id: roomId,
        rating,
        comment,
      });
      return res.data.review;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    }
  }
);

// Thêm interface cho statistics
export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  room: {
    _id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewState {
  reviews: Review[];
  statistics: ReviewStatistics | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchAdminReviews
    builder
      .addCase(fetchAdminReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.loading = false;
        // Map dữ liệu từ snake_case và gán vào state
        state.reviews = (action.payload.data?.reviews || []).map((r: Record<string, unknown>) => ({
          ...r,
          user: r.user_id,
          room: r.room_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        // Lấy meta từ đúng vị trí
        if (action.payload.data?.meta) {
          const { total, page, limit } = action.payload.data.meta;
          state.totalItems = total || 0;
          state.currentPage = page || 1;
          state.totalPages = total ? Math.ceil(total / (limit || 10)) : 1;
        }
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchReviewStatistics
    builder
      .addCase(fetchReviewStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.data?.statistics || null;
      })
      .addCase(fetchReviewStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // searchReviews
    builder
      .addCase(searchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchReviews.fulfilled, (state, action) => {
        state.loading = false;
        // Map dữ liệu từ snake_case và gán vào state
        state.reviews = (action.payload.data?.reviews || []).map((r: Record<string, unknown>) => ({
          ...r,
          user: r.user_id,
          room: r.room_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        // Lấy meta từ đúng vị trí
        if (action.payload.data?.meta) {
          const { total, page, limit } = action.payload.data.meta;
          state.totalItems = total || 0;
          state.currentPage = page || 1;
          state.totalPages = total ? Math.ceil(total / (limit || 10)) : 1;
        }
      })
      .addCase(searchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteReview
    builder
      .addCase(deleteReview.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((review: Review) => review._id !== action.payload);
        if (state.statistics) {
          state.statistics.totalReviews = Math.max(0, state.statistics.totalReviews - 1);
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // fetchReviewsByRoomId
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
      });

    // postReview
    builder
      .addCase(postReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(postReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPage } = reviewSlice.actions;

// Selectors
export const selectReviews = (state: { reviews: ReviewState }) => state.reviews.reviews;
export const selectReviewsLoading = (state: { reviews: ReviewState }) => state.reviews.loading;
export const selectReviewsError = (state: { reviews: ReviewState }) => state.reviews.error;

export default reviewSlice.reducer;
