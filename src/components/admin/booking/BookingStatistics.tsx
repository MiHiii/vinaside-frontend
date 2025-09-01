import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchBookingStatisticsOverview } from "@/store/slices/bookingSlice";
import { useUserRole } from "@/hooks/useUserRole";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw,
  Tag,
  Package,
  Download,
  ArrowLeft,
} from "lucide-react";
import { DateRangePicker } from "@/components/admin/dasboard/DateRangePicker";
import { useNavigate } from "react-router-dom";
import BookingCharts from "./BookingCharts";
import BookingDetailsModal from "./BookingDetailsModal";
import { DateRange } from "react-day-picker";

interface BookingStatisticsProps {
  onBackToList?: () => void;
}

export default function BookingStatisticsAdmin({
  onBackToList,
}: BookingStatisticsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isStaff, user } = useUserRole();

  // DateRangePicker state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<
    "today" | "last_7_days" | "last_15_days" | "last_30_days" | "custom"
  >("last_30_days");

  // Modal state
  const [isBookingDetailsModalOpen, setIsBookingDetailsModalOpen] =
    useState(false);

  const statisticsOverview = useAppSelector(
    (state) => state.booking.statisticsOverview
  );
  const loading = useAppSelector((state) => state.booking.loading);
  const error = useAppSelector((state) => state.booking.error);

  // Fetch statistics data
  const fetchStatisticsData = async (params: {
    dateRange: string;
    startDate?: string;
    endDate?: string;
    propertyId?: string;
  }) => {
    let propertyId = params.propertyId;

    // For staff users, always get assigned properties
    if (isStaff && user?._id) {
      try {
        const response = await propertyStaffAssignmentApi.getPropertiesByStaff(
          user._id
        );
        if (response.success && response.data && response.data.length > 0) {
          const staffPropertyIds = response.data
            .map(
              (item: { propertyId?: { _id: string } }) => item.propertyId?._id
            )
            .filter(Boolean);

          if (staffPropertyIds.length > 1) {
            propertyId = staffPropertyIds.join(",");
          } else {
            propertyId = staffPropertyIds[0];
          }
        }
      } catch (error) {
        console.error("Failed to fetch staff properties:", error);
      }
    }

    const apiParams = {
      dateRange: params.dateRange,
      startDate: params.startDate,
      endDate: params.endDate,
      propertyId: propertyId,
    };

    dispatch(fetchBookingStatisticsOverview(apiParams));
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    console.log("🔄 BookingStatistics: Date range changed:", range);
    setDateRange(range);

    if (range?.from && range?.to) {
      setDateRangeType("custom");
      const startDate = range.from.toISOString().split("T")[0];
      const endDate = range.to.toISOString().split("T")[0];

      console.log("🔄 BookingStatistics: Fetching data for custom range:", {
        startDate,
        endDate,
      });

      fetchStatisticsData({
        dateRange: "custom",
        startDate,
        endDate,
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatisticsData({
      dateRange: "last_30_days",
    });
  }, [dispatch, isStaff, user?._id]);

  // Handle preset date range changes
  const handlePresetChange = (
    presetType: "today" | "last_7_days" | "last_15_days" | "last_30_days"
  ) => {
    console.log("🔄 BookingStatistics: Preset changed to:", presetType);
    setDateRangeType(presetType);

    fetchStatisticsData({
      dateRange: presetType,
    });
  };

  // Update dateRangeType when dateRange changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const from = dateRange.from;
      const to = dateRange.to;
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        setDateRangeType("today");
      } else if (diffDays === 7) {
        setDateRangeType("last_7_days");
      } else if (diffDays === 15) {
        setDateRangeType("last_15_days");
      } else if (diffDays === 30) {
        setDateRangeType("last_30_days");
      } else {
        setDateRangeType("custom");
      }
    }
  }, [dateRange]);

  const handleRefresh = () => {
    // Use current dateRange or default to last_30_days
    if (dateRange?.from && dateRange?.to) {
      fetchStatisticsData({
        dateRange: "custom",
        startDate: dateRange.from.toISOString().split("T")[0],
        endDate: dateRange.to.toISOString().split("T")[0],
      });
    } else {
      fetchStatisticsData({
        dateRange: "last_30_days",
      });
    }
  };

  const handleVoucherClick = (voucherCode: string) => {
    // Navigate to voucher usage page with voucher ID
    navigate(`/admin/vouchers/${voucherCode}/usage`);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/admin/services/${serviceId}/usage`);
  };

  const handleTotalBookingsClick = () => {
    setIsBookingDetailsModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {typeof error === "string"
              ? error
              : "Có lỗi xảy ra khi tải dữ liệu"}
          </p>
          <Button onClick={handleRefresh}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBackToList && (
            <Button
              onClick={onBackToList}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Button>
          )}
          <DateRangePicker
            className="w-[280px]"
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            open={dateRangeOpen}
            onOpenChange={setDateRangeOpen}
            useRedux={false}
            dateRangeType={dateRangeType}
            onPresetChange={handlePresetChange}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          onClick={handleTotalBookingsClick}
          className="border-0 shadow-md bg-white cursor-pointer hover:bg-gray-50"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tổng Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statisticsOverview?.totalBookings || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng lượt đặt chỗ</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(statisticsOverview?.totalRevenue || 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tổng doanh thu từ bookings
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Tỉ lệ lấp đầy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statisticsOverview?.averageOccupancyRate || 0}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tỉ lệ lấp đầy trung bình
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tổng khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statisticsOverview?.totalGuests || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng số khách hàng</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Voucher sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statisticsOverview?.totalVouchersUsed || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tổng giảm giá:{" "}
              {formatCurrency(statisticsOverview?.totalVoucherDiscount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Dịch vụ sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statisticsOverview?.totalServicesBooked || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Doanh thu:{" "}
              {formatCurrency(statisticsOverview?.totalServicesRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Giá trị trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(statisticsOverview?.averageBookingValue || 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Giá trị booking trung bình
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tổng đêm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statisticsOverview?.totalNights || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng số đêm đặt</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <BookingCharts
        statisticsOverview={statisticsOverview || {}}
        onVoucherClick={handleVoucherClick}
        onServiceClick={handleServiceClick}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isBookingDetailsModalOpen}
        onClose={() => setIsBookingDetailsModalOpen(false)}
        bookingDetails={statisticsOverview?.bookingDetails || []}
      />
    </div>
  );
}
