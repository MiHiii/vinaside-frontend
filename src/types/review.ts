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

export interface ReviewStatistics {
  total: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  recentReviews: number;
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

export interface QueryReviewDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  rating?: number;
  roomId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
} 