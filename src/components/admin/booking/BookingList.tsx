import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookings,
  fetchStaffBookings,
} from "@/store/slices/bookingSlice";
import {
  fetchProperties,
  selectProperties,
} from "@/store/slices/propertySlice";
import { RootState } from "@/store";
import BookingFilter from "./BookingFilter";
import BookingActions from "./BookingActions";
import type { Booking } from "@/types/booking.interface";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPaymentStatusVN, getStatusVN } from "@/helper/status";
import { BookingStatus, PaymentStatus } from "@/types/enum";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import {
  Calendar,
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

type BookingWithDeleted = Booking & {
  isDeleted?: boolean;
  deleted?: boolean;
  payment_status?: string;
  paymentStatus?: string;
  refund_amount?: number;
  nights?: number;
  payment_method?: string;
  propertyId?:
    | {
        name?: string;
        _id?: string;
      }
    | string;
};

const BookingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isStaff, user } = useUserRole();
  const { adminBookings, staffBookings, adminTotal, loading, error } =
    useSelector((state: RootState) => state.booking);
  const properties = useSelector(selectProperties);

  // State cho bộ lọc và phân trang
  const [filters, setFilters] = useState<Record<string, unknown>>({
    propertyId: "",
    status: "",
    paymentStatus: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch properties for filter dropdown
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchProperties({ limit: 100 }));
    }
  }, [dispatch, properties.length]);

  // Fetch bookings for admin (all bookings)
  useEffect(() => {
    if (!isStaff) {
      const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      // Đảm bảo luôn truyền limit parameter
      const params = {
        ...apiFilters,
        page: currentPage,
        limit: itemsPerPage,
      };

      dispatch(fetchAdminBookings(params));
    }
  }, [dispatch, filters, currentPage, isStaff, itemsPerPage]);

  // Fetch bookings for staff
  useEffect(() => {
    if (isStaff) {
      const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      // Đảm bảo luôn truyền limit parameter
      const params = {
        ...apiFilters,
        page: currentPage,
        limit: itemsPerPage,
      };

      dispatch(fetchStaffBookings(params));
    }
  }, [isStaff, dispatch, filters, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    // Convert "all" values to undefined for API compatibility
    const processedFilters = Object.fromEntries(
      Object.entries(newFilters).map(([key, value]) => [
        key,
        value === "all" ? undefined : value,
      ])
    );
    setFilters(processedFilters);
    setCurrentPage(1);
  };

  const handleActionSuccess = () => {
    const apiFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    // Đảm bảo luôn truyền limit parameter
    const params = {
      ...apiFilters,
      page: currentPage,
      limit: itemsPerPage,
    };

    if (isStaff) {
      dispatch(fetchStaffBookings(params));
    } else {
      dispatch(fetchAdminBookings(params));
    }
  };

  // Thêm icon VNPAY SVG inline
  const VNPayIcon = () => (
    <svg
      width="24"
      height="12"
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline align-middle mr-1"
    >
      <rect width="48" height="24" rx="4" fill="#0060AF" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fill="white"
        fontWeight="bold"
      >
        VNPAY
      </text>
    </svg>
  );

  // Hiển thị tất cả booking trong cùng một bảng
  const allBookings = isStaff
    ? Array.isArray(staffBookings)
      ? staffBookings
      : []
    : Array.isArray(adminBookings)
    ? adminBookings
    : [];

  // Tính toán phân trang (server-side)
  const totalPages = Math.ceil(adminTotal / itemsPerPage);
  const currentBookings = allBookings;

  // Tính toán thông tin hiển thị
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, adminTotal);

  // Hàm chuyển trang
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Tính toán stats
  const totalBookings = allBookings.length;
  const confirmedBookings = allBookings.filter(
    (b: any) => b.status === "confirmed"
  ).length;
  const pendingBookings = allBookings.filter(
    (b: any) => b.status === "pending"
  ).length;
  const cancelledBookings = allBookings.filter(
    (b: any) => b.status === "cancelled"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-700 animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-full mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-red-700">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="max-w-[1580px] mx-auto">
        {/* Filter Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Search className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Property Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select
                value={
                  filters.propertyId ? (filters.propertyId as string) : "all"
                }
                onChange={(e) =>
                  handleFilterChange({ ...filters, propertyId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả properties</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status ? (filters.status as string) : "all"}
                onChange={(e) =>
                  handleFilterChange({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái thanh toán
              </label>
              <select
                value={
                  filters.paymentStatus
                    ? (filters.paymentStatus as string)
                    : "all"
                }
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    paymentStatus: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="partially_paid">Thanh toán một phần</option>
                <option value="paid">Đã thanh toán</option>
                <option value="refunding">Đang hoàn tiền</option>
                <option value="refunded">Đã hoàn tiền</option>
                <option value="failed">Thanh toán thất bại</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên khách, property..."
                value={filters.search ? (filters.search as string) : ""}
                onChange={(e) =>
                  handleFilterChange({ ...filters, search: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() =>
                handleFilterChange({
                  propertyId: "all",
                  status: "all",
                  paymentStatus: "all",
                  search: "",
                })
              }
              className="border-gray-300 hover:bg-gray-100"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">
                Danh sách Booking
              </h2>
              <Badge
                variant="secondary"
                className="ml-auto bg-white text-gray-900 border border-gray-200 hover:bg-gray-100 cursor-pointer rounded-md"
              >
                {isStaff ? staffBookings.length : adminTotal} kết quả
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="border-none">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-none">
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    STT
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Khách hàng
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Phòng
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    HomeStay
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Ngày vào
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Ngày ra
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Khách
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Thanh toán
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Phương thức
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-2">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBookings.length > 0 ? (
                  currentBookings.map((b: BookingWithDeleted, idx) => {
                    // Lấy thông tin khách
                    const guestId = (b as { guestId?: { name?: string } })
                      .guestId;
                    let guestName = "";
                    let guestEmail = "";
                    if (typeof guestId === "object" && guestId !== null) {
                      guestName = guestId.name || "";
                      guestEmail =
                        "email" in guestId && typeof guestId.email === "string"
                          ? guestId.email
                          : "";
                    } else if (typeof b.guest_name === "string") {
                      guestName = b.guest_name;
                    }

                    // Lấy thông tin phòng
                    let roomName = "";
                    if (
                      typeof b.listingId === "object" &&
                      b.listingId !== null
                    ) {
                      roomName = b.listingId.title || "";
                    } else if (typeof b.listingId === "string") {
                      roomName = b.listingId;
                    }

                    // Lấy thông tin property
                    let propertyName = "";
                    let propertyId = "";
                    if (
                      typeof b.propertyId === "object" &&
                      b.propertyId !== null
                    ) {
                      propertyName =
                        (b.propertyId as { name?: string }).name || "";
                      propertyId = (b.propertyId as { _id?: string })._id || "";
                    } else if (typeof b.propertyId === "string") {
                      propertyName = b.propertyId;
                      propertyId = b.propertyId;
                    }

                    const bookingStatus = getStatusVN(b.status);
                    const paymentStatus = getPaymentStatusVN(
                      b.payment_status ||
                        (b as { paymentStatus?: string }).paymentStatus ||
                        ""
                    );

                    // Thêm màu nền cho booking đã hủy
                    const rowClassName =
                      b.status === "cancelled"
                        ? "hover:bg-red-50/50 bg-red-50/30 border-none"
                        : "hover:bg-gray-50/50 border-none";

                    return (
                      <TableRow key={b._id} className={rowClassName}>
                        <TableCell className="text-center py-2 px-2">
                          <div className="">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {guestName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {guestEmail}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="font-medium text-gray-900 truncate max-w-[140px]">
                                {roomName}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">
                                  {propertyName}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">
                                  {new Date(b.checkInDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">
                                  {new Date(
                                    b.check_out_date
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">
                                  {b.guests}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <Badge
                                className={`${bookingStatus.color} font-medium`}
                              >
                                {bookingStatus.label}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <Badge
                                className={`${paymentStatus.color} font-medium`}
                              >
                                {paymentStatus.label}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-600" />
                                {b.payment_method === "vnpay"}
                                <span className="font-medium text-gray-900">
                                  {(
                                    b.payment_method as string
                                  )?.toUpperCase() || "N/A"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-2">
                              <div className="font-bold text-gray-700 text-sm">
                                {(b.final_amount || 0).toLocaleString()}₫
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <div className="p-2">
                            <BookingActions
                              booking={b}
                              propertyId={propertyId}
                              onSuccess={handleActionSuccess}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-16">
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Calendar className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Không có booking nào
                        </h3>
                        <p className="text-gray-600">
                          {filters.propertyId ||
                          filters.status ||
                          filters.paymentStatus ||
                          filters.search
                            ? "Không tìm thấy booking nào phù hợp với bộ lọc"
                            : "Chưa có booking nào được tạo trong hệ thống"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && allBookings.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/50">
              <div className="text-sm text-gray-600">
                Hiển thị {startItem} đến {endItem} trong tổng số {adminTotal}{" "}
                booking
                {totalPages > 1 && ` (Trang ${currentPage} / ${totalPages})`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
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
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingList;
