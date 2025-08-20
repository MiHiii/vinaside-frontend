import { api } from "./api";

export interface CalendarQueryParams {
  viewType?: "month" | "week" | "day" | "today";
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  listingId?: string;
  status?: string;
  payment_status?: string;
  keyword?: string;
  guestName?: string;
  listingTitle?: string;
  propertyName?: string;
}

export interface CalendarDay {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  isWeekend: boolean;
  bookings: Booking[];
  totalBookings: number;
  totalRevenue: number;
}

export interface CalendarData {
  startDate: string;
  endDate: string;
  viewType: string;
  days: CalendarDay[];
  totalBookings: number;
  totalRevenue: number;
  averageOccupancy: number;
}

export interface Booking {
  _id: string;
  propertyId?: string;
  property_id?: string;
  property?: {
    _id?: string;
    id?: string;
  };
  listingId?: {
    propertyId?: string;
    property_id?: string;
    property?: {
      _id?: string;
      id?: string;
    };
  };
  check_in: string;
  check_out: string;
  checkInDate?: string;
  checkOutDate?: string;
  guest_name: string;
  guest_email?: string;
  guests?: number;
  property_name: string;
  listing_title?: string;
  status: string;
  total_amount: number;
  final_amount?: number;
  payment_status: string;
  additionalCost?: number;
}

export interface DayDetail {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  isWeekend: boolean;
  bookings: Booking[];
  totalBookings: number;
  totalRevenue: number;
}

export const calendarApi = {
  // Lấy dữ liệu calendar từ API calendar mới
  getCalendarData: async (
    params: CalendarQueryParams
  ): Promise<CalendarData> => {
    try {
      // Sử dụng API calendar mới
      const queryParams = new URLSearchParams();

      // Thêm các filter
      if (params.viewType) {
        queryParams.append("viewType", params.viewType);
      }
      if (params.startDate) {
        queryParams.append("startDate", params.startDate);
      }
      if (params.endDate) {
        queryParams.append("endDate", params.endDate);
      }
      if (params.propertyId && params.propertyId !== "all") {
        queryParams.append("propertyId", params.propertyId);
      }
      if (params.listingId && params.listingId !== "all") {
        queryParams.append("listingId", params.listingId);
      }
      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }
      if (params.payment_status && params.payment_status !== "all") {
        queryParams.append("paymentStatus", params.payment_status);
      }
      if (params.keyword) queryParams.append("keyword", params.keyword);
      if (params.guestName) queryParams.append("guestName", params.guestName);
      if (params.listingTitle)
        queryParams.append("listingTitle", params.listingTitle);
      if (params.propertyName)
        queryParams.append("propertyName", params.propertyName);

      // Sử dụng API calendar mới
      const endpoint = "/bookings/calendar";
      console.log(
        "📅 Calendar API URL:",
        `${endpoint}?${queryParams.toString()}`
      );

      const response = await api.get(`${endpoint}?${queryParams.toString()}`);

      console.log("📅 Calendar API response:", response.data);
      console.log("📅 Calendar API status:", response.status);

      // API đã trả về đúng format, chỉ cần return data
      if (response.data.success && response.data.data) {
        console.log("📅 Calendar data received:", response.data.data);
        return response.data.data;
      }

      // Fallback nếu API không trả về đúng format
      console.log("📅 API response format not as expected, using fallback...");
      return {
        startDate: params.startDate || new Date().toISOString().split("T")[0],
        endDate: params.endDate || new Date().toISOString().split("T")[0],
        viewType: params.viewType || "monthly",
        days: [],
        totalBookings: 0,
        totalRevenue: 0,
        averageOccupancy: 0,
      };
    } catch (error) {
      console.error("❌ Error fetching calendar data:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Return empty calendar data
      return {
        startDate: params.startDate || new Date().toISOString().split("T")[0],
        endDate: params.endDate || new Date().toISOString().split("T")[0],
        viewType: params.viewType || "monthly",
        days: [],
        totalBookings: 0,
        totalRevenue: 0,
        averageOccupancy: 0,
      };
    }
  },

  // Lấy chi tiết theo ngày
  getDayBookings: async (
    date: string,
    params?: { propertyId?: string }
  ): Promise<DayDetail> => {
    const queryParams = new URLSearchParams();
    if (params?.propertyId && params.propertyId !== "all") {
      queryParams.append("propertyId", params.propertyId);
    }

    const response = await api.get(
      `/bookings/calendar/day/${date}?${queryParams.toString()}`
    );

    // API trả về format mới
    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return response.data;
  },

  // Lấy booking theo tuần (cho widget)
  getWeekBookings: async (
    startDate: string,
    endDate: string,
    propertyId?: string
  ): Promise<Booking[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", startDate);
    queryParams.append("endDate", endDate);
    if (propertyId) queryParams.append("propertyId", propertyId);

    const response = await api.get(
      `/bookings/calendar/week?${queryParams.toString()}`
    );
    return response.data.bookings || [];
  },

  // Lấy thống kê calendar
  getCalendarStats: async (
    params: CalendarQueryParams
  ): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageOccupancy: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  }> => {
    const queryParams = new URLSearchParams();

    if (params.viewType) queryParams.append("viewType", params.viewType);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.propertyId) queryParams.append("propertyId", params.propertyId);
    if (params.listingId) queryParams.append("listingId", params.listingId);

    const response = await api.get(
      `/bookings/calendar/stats?${queryParams.toString()}`
    );
    return response.data;
  },
};
