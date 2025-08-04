import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUserRole } from "@/hooks/useUserRole";
import { AppDispatch, RootState } from "@/store";
import {
  fetchDashboardStatistics,
  fetchDashboardOverview,
  fetchRealTimeData,
} from "@/store/slices/dashboardSlice";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Star,
  MessageSquare,
  Gift,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#FF6384", // đỏ hồng
  "#36A2EB", // xanh dương sáng
  "#FFCE56", // vàng
  "#4BC0C0", // xanh ngọc
  "#9966FF", // tím
  "#FF9F40", // cam
];

export default function DashboardContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAdmin, isStaff, user } = useUserRole();

  const {
    statistics,
    realTimeData,
    loading,
    error,
    dateRange,
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
      dispatch(fetchDashboardOverview({ propertyId: apiParams.propertyId }));
      dispatch(fetchRealTimeData({ propertyId: apiParams.propertyId }));
    };

    fetchDashboardData();
  }, [dispatch, dateRange, selectedPropertyId, isStaff, user?._id]);

  const handleRefresh = () => {
    dispatch(
      fetchDashboardStatistics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        propertyId: selectedPropertyId,
      })
    );
    dispatch(fetchDashboardOverview({ propertyId: selectedPropertyId }));
    dispatch(fetchRealTimeData({ propertyId: selectedPropertyId }));
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

  // Convert booking status data for pie chart
  const bookingStatusData = statistics?.overview?.bookingsByStatus
    ? Object.entries(statistics.overview.bookingsByStatus).map(
        ([status, count]) => ({
          name: status,
          value: count,
        })
      )
    : [];

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
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin
              ? "Bảng điều khiển quản trị viên"
              : isStaff
              ? "Bảng điều khiển nhân viên"
              : "Bảng điều khiển"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? "Quản lý tổng quan hệ thống"
              : "Quản lý properties được assign"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Xin chào,</span>
            <span className="font-medium">{user?.name || "User"}</span>
            {isAdmin && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Admin
              </Badge>
            )}
            {isStaff && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Staff
              </Badge>
            )}
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {isAdmin ? "Tổng Properties" : "Properties của tôi"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">
              {statistics?.overview?.totalProperties || 0}
            </p>
            <p className="text-xs text-blue-600 mt-1">Tổng số properties</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {isAdmin ? "Tổng Bookings" : "Bookings quản lý"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {statistics?.overview?.totalBookings || 0}
            </p>
            <p className="text-xs text-green-600 mt-1">Tổng số bookings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {isAdmin ? "Tổng Users" : "Khách hàng"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700">
              {statistics?.overview?.totalUsers || 0}
            </p>
            <p className="text-xs text-purple-600 mt-1">Tổng số users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {isAdmin ? "Tổng Revenue" : "Thu nhập"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-700">
              {statistics?.overview?.totalRevenue || 0}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(statistics?.overview?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {statistics && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Booking Status Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Phân bố trạng thái booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Xu hướng doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={statistics.financial?.revenueByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Trends */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Xu hướng booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.timeline?.bookingsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Properties */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Top Properties
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
        </div>
      )}

      {/* Additional Statistics */}
      {statistics && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Thống kê Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm font-medium">Tổng Users</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {statistics.overview?.totalUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Khách</span>
                  <span className="text-lg font-bold text-green-600">
                    {statistics.overview?.usersByRole?.guest || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Nhân viên</span>
                  <span className="text-lg font-bold text-blue-600">
                    {statistics.overview?.usersByRole?.staff || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Quản trị viên</span>
                  <span className="text-lg font-bold text-purple-600">
                    {statistics.overview?.usersByRole?.admin || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Users mới (30 ngày)
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {statistics.overview?.newUsersLast30Days || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Thống kê Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium">Tổng Properties</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {statistics.overview?.totalProperties || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Properties hoạt động
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {statistics.overview?.activeProperties || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Properties đang chờ
                  </span>
                  <span className="text-lg font-bold text-yellow-600">
                    {statistics.overview?.propertiesByStatus?.pending || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Tổng Listings</span>
                  <span className="text-lg font-bold text-blue-600">
                    {statistics.overview?.totalListings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Listings hoạt động
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    {statistics.overview?.activeListings || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Thống kê Tài chính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Tổng Revenue</span>
                  <span className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(statistics.financial?.totalRevenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Net Revenue</span>
                  <span className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(statistics.financial?.netRevenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Phí dịch vụ</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(statistics.financial?.totalServiceFees || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Chiết khấu Voucher
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(statistics.financial?.totalVoucherDiscount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Doanh thu dịch vụ</span>
                  <span className="text-lg font-bold text-purple-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(statistics.financial?.totalServicesRevenue || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer & Performance Data */}
      {statistics && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Customers */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(statistics.customers?.topCustomers || [])
                  .slice(0, 5)
                  .map((customer, index) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {customer.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.totalBookings} bookings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(customer.totalSpent)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-600" />
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
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-pink-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {service.serviceName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {service.usageCount} uses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
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

      {/* Performance Metrics */}
      {statistics && (
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Điểm đánh giá trung bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">
                {statistics.overview?.averageRating?.toFixed(1) || 0}/5
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Tổng {statistics.overview?.totalReviews || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Thời gian trung bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">
                {statistics.customers?.averageNightsPerBooking || 0} nights
              </p>
              <p className="text-xs text-green-600 mt-1">Per booking</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Khách trung bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">
                {statistics.customers?.averageGuestsPerBooking?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-purple-600 mt-1">Per booking</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dịch vụ trung bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-700">
                {statistics.performance?.averageServicesPerBooking?.toFixed(
                  1
                ) || 0}
              </p>
              <p className="text-xs text-orange-600 mt-1">Average services</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Data */}
      {realTimeData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Dữ liệu thời gian thực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {realTimeData.activeBookings}
                  </p>
                  <p className="text-sm text-blue-600">Active Bookings</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {realTimeData.pendingBookings}
                  </p>
                  <p className="text-sm text-yellow-600">Pending Bookings</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {realTimeData.recentMessages}
                  </p>
                  <p className="text-sm text-green-600">Recent Messages</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {realTimeData.recentReviews}
                  </p>
                  <p className="text-sm text-purple-600">Recent Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-600" />
                Thống kê đánh giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-sm">
                        Điểm đánh giá trung bình
                      </p>
                      <p className="text-xs text-gray-500">
                        {statistics?.overview?.averageRating?.toFixed(1) || 0}/5
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {statistics?.overview?.totalReviews || 0}
                    </p>
                    <p className="text-xs text-gray-500">Tổng đánh giá</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Tổng tin nhắn</p>
                      <p className="text-xs text-gray-500">Conversations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {statistics?.overview?.totalMessages || 0}
                    </p>
                    <p className="text-xs text-gray-500">Messages</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">
                        Vouchers đang hoạt động
                      </p>
                      <p className="text-xs text-gray-500">Active vouchers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {statistics?.overview?.activeVouchers || 0}
                    </p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
