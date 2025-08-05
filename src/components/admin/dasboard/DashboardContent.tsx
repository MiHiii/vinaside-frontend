import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUserRole } from "@/hooks/useUserRole";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDashboardStatistics,
  fetchDashboardOverview,
  fetchRealTimeData,
  fetchRevenueChartData,
} from "@/store/slices/dashboardSlice";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { ResponsiveContainer, Tooltip } from "recharts";
import RevenueChartWithDatePicker from "./revenueChart";
import { DateRangePicker } from "./DateRangePicker";

export default function DashboardContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAdmin, isStaff, user } = useUserRole();

  const {
    statistics,
    realTimeData,
    revenueChartData,
    loading,
    error,
    dateRange,
    dateRangeType,
    selectedPropertyId,
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    const fetchDashboardData = async () => {
      let propertyId = selectedPropertyId;

      // For staff users, always get assigned properties
      if (isStaff && user?._id) {
        try {
          const response =
            await propertyStaffAssignmentApi.getPropertiesByStaff(user._id);
          console.log("Staff properties response:", response);
          if (response.success && response.data && response.data.length > 0) {
            // Get all property IDs assigned to staff
            const staffPropertyIds = response.data
              .map(
                (item: { propertyId?: { _id: string } }) => item.propertyId?._id
              )
              .filter(Boolean);
            console.log("All staff property IDs:", staffPropertyIds);

            // For now, use the first property ID (we can modify this later if needed)
            propertyId = staffPropertyIds[0];
            console.log("Selected propertyId for staff:", propertyId);
          }
        } catch (error) {
          console.error("Failed to fetch staff properties:", error);
        }
      }

      // Fetch dashboard data
      console.log("Sending propertyId to API:", propertyId);

      // For staff, we might need to send all property IDs
      const apiParams = {
        dateRange: dateRangeType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        propertyId: propertyId,
      };

      if (isStaff && user?._id) {
        // Try to get all staff properties and send them
        try {
          const response =
            await propertyStaffAssignmentApi.getPropertiesByStaff(user._id);
          if (response.success && response.data && response.data.length > 0) {
            const staffPropertyIds = response.data
              .map(
                (item: { propertyId?: { _id: string } }) => item.propertyId?._id
              )
              .filter(Boolean);
            console.log("Sending all staff property IDs:", staffPropertyIds);

            // For staff, we need to ensure we're sending the correct property ID
            if (staffPropertyIds.length > 0) {
              console.log("All staff property IDs:", staffPropertyIds);

              // For staff with multiple properties, we need to send all property IDs
              // Backend should aggregate data from all assigned properties
              if (staffPropertyIds.length > 1) {
                // Send comma-separated property IDs
                const allPropertyIds = staffPropertyIds.join(",");
                console.log(
                  "Sending all property IDs for staff:",
                  allPropertyIds
                );
                apiParams.propertyId = allPropertyIds;
              } else {
                // Single property
                const selectedPropertyId = staffPropertyIds[0];
                console.log(
                  "Selected property ID for staff:",
                  selectedPropertyId
                );
                apiParams.propertyId = selectedPropertyId;
              }
            }
          }
        } catch (error) {
          console.error("Failed to get staff properties for API call:", error);
        }
      }

      dispatch(fetchDashboardStatistics(apiParams));
      dispatch(fetchDashboardOverview(apiParams));
      dispatch(fetchRealTimeData(apiParams));
      dispatch(fetchRevenueChartData(apiParams));
    };

    fetchDashboardData();
  }, [
    dispatch,
    dateRange,
    dateRangeType,
    selectedPropertyId,
    isStaff,
    user?._id,
  ]);

  const handleRefresh = () => {
    const refreshParams = {
      dateRange: dateRangeType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      propertyId: selectedPropertyId,
    };

    dispatch(fetchDashboardStatistics(refreshParams));
    dispatch(fetchDashboardOverview(refreshParams));
    dispatch(fetchRealTimeData(refreshParams));
    dispatch(fetchRevenueChartData(refreshParams));
  };

  // Debug log
  console.log("Dashboard Statistics:", statistics);
  console.log("Real Time Data:", realTimeData);
  console.log("Current user role:", user?.role);
  console.log("Is staff:", isStaff);
  console.log("Selected propertyId:", selectedPropertyId);
  console.log("Property ID being sent to API:", selectedPropertyId);
  console.log("Real-time data for staff:", {
    activeBookings: realTimeData?.activeBookings,
    pendingBookings: realTimeData?.pendingBookings,
    recentMessages: realTimeData?.recentMessages,
    recentReviews: realTimeData?.recentReviews,
  });

  // Debug: Check if this is staff and what propertyId is being used
  if (isStaff) {
    console.log("Staff user - Property ID being used:", selectedPropertyId);
    console.log("Expected: Only data for this property should be shown");
    console.log(
      "Real-time data should be filtered by property:",
      selectedPropertyId
    );
    console.log(
      "Expected: Data should be aggregated from all assigned properties"
    );
  }

  // Tính tổng doanh thu từ revenueChartData theo khoảng thời gian được chọn
  const totalRevenueFromChart = (() => {
    if (
      revenueChartData &&
      revenueChartData.data &&
      Array.isArray(revenueChartData.data)
    ) {
      return revenueChartData.data.reduce(
        (sum, item) => sum + (item?.totalRevenue || 0),
        0
      );
    }
    return 0;
  })();

  const averageRevenueFromChart = (() => {
    if (
      revenueChartData &&
      revenueChartData.data &&
      Array.isArray(revenueChartData.data) &&
      revenueChartData.data.length > 0
    ) {
      return totalRevenueFromChart / revenueChartData.data.length;
    }
    return 0;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Đang tải dữ liệu dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DateRangePicker />
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-2 h-2 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(statistics?.financial?.totalRevenue || 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tổng doanh thu từ bookings
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Doanh thu dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(statistics?.financial?.totalServicesRevenue || 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng doanh thu dịch vụ</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Tổng chiết khấu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(statistics?.financial?.totalVoucherDiscount || 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Số tiền thực tế đã được áp dụng
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
              {statistics?.performance?.averageOccupancyRate}%
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Tỉ lệ lấp đầy trung bình
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Tổng homestay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statistics?.overview?.totalProperties || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng số homestay </p>
          </CardContent>
        </Card>

        <Card className="border-0 s bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tổng Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statistics?.overview?.totalBookings || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng lượt đặt chỗ</p>
          </CardContent>
        </Card>

        <Card className="border-0 s bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tổng khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {statistics?.overview?.totalUsers || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Tổng số khách hàng</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Khoảng thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-gray-900">
              {revenueChartData?.data?.length || 0} ngày
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {dateRange?.startDate && dateRange?.endDate
                ? `${new Date(dateRange.startDate).toLocaleDateString(
                    "vi-VN"
                  )} - ${new Date(dateRange.endDate).toLocaleDateString(
                    "vi-VN"
                  )}`
                : "Chưa chọn khoảng thời gian"}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Charts danh thu */}
      <RevenueChartWithDatePicker />
      {/* Charts Section */}
      {statistics && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Top Properties */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Top homestay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(statistics.financial?.topPropertiesByRevenue || [])
                  .slice(0, 5)
                  .map((property, index) => (
                    <div
                      key={property.propertyId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {property.propertyName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {property.bookings} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(property.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Occupancy by Property */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Tỉ lệ lấp đầy theo homestay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(statistics.performance?.occupancyByProperty || [])
                  .slice(0, 5)
                  .map((property, index) => (
                    <div
                      key={property.propertyId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {property.propertyName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">
                          {property.occupancyRate}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Vouchers */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Top Vouchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(statistics.performance?.topVouchers || [])
                  .slice(0, 5)
                  .map((voucher, index) => (
                    <div
                      key={voucher.voucherId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {voucher.voucherCode}: {voucher.totalDiscount}%
                            discount
                          </p>
                          <p className="text-xs text-gray-500">
                            {voucher.usageCount} lần sử dụng
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-purple-600">
                          {voucher.totalDiscount}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Top Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(statistics.performance?.topServices || [])
                  .slice(0, 5)
                  .map((service, index) => (
                    <div
                      key={service.serviceId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {service.serviceName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {service.usageCount} lần sử dụng
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-blue-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(service.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
