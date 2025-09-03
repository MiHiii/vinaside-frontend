import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  RefreshCw,
  Tag,
  TrendingUp,
  Clock,
  Building2,
  Package,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableCell, TableHead } from "@/components/ui/table";
import { useUserRole } from "@/hooks/useUserRole";

export default function ServiceUsagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useUserRole();

  const {
    services,
    serviceUsage,
    serviceBookings,
    serviceDetailedStats,
    loading,
    error,
    serviceBookingsTotal,
    serviceBookingsPage,
    serviceBookingsLimit,
    serviceBookingsTotalPages,
    getServices,
    getServiceUsage,
    getServiceBookings,
    getServiceDetailedStats,
    clearUsage,
  } = useServices();

  // Debug log
  console.log("ServiceUsagePage - ID from params:", id);
  console.log("ServiceUsagePage - services:", services);
  console.log("ServiceUsagePage - serviceUsage:", serviceUsage);
  console.log("ServiceUsagePage - serviceBookings:", serviceBookings);
  console.log(
    "ServiceUsagePage - serviceBookings type:",
    typeof serviceBookings
  );
  console.log(
    "ServiceUsagePage - serviceBookings isArray:",
    Array.isArray(serviceBookings)
  );
  console.log("ServiceUsagePage - loading:", loading);
  console.log("ServiceUsagePage - error:", error);

  // Đảm bảo serviceBookings luôn là array
  const safeServiceBookings = Array.isArray(serviceBookings)
    ? serviceBookings
    : [];

  // Debug log sau khi khai báo safeServiceBookings
  console.log("ServiceUsagePage - safeServiceBookings:", safeServiceBookings);
  console.log(
    "ServiceUsagePage - safeServiceBookings length:",
    safeServiceBookings.length
  );

  // Fetch services list if no ID provided
  useEffect(() => {
    if (!id) {
      getServices();
    }
  }, [id, getServices]);

  useEffect(() => {
    if (id) {
      console.log("Fetching service data for ID:", id);
      getServiceUsage(id);
      getServiceBookings(
        id,
        serviceBookingsPage ?? 1,
        serviceBookingsLimit ?? 10
      );
      getServiceDetailedStats(id);
    }

    // Cleanup when component unmounts
    return () => {
      clearUsage();
    };
  }, [id, getServiceUsage, getServiceBookings, clearUsage]);

  const handleRefresh = () => {
    if (id) {
      getServiceUsage(id);
      getServiceBookings(
        id,
        serviceBookingsPage ?? 1,
        serviceBookingsLimit ?? 10
      );
    }
  };

  const currentPage = serviceBookingsPage ?? 1;
  const totalPages = serviceBookingsTotalPages ?? 0;
  const limit = serviceBookingsLimit ?? 10;
  const adminTotal = serviceBookingsTotal ?? safeServiceBookings.length;
  const startItem = useMemo(
    () => (adminTotal === 0 ? 0 : (currentPage - 1) * limit + 1),
    [adminTotal, currentPage, limit]
  );
  const endItem = useMemo(
    () => Math.min(currentPage * limit, adminTotal),
    [adminTotal, currentPage, limit]
  );

  const goToPage = (page: number) => {
    if (!id) return;
    if (page < 1 || (totalPages && page > totalPages)) return;
    getServiceBookings(id, page, limit);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    const safe = Number.isFinite(amount) ? amount : 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(safe));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Chờ xác nhận",
        className: "bg-yellow-100 text-yellow-800",
      },
      confirmed: {
        label: "Đã xác nhận",
        className: "bg-green-100 text-green-800",
      },
      cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
      completed: {
        label: "Hoàn thành",
        className: "bg-blue-100 text-blue-800",
      },
      rejected: { label: "Từ chối", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Đang tải dữ liệu service...</span>
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

  if (!serviceUsage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin service</p>
          <p className="text-sm text-gray-500 mb-4">ID: {id}</p>

          {/* Hiển thị danh sách service nếu có */}
          {services.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">
                Danh sách service có sẵn:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.slice(0, 5).map((service) => (
                  <div
                    key={service._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{service.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/services/${service._id}/usage`)
                      }
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => navigate("/admin")}
              className="bg-white border-gray-200 hover:bg-gray-300"
            >
              Quay về Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/services")}
            >
              Xem danh sách Service
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Test với một ID cụ thể nếu có
                const testId = "test-service-id";
                console.log("Testing with ID:", testId);
                getServiceUsage(testId);
                getServiceBookings(testId);
              }}
            >
              Test với ID mẫu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const computedTotalRevenue = safeServiceBookings.reduce(
    (sum, booking) => sum + (booking.service_total_price || 0),
    0
  );
  const computedTotalQuantity = safeServiceBookings.reduce(
    (sum, booking) => sum + (booking.service_quantity || 0),
    0
  );
  const computedAveragePrice =
    computedTotalQuantity > 0
      ? computedTotalRevenue / computedTotalQuantity
      : 0;

  const displayTotalBookings =
    serviceDetailedStats?.total_bookings ?? safeServiceBookings.length;
  const displayTotalRevenue =
    serviceDetailedStats?.total_revenue ?? computedTotalRevenue;
  const displayAveragePrice =
    serviceDetailedStats?.average_price ?? computedAveragePrice;
  const displayTotalQuantity = computedTotalQuantity; // API không trả quantity tổng, lấy từ FE

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="bg-white border-gray-200 hover:bg-gray-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay về Dashboard
          </Button>
          {!isStaff && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/services")}
              className="bg-white border-gray-200 hover:bg-gray-200 cursor-pointer"
            >
              <List className="w-4 h-4 mr-2" />
              Danh sách
            </Button>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="bg-white border-gray-200 hover:bg-gray-200 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Service Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Tên dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {serviceUsage.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">Dịch vụ</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Giá mặc định
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(serviceUsage.default_price)}
            </p>
            <p className="text-xs text-gray-600 mt-1">{serviceUsage.unit}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {safeServiceBookings.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Lượt sử dụng</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                serviceUsage.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {serviceUsage.is_active ? "Đang hoạt động" : "Không hoạt động"}
            </span>
            <p className="text-xs text-gray-600 mt-1">Trạng thái</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Thông tin Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Mô tả:</span>
                <span className="text-sm text-gray-600">
                  {serviceUsage.description}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Đơn vị:</span>
                <span className="text-sm font-bold">{serviceUsage.unit}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Giá mặc định:</span>
                <span className="text-sm font-bold">
                  {formatCurrency(serviceUsage.default_price)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    serviceUsage.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {serviceUsage.is_active
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Thống kê Sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Tổng booking:</span>
                <span className="text-lg font-bold text-blue-600">
                  {displayTotalBookings}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Doanh thu:</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatCurrency(displayTotalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Giá trung bình:</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(displayAveragePrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Danh sách Booking sử dụng Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeServiceBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Chưa có booking nào sử dụng service này
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-0 table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      STT
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Khách hàng
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Homestay
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Phòng
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Ngày check-in
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Số đêm
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Giá dịch vụ
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left font-semibold text-gray-700">
                      Trạng thái
                    </TableHead>
                  </tr>
                </thead>
                <tbody>
                  {safeServiceBookings.map((booking, index) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <TableCell className="">
                        <div className="text-sm font-medium text-gray-600 ml-5">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10  flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {booking.guest_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.guest_email}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border-none group-hover:border-purple-300 transition-all duration-300">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                                {booking.property_name}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border-none group-hover:border-green-300 transition-all duration-300">
                            <div className="font-medium text-sm text-gray-900 group-hover:text-green-600 transition-colors">
                              {booking.listing_title}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border-none group-hover:border-blue-300 transition-all duration-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-sm text-gray-900">
                                {formatDate(booking.checkInDate)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border-none group-hover:border-indigo-300 transition-all duration-300">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-indigo-600" />
                              <span className="font-medium text-sm text-gray-900">
                                {booking.nights} đêm
                              </span>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border-none group-hover:border-green-300 transition-all duration-300">
                            <div className="font-bold text-green-600 text-sm">
                              {formatCurrency(booking.service_total_price)}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="">
                        <Link
                          to={`/admin/bookings/${booking.propertyId}/${booking._id}`}
                          className="block group"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border-none group-hover:border-yellow-300 transition-all duration-300">
                            {getStatusBadge(booking.booking_status)}
                          </div>
                        </Link>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 0 && adminTotal > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6  border-t border-gray-200/50 gap-3 mt-3">
                  <div className="text-sm text-gray-600 text-center sm:text-left mt-3">
                    Hiển thị {startItem} đến {endItem} trong tổng số{" "}
                    {adminTotal} booking
                    {totalPages > 1 &&
                      ` (Trang ${currentPage} / ${totalPages})`}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </Button>

                    {Array.from(
                      { length: Math.min(5, totalPages || 0) },
                      (_, i) => {
                        let pageNum: number;
                        if ((totalPages || 0) <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= (totalPages || 0) - 2) {
                          pageNum = (totalPages || 0) - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              currentPage === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === pageNum
                                ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-800"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
