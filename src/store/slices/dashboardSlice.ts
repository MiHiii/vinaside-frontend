import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { addDays } from "date-fns";

// Dashboard interfaces based on actual API response
export interface RevenueChartDataItem {
  date: string;
  totalRevenue: number;
}

export interface RevenueChartData {
  data: RevenueChartDataItem[];
  totalRevenue: number;
  averageDailyRevenue: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface DashboardData {
  overview: {
    totalUsers: number;
    usersByRole: {
      guest: number;
      staff: number;
      admin: number;
    };
    newUsersLast30Days: number;
    totalProperties: number;
    activeProperties: number;
    verifiedProperties: number;
    propertiesByStatus: {
      active: number;
      inactive: number;
      pending: number;
    };
    totalListings: number;
    activeListings: number;
    averagePricePerNight: number;
    listingsByStatus: {
      active: number;
      inactive: number;
    };
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    bookingsByStatus: {
      pending: number;
      confirmed: number;
      cancelled: number;
      completed: number;
      rejected: number;
    };
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
    totalVouchers: number;
    activeVouchers: number;
    usedVouchers: number;
    totalVoucherDiscount: number;
    totalServices: number;
    activeServices: number;
    totalServicesRevenue: number;
    totalMessages: number;
    totalConversations: number;
    totalReactions: number;
    totalWishlists: number;
    totalWishlistItems: number;
  };
  financial: {
    totalRevenue: number;
    totalServiceFees: number;
    totalTaxAmount: number;
    totalRefunds: number;
    netRevenue: number;
    totalVoucherDiscount: number;
    totalRevenueBeforeVoucher: number;
    voucherDiscountPercentage: number;
    totalServicesRevenue: number;
    servicesRevenuePercentage: number;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      bookings: number;
      voucherDiscount: number;
      servicesRevenue: number;
    }>;
    topPropertiesByRevenue: Array<{
      propertyId: string;
      propertyName: string;
      revenue: number;
      bookings: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageNightsPerBooking: number;
    averageGuestsPerBooking: number;
    customersUsingVouchers: number;
    customersUsingServices: number;
    topCustomers: Array<{
      customerId: string;
      customerName: string;
      totalBookings: number;
      totalSpent: number;
    }>;
    averageRating: number;
    totalReviews: number;
    positiveReviews: number;
    negativeReviews: number;
  };
  timeline: {
    bookingsByDay: Array<{
      date: string;
      bookings: number;
      revenue: number;
    }>;
    bookingsByWeek: Array<{
      week: string;
      bookings: number;
      revenue: number;
    }>;
    bookingsByMonth: Array<{
      month: string;
      bookings: number;
      revenue: number;
    }>;
    newUsersByMonth: Array<{
      month: string;
      count: number;
    }>;
    newPropertiesByMonth: Array<{
      month: string;
      count: number;
    }>;
    reviewsByMonth: Array<{
      month: string;
      count: number;
    }>;
  };
  performance: {
    averageOccupancyRate: number;
    occupancyByProperty: Array<{
      propertyId: string;
      propertyName: string;
      occupancyRate: number;
    }>;
    averageAdvanceBookingDays: number;
    averageStayDuration: number;
    voucherUsageRate: number;
    averageVoucherDiscount: number;
    topVouchers: Array<{
      voucherId: string;
      voucherCode: string;
      usageCount: number;
      totalDiscount: number;
    }>;
    averageServicesPerBooking: number;
    topServices: Array<{
      serviceId: string;
      serviceName: string;
      usageCount: number;
      totalRevenue: number;
    }>;
  };
  realTime: {
    onlineUsers: number;
    activeBookings: number;
    pendingBookings: number;
    recentMessages: number;
    recentReviews: number;
    recentVoucherUsage: number;
  };
}

export type DashboardStatistics = DashboardData;
export type DashboardOverview = DashboardData;
export interface DashboardRealTime {
  onlineUsers: number;
  activeBookings: number;
  pendingBookings: number;
  recentMessages: number;
  recentReviews: number;
  recentVoucherUsage: number;
}

interface DashboardState {
  statistics: DashboardStatistics | null;
  overview: DashboardOverview | null;
  realTimeData: DashboardRealTime | null;
  revenueChartData: RevenueChartData | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  dateRangeType:
    | "today"
    | "last_7_days"
    | "last_15_days"
    | "last_30_days"
    | "custom";
  selectedPropertyId: string | null;
}

const initialState: DashboardState = {
  statistics: null,
  overview: null,
  realTimeData: null,
  revenueChartData: null,
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  dateRangeType: "today",
  selectedPropertyId: null,
};

// Async thunks
export const fetchDashboardStatistics = createAsyncThunk(
  "dashboard/fetchStatistics",
  async (params: {
    dateRange?:
      | "today"
      | "last_7_days"
      | "last_15_days"
      | "last_30_days"
      | "custom";
    startDate?: string;
    endDate?: string;
    propertyId?: string | null;
  }) => {
    const { dateRange, startDate, endDate, propertyId } = params;

    const queryParams = new URLSearchParams();
    if (dateRange) queryParams.append("dateRange", dateRange);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (propertyId) queryParams.append("propertyId", propertyId);

    const response = await api.get(
      `/dashboard/statistics?${queryParams.toString()}`
    );
    console.log("API Response:", response.data);
    return response.data.data;
  }
);

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchOverview",
  async (params: {
    dateRange?:
      | "today"
      | "last_7_days"
      | "last_15_days"
      | "last_30_days"
      | "custom";
    startDate?: string;
    endDate?: string;
    propertyId?: string | null;
  }) => {
    const { dateRange, startDate, endDate, propertyId } = params;

    const queryParams = new URLSearchParams();
    if (dateRange) queryParams.append("dateRange", dateRange);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (propertyId) queryParams.append("propertyId", propertyId);

    const response = await api.get(
      `/dashboard/overview?${queryParams.toString()}`
    );
    return response.data.data;
  }
);

export const fetchRealTimeData = createAsyncThunk(
  "dashboard/fetchRealTime",
  async (params: {
    dateRange?:
      | "today"
      | "last_7_days"
      | "last_15_days"
      | "last_30_days"
      | "custom";
    startDate?: string;
    endDate?: string;
    propertyId?: string | null;
  }) => {
    const { dateRange, startDate, endDate, propertyId } = params;

    const queryParams = new URLSearchParams();
    if (dateRange) queryParams.append("dateRange", dateRange);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (propertyId) queryParams.append("propertyId", propertyId);

    const response = await api.get(
      `/dashboard/realtime?${queryParams.toString()}`
    );
    return response.data.data;
  }
);

export const fetchRevenueChartData = createAsyncThunk(
  "dashboard/fetchRevenueChart",
  async (params: {
    dateRange?:
      | "today"
      | "last_7_days"
      | "last_15_days"
      | "last_30_days"
      | "custom";
    startDate?: string;
    endDate?: string;
    propertyId?: string | null;
  }) => {
    const { dateRange, startDate, endDate, propertyId } = params;

    const queryParams = new URLSearchParams();
    if (dateRange) queryParams.append("dateRange", dateRange);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (propertyId) queryParams.append("propertyId", propertyId);

    const response = await api.get(
      `/dashboard/revenue-chart?${queryParams.toString()}`
    );
    return response.data.data;
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setDateRangeType: (state, action) => {
      state.dateRangeType = action.payload;
    },
    setSelectedProperty: (state, action) => {
      state.selectedPropertyId = action.payload;
    },
    clearDashboardData: (state) => {
      state.statistics = null;
      state.overview = null;
      state.realTimeData = null;
      state.revenueChartData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDashboardStatistics
    builder
      .addCase(fetchDashboardStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchDashboardStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch dashboard statistics";
      });

    // fetchDashboardOverview
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch dashboard overview";
      });

    // fetchRealTimeData
    builder
      .addCase(fetchRealTimeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRealTimeData.fulfilled, (state, action) => {
        state.loading = false;
        state.realTimeData = action.payload;
      })
      .addCase(fetchRealTimeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch real-time data";
      });

    // fetchRevenueChartData
    builder
      .addCase(fetchRevenueChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueChartData = action.payload;
      })
      .addCase(fetchRevenueChartData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch revenue chart data";
      });
  },
});

export const {
  setDateRange,
  setDateRangeType,
  setSelectedProperty,
  clearDashboardData,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
