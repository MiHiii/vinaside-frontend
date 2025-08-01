import { api } from "./api";

export interface WishlistItem {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
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
      city?: string;
      district?: string;
    };
  };
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface AdminQueryWishlistDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  user_id?: string;
  room_id?: string;
  from_date?: string;
  to_date?: string;
  isDelete?: boolean;
}

export const wishlistApi = {
  // User endpoints
  toggleFavorite: (roomId: string) => {
    return api.post(`/wishlists/rooms/${roomId}/toggle`);
  },

  getMyWishlists: (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => {
    return api.get("/wishlists", { params });
  },

  removeWishlist: (id: string) => {
    return api.delete(`/wishlists/${id}`);
  },

  checkFavorite: (roomId: string) => {
    return api.get(`/wishlists/rooms/${roomId}/check`);
  },

  // Admin endpoints
  getAllWishlists: (params: AdminQueryWishlistDto) => {
    return api.get("/admin/wishlists", { params });
  },

  getStatistics: () => {
    return api.get("/admin/wishlists/statistics");
  },

  forceDelete: (id: string) => {
    return api.delete(`/admin/wishlists/${id}`);
  },

  restore: (id: string) => {
    return api.put(`/admin/wishlists/${id}/restore`);
  },
}; 