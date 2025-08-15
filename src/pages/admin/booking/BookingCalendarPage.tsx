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
import { useUserRole } from "@/hooks/useUserRole";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";

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
  const { isStaff, user } = useUserRole();

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
  const [staffProperties, setStaffProperties] = useState<any[]>([]);

  // Lấy properties từ Redux store
  const propertiesFromStore = useAppSelector(selectProperties);

  // Lọc properties cho staff
  const properties = React.useMemo(() => {
    if (isStaff) {
      return staffProperties
        .map((property) => ({
          _id: property.propertyId?._id || property.propertyId?.id,
          name: property.propertyId?.name,
        }))
        .filter(Boolean);
    }
    return propertiesFromStore.map((property) => ({
      _id: property._id || property.id,
      name: property.name,
    }));
  }, [isStaff, staffProperties, propertiesFromStore]);

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

      let propertyId = filters.propertyId;

      // For staff users, always get assigned properties
      if (isStaff && user?._id) {
        if (filters.propertyId === "all" && staffProperties.length > 0) {
          const staffPropertyIds = staffProperties
            .map(
              (item: { propertyId?: { _id: string } }) => item.propertyId?._id
            )
            .filter(Boolean);

          if (staffPropertyIds.length > 1) {
            propertyId = staffPropertyIds.join(",");
          } else {
            propertyId = staffPropertyIds[0] || "all";
          }
        }
      }

      const params: CalendarQueryParams = {
        viewType: filters.viewType,
        startDate,
        endDate,
        propertyId: propertyId === "all" ? undefined : propertyId,
        listingId: filters.listingId === "all" ? undefined : filters.listingId,
        status: filters.status === "all" ? undefined : filters.status,
        payment_status:
          filters.paymentStatus === "all" ? undefined : filters.paymentStatus,
        search: filters.search || undefined,
      };

      const data = await calendarApi.getCalendarData(params);
      setCalendarData(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, isStaff, user?._id, staffProperties]);

  // Fetch staff properties
  useEffect(() => {
    const fetchStaffProperties = async () => {
      if (isStaff && user?._id) {
        try {
          const response =
            await propertyStaffAssignmentApi.getPropertiesByStaff(user._id);
          if (response.success && response.data) {
            setStaffProperties(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch staff properties:", error);
        }
      }
    };

    fetchStaffProperties();
  }, [isStaff, user?._id]);

  // Fetch properties và calendar data
  useEffect(() => {
    // Fetch properties nếu chưa có và không phải staff
    if (propertiesFromStore.length === 0 && !isStaff) {
      dispatch(fetchProperties({ limit: 100 }));
    }

    fetchCalendarData();
  }, [
    filters,
    dispatch,
    propertiesFromStore.length,
    fetchCalendarData,
    isStaff,
  ]);

  const handleDayClick = (_date: string) => {
    // TODO: Open day detail modal or navigate to day view
  };

  const handleBookingClick = (bookingId: string, propertyId: string) => {
    // Nếu propertyId là "all" hoặc "unknown", sử dụng propertyId đầu tiên từ staff properties
    let finalPropertyId = propertyId;

    if (
      (!propertyId || propertyId === "unknown" || propertyId === "all") &&
      isStaff &&
      staffProperties.length > 0
    ) {
      const firstProperty = staffProperties[0];
      finalPropertyId =
        firstProperty.propertyId?._id || firstProperty.propertyId?.id;
    }

    // Nếu vẫn không có propertyId hợp lệ và không phải staff, sử dụng propertyId đầu tiên từ properties
    if (
      (!finalPropertyId ||
        finalPropertyId === "unknown" ||
        finalPropertyId === "all") &&
      !isStaff &&
      properties.length > 0
    ) {
      finalPropertyId = properties[0]._id;
    }

    if (
      !finalPropertyId ||
      finalPropertyId === "unknown" ||
      finalPropertyId === "all"
    ) {
      console.error("Cannot navigate: No valid propertyId found");
      return;
    }

    navigate(`/admin/bookings/${finalPropertyId}/${bookingId}`);
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
