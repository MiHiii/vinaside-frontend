import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useVouchers } from "@/hooks/useVouchers";
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
  List,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { useUserRole } from "@/hooks/useUserRole";

export default function VoucherUsagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useUserRole();

  const {
    vouchers,
    voucherUsage,
    voucherBookings,
    voucherDetailedStats,
    loading,
    error,
    voucherBookingsTotal,
    voucherBookingsPage,
    voucherBookingsLimit,
    voucherBookingsTotalPages,
    getVouchers,
    getVoucherUsage,
    getVoucherBookings,
    getVoucherDetailedStats,
    clearUsage,
  } = useVouchers();

  // Đảm bảo voucherBookings luôn là array
  const safeVoucherBookings = Array.isArray(voucherBookings)
    ? voucherBookings
    : [];

  // Fetch vouchers list if no ID provided
  useEffect(() => {
    if (!id) {
      getVouchers();
    }
  }, [id, getVouchers]);

  useEffect(() => {
    if (id) {
      console.log("Fetching voucher data for ID:", id);
      getVoucherUsage(id);
      getVoucherBookings(
        id,
        voucherBookingsPage ?? 1,
        voucherBookingsLimit ?? 10
      );
      getVoucherDetailedStats(id);
    }

    // Cleanup when component unmounts
    return () => {
      clearUsage();
    };
  }, [id, getVoucherUsage, getVoucherBookings, clearUsage]);

  const handleRefresh = () => {
    if (id) {
      getVoucherUsage(id);
      getVoucherBookings(
        id,
        voucherBookingsPage ?? 1,
        voucherBookingsLimit ?? 10
      );
    }
  };

  const currentPage = voucherBookingsPage ?? 1;
  const totalPages = voucherBookingsTotalPages ?? 0;
  const limit = voucherBookingsLimit ?? 10;
  const adminTotal = voucherBookingsTotal ?? safeVoucherBookings.length;
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
    getVoucherBookings(id, page, limit);
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
          <span>Đang tải dữ liệu voucher...</span>
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

  if (!voucherUsage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin voucher</p>
          <p className="text-sm text-gray-500 mb-4">ID: {id}</p>

          {/* Hiển thị danh sách voucher nếu có */}
          {vouchers.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">
                Danh sách voucher có sẵn:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {vouchers.slice(0, 5).map((voucher) => (
                  <div
                    key={voucher._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{voucher.code}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/vouchers/${voucher._id}/usage`)
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
              onClick={() => navigate("/admin/vouchers")}
            >
              Xem danh sách Voucher
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Test với một ID cụ thể nếu có
                const testId = "test-voucher-id";
                console.log("Testing with ID:", testId);
                getVoucherUsage(testId);
                getVoucherBookings(testId);
              }}
            >
              Test với ID mẫu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const computedTotalDiscount = safeVoucherBookings.reduce(
    (sum, booking) => sum + booking.voucher_discount_amount,
    0
  );
  const computedRevenueAfter = safeVoucherBookings.reduce(
    (sum, booking) => sum + (booking.final_price || 0),
    0
  );
  const computedAverageDiscount =
    safeVoucherBookings.length > 0
      ? computedTotalDiscount / safeVoucherBookings.length
      : 0;

  const displayTotalBookings =
    voucherDetailedStats?.total_bookings ?? safeVoucherBookings.length;
  const displayTotalDiscount =
    voucherDetailedStats?.total_discount ?? computedTotalDiscount;
  const displayRevenueAfter =
    voucherDetailedStats?.revenue_after_discount ?? computedRevenueAfter;
  const displayAverageDiscount =
    voucherDetailedStats?.average_discount ?? computedAverageDiscount;

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
              onClick={() => navigate("/admin/vouchers")}
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
          className="text-sm bg-white border-gray-200 hover:bg-gray-200 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Voucher Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Mã giảm giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {voucherUsage.code}
            </p>
            <p className="text-xs text-gray-600 mt-1">Mã voucher</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Phần trăm giảm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {voucherUsage.discount_percent}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Giảm giá</p>
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
              {voucherUsage.uses_count}/{voucherUsage.max_uses}
            </p>
            <p className="text-xs text-gray-600 mt-1">Lượt sử dụng</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Hết hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-gray-900">
              {formatDate(voucherUsage.expiration_date)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Ngày hết hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Thông tin Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Mô tả:</span>
                <span className="text-sm text-gray-600">
                  {voucherUsage.description}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Giá trị đơn hàng tối thiểu:</span>
                <span className="text-sm font-bold">
                  {formatCurrency(voucherUsage.min_order_value)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Sử dụng tối đa mỗi user:</span>
                <span className="text-sm font-bold">
                  {voucherUsage.max_uses_per_user} lần
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    voucherUsage.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {voucherUsage.is_active
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
                <span className="font-medium">Tổng giảm giá:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(displayTotalDiscount)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Doanh thu sau giảm:</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatCurrency(displayRevenueAfter)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Giảm giá trung bình:</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(displayAverageDiscount)}
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
            Danh sách Booking sử dụng Voucher
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeVoucherBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Chưa có booking nào sử dụng voucher này
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-0 table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      STT
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Khách hàng
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Homestay
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Phòng
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Ngày check-in
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Số đêm
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Giảm giá
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {safeVoucherBookings.map((booking, index) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/admin/bookings/${booking.propertyId}/${booking._id}`
                        )
                      }
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
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl border-none ">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-gray-900 group-hover:text-gray-600 transition-colors">
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
                              {formatCurrency(booking.voucher_discount_amount)}
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
              {/* Pagination */}
              {totalPages > 0 && adminTotal > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200/50 gap-3">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Hiển thị {startItem} đến {endItem} trong tổng số{" "}
                    {adminTotal} booking
                    {totalPages > 1 &&
                      ` (Trang ${currentPage} / ${totalPages})`}
                  </div>
                  <div className="flex items-center gap-2">
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
