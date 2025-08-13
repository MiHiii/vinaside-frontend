import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BookingCalendar } from "@/components/ui/BookingCalendar";
import { CalendarFilter } from "@/components/ui/CalendarFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { BookingHeader } from "@/components/admin/booking/BookingHeader";
import { calendarApi, CalendarQueryParams } from "@/services/calendarApi";
import {
  fetchProperties,
  selectProperties,
} from "@/store/slices/propertySlice";

interface Booking {
  _id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  property_name: string;
  status: string;
  total_amount: number;
}

interface CalendarData {
  startDate: string;
  endDate: string;
  viewType: string;
  days: Array<{
    date: string;
    dayOfWeek: string;
    isToday: boolean;
    isWeekend: boolean;
    bookings: Booking[];
    totalBookings: number;
    totalRevenue: number;
  }>;
  totalBookings: number;
  totalRevenue: number;
  averageOccupancy: number;
}

export const BookingCalendarPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    viewType: "monthly" as const,
    propertyId: "all",
    listingId: "all",
    status: "all",
    paymentStatus: "all",
    search: "",
  });

  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);

  // Lấy properties từ Redux store
  const propertiesFromStore = useAppSelector(selectProperties);
  const properties = propertiesFromStore.map((property) => ({
    _id: property._id || property.id,
    name: property.name,
  }));

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // Tính toán startDate và endDate cho tháng hiện tại
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const params: CalendarQueryParams = {
        viewType: filters.viewType,
        startDate,
        endDate,
        propertyId: filters.propertyId || undefined,
        listingId: filters.listingId || undefined,
        status: filters.status || undefined,
        payment_status: filters.paymentStatus || undefined,
        search: filters.search || undefined,
      };

      const data = await calendarApi.getCalendarData(params);
      setCalendarData(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch properties và calendar data
  useEffect(() => {
    // Fetch properties nếu chưa có
    if (propertiesFromStore.length === 0) {
      dispatch(fetchProperties({ limit: 100 }));
    }

    fetchCalendarData();
  }, [filters, dispatch, propertiesFromStore.length, fetchCalendarData]);

  const handleDayClick = (_date: string) => {
    // TODO: Open day detail modal or navigate to day view
  };

  const handleBookingClick = (bookingId: string, propertyId: string) => {
    navigate(`/admin/bookings/${propertyId}/${bookingId}`);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <BookingHeader
        title="Quản lý Booking"
        subtitle="Xem và quản lý tất cả booking theo lịch"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng Booking
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {calendarData?.totalBookings || 0}
                </p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calendarData?.totalRevenue?.toLocaleString("vi-VN") || 0}đ
                </p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tỷ lệ lấp đầy
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {((calendarData?.averageOccupancy || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-gray-400 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CalendarFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        properties={properties}
      />

      {/* Calendar */}
      <div className="mb-6">
        <BookingCalendar
          viewType={filters.viewType}
          propertyId={filters.propertyId}
          listingId={filters.listingId}
          onDayClick={handleDayClick}
          onBookingClick={handleBookingClick}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}
    </div>
  );
};
