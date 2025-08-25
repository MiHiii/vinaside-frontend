import React, { useEffect, useState } from "react";
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
import BookingActions from "./BookingActions";
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
import { Link } from "react-router-dom";
import { exportBookingsCsv } from "@/store/slices/bookingSlice";
import { useUserRole } from "@/hooks/useUserRole";
import { api } from "@/services/api";
import {
  Calendar,
  Users,
  Building2,
  CreditCard,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
} from "lucide-react";

interface ApiResponse {
  data?: {
    data?: {
      data?: {
        name?: string;
        fullName?: string;
        username?: string;
        email?: string;
      };
      name?: string;
      fullName?: string;
      username?: string;
      email?: string;
    };
    name?: string;
    fullName?: string;
    username?: string;
    email?: string;
  };
}

const BookingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isStaff } = useUserRole();
  const { adminBookings, staffBookings, adminTotal, loading, error } =
    useSelector((state: RootState) => state.booking);
  const properties = useSelector(selectProperties);

  // State cho bộ lọc và phân trang
  const [filters, setFilters] = useState<Record<string, unknown>>({
    propertyId: "",
    status: "",
    paymentStatus: "",
    keyword: "",
  });
  // Bộ lọc nháp (chỉ áp dụng khi bấm Tìm kiếm)
  const [pendingFilters, setPendingFilters] = useState<Record<string, unknown>>(
    {
      propertyId: "",
      status: "",
      paymentStatus: "",
      keyword: "",
    }
  );
  // Map lưu tên/email khách từ guestId dạng string
  const [guestMap, setGuestMap] = useState<
    Record<string, { name?: string; email?: string }>
  >({});
  // Giữ cơ chế fetch ban đầu (lúc đầu có dữ liệu và theo phân trang)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch properties for filter dropdown
  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchProperties({ limit: 100 }));
    }
  }, [dispatch, properties.length]);

  // Fetch khi mount, khi đổi trang, hoặc khi filters áp dụng
  useEffect(() => {
    if (!isStaff) {
      const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const params = {
        ...apiFilters,
        page: currentPage,
        limit: itemsPerPage,
      } as Record<string, unknown>;

      dispatch(fetchAdminBookings(params));
    } else {
      const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
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
  }, [dispatch, isStaff, filters, currentPage, itemsPerPage]);

  // Khi danh sách bookings thay đổi, tải thông tin guest nếu chỉ có guestId dạng string
  useEffect(() => {
    const bookings = isStaff
      ? Array.isArray(staffBookings)
        ? staffBookings
        : []
      : Array.isArray(adminBookings)
      ? adminBookings
      : [];

    const ids = Array.from(
      new Set(
        bookings
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((b: any) =>
            typeof b?.guestId === "string" ? (b.guestId as string) : null
          )
          .filter((id: string | null): id is string => Boolean(id))
      )
    );
    const idsToFetch = ids.filter((id) => !guestMap[id]);
    if (idsToFetch.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled(
          idsToFetch.map((id) => api.get(`/users/${id}`))
        );
        const newEntries: Record<string, { name?: string; email?: string }> =
          {};
        results.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            const payload =
              (res.value as ApiResponse)?.data?.data?.data ||
              (res.value as ApiResponse)?.data?.data ||
              (res.value as ApiResponse)?.data;
            if (payload) {
              const name: string | undefined =
                payload.name || payload.fullName || payload.username;
              const email: string | undefined = payload.email;
              newEntries[idsToFetch[idx]] = { name, email };
            }
          }
        });
        if (!cancelled && Object.keys(newEntries).length > 0) {
          setGuestMap((prev) => ({ ...prev, ...newEntries }));
        }
      } catch {
        // ignore errors per-id
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminBookings, staffBookings, isStaff, guestMap]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    // Cập nhật bộ lọc nháp, chưa gọi API
    setPendingFilters(newFilters);
  };

  // Áp dụng ngay các thay đổi cho select (propertyId, status, paymentStatus)
  const applyImmediateFiltersChange = (changes: Record<string, unknown>) => {
    setPendingFilters((prev) => ({ ...prev, ...changes }));
    const converted: Record<string, unknown> = {};
    Object.entries(changes).forEach(([key, value]) => {
      converted[key] = value === "all" ? undefined : value;
    });
    setFilters((prev) => ({ ...prev, ...converted }));
    setCurrentPage(1);
  };

  const applySearch = () => {
    // Convert "all" values to undefined chỉ khi bấm tìm kiếm
    const processedFilters = Object.fromEntries(
      Object.entries(pendingFilters).map(([key, value]) => [
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
        ([, value]) => value !== undefined && value !== ""
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
      <div className="max-w-full mx-auto">
        {/* Filter Section */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <Search className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            {/* Property Filter */}
            <div className="w-full sm:w-auto min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Homestay
              </label>
              <select
                value={
                  pendingFilters.propertyId
                    ? (pendingFilters.propertyId as string)
                    : "all"
                }
                onChange={(e) =>
                  applyImmediateFiltersChange({ propertyId: e.target.value })
                }
                className="w-full sm:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả homestay</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-auto min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={
                  pendingFilters.status
                    ? (pendingFilters.status as string)
                    : "all"
                }
                onChange={(e) =>
                  applyImmediateFiltersChange({ status: e.target.value })
                }
                className="w-full sm:w-auto min-w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="w-full sm:w-auto min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái thanh toán
              </label>
              <select
                value={
                  pendingFilters.paymentStatus
                    ? (pendingFilters.paymentStatus as string)
                    : "all"
                }
                onChange={(e) =>
                  applyImmediateFiltersChange({ paymentStatus: e.target.value })
                }
                className="w-full sm:w-auto min-w-[180px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Keyword */}
            <div className="w-full sm:w-auto min-w-0 flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ khóa
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên khách, tên phòng, tên homestay"
                value={
                  pendingFilters.keyword
                    ? (pendingFilters.keyword as string)
                    : ""
                }
                onChange={(e) =>
                  handleFilterChange({
                    ...pendingFilters,
                    keyword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Clear Filters */}
            <div className="w-full sm:w-auto flex items-center gap-2 mt-2 sm:mt-7">
              <Button
                onClick={applySearch}
                variant="outline"
                className="border-gray-300 px-3 py-2 hover:bg-gray-100"
                title="Tìm kiếm"
              >
                Tìm kiếm
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const reset = {
                    propertyId: "",
                    status: "",
                    paymentStatus: "",
                    keyword: "",
                  } as Record<string, unknown>;
                  setPendingFilters(reset);
                  setFilters(reset);
                  setCurrentPage(1);
                }}
                className="border-gray-300 px-3 py-2 hover:bg-gray-100"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Danh sách Booking
                </h2>
              </div>
              <Button
                onClick={async () => {
                  const apiFilters = Object.fromEntries(
                    Object.entries(filters).filter(
                      ([, value]) => value !== undefined && value !== ""
                    )
                  );
                  const params = {
                    ...apiFilters,
                    page: currentPage,
                    limit: itemsPerPage,
                  } as Record<string, unknown>;

                  try {
                    const action = await dispatch(exportBookingsCsv(params));
                    if (exportBookingsCsv.fulfilled.match(action)) {
                      const url = action.payload.blobUrl;
                      const a = document.createElement("a");
                      a.href = url;
                      const timestamp = new Date()
                        .toISOString()
                        .replace(/[:.]/g, "-");
                      a.download = `bookings-${timestamp}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } else {
                      console.error("Export CSV failed", action);
                    }
                  } catch (e) {
                    console.error("Export CSV error", e);
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 w-full sm:w-auto"
                title="Xuất CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Xuất báo cáo</span>
                <span className="sm:hidden">Xuất CSV</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="border-none min-w-[1200px]">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-none">
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-12">
                    STT
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-32">
                    Khách hàng
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-32">
                    Phòng
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-32">
                    HomeStay
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-24">
                    Ngày vào
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-24">
                    Ngày ra
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-16">
                    Khách
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-24">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-24">
                    Thanh toán
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-24">
                    Phương thức
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-24">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-2 px-1 sm:px-2 w-20">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBookings.length > 0 ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  currentBookings.map((b: any, idx) => {
                    // Lấy thông tin khách với các trường hợp: guest, guestId object, guest_name string, hoặc guestId string (resolve qua guestMap)
                    let guestName = "";
                    let guestEmail = "";
                    const guestIdAny = b?.guestId;
                    const guestAny = b?.guest;
                    if (guestAny && typeof guestAny === "object") {
                      guestName = guestAny.name || guestName;
                      guestEmail =
                        typeof guestAny.email === "string"
                          ? guestAny.email
                          : guestEmail;
                    } else if (guestIdAny && typeof guestIdAny === "object") {
                      guestName = guestIdAny.name || guestName;
                      guestEmail =
                        typeof guestIdAny.email === "string"
                          ? guestIdAny.email
                          : guestEmail;
                    } else if (typeof b?.guest_name === "string") {
                      guestName = b.guest_name || guestName;
                    } else if (
                      typeof b?.guest_name === "object" &&
                      b?.guest_name?.name
                    ) {
                      guestName = b.guest_name.name || guestName;
                      guestEmail =
                        typeof b.guest_name.email === "string"
                          ? b.guest_name.email
                          : guestEmail;
                    } else if (typeof guestIdAny === "string") {
                      const resolved = guestMap[guestIdAny];
                      if (resolved) {
                        guestName = resolved.name || guestName;
                        guestEmail = resolved.email || guestEmail;
                      }
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
                        <TableCell className="text-center py-2 px-1 sm:px-2">
                          <div className="text-xs sm:text-sm">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="">
                              <div className="flex items-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 hover:text-gray-500 transition-colors text-xs sm:text-sm truncate">
                                    {guestName}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {guestEmail}
                                  </div>
                                  {b.guest_phone && (
                                    <div className="text-xs text-gray-400 truncate">
                                      {b.guest_phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="font-medium text-gray-900 truncate text-xs sm:text-sm max-w-[120px] sm:max-w-[140px]">
                                {roomName}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                  {propertyName}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                  {new Date(b.checkInDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                  {new Date(
                                    b.check_out_date
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                  {b.guests}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <Badge
                                className={`${bookingStatus.color} font-medium text-xs`}
                              >
                                {bookingStatus.label}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <Badge
                                className={`${paymentStatus.color} font-medium text-xs`}
                              >
                                {paymentStatus.label}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                  {(
                                    b.payment_method as string
                                  )?.toUpperCase() || "N/A"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="p-1 sm:p-2">
                              <div className="font-bold text-gray-700 text-xs sm:text-sm">
                                {(b.final_amount || 0).toLocaleString()}₫
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-2 px-1 sm:px-2">
                          <div className="p-1 sm:p-2">
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
                          filters.keyword
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
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200/50 gap-3">
              <div className="text-sm text-gray-600 text-center sm:text-left">
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
