import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
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
import BookingActions from "@/components/admin/booking/BookingActions";
import {
  Calendar,
  Users,
  Building2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BookingItem {
  _id: string;
  guest?: { name?: string; email?: string };
  guest_name?: string | { name?: string; email?: string };
  guest_phone?: string;
  guestId?: string | { name?: string; email?: string };
  listingId?: string | { title?: string };
  propertyId?: string | { _id?: string; name?: string };
  status?: string;
  payment_status?: string;
  paymentStatus?: string;
  payment_method?: string;
  final_amount?: number;
  checkInDate?: string;
  check_out_date?: string;
  guests?: number;
}

interface ApiListResponse<T> {
  success?: boolean;
  data?: {
    data?: T[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

const getStatusVN = (status?: string) => {
  switch (status) {
    case "pending":
      return { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" };
    case "confirmed":
      return { label: "Đã xác nhận", color: "bg-green-100 text-green-800" };
    case "completed":
      return { label: "Hoàn thành", color: "bg-blue-100 text-blue-800" };
    case "cancelled":
      return { label: "Đã hủy", color: "bg-red-100 text-red-800" };
    case "rejected":
      return { label: "Từ chối", color: "bg-gray-100 text-gray-800" };
    default:
      return { label: status || "-", color: "bg-gray-100 text-gray-800" };
  }
};

const getPaymentStatusVN = (status?: string) => {
  switch (status) {
    case "unpaid":
      return { label: "Chưa thanh toán", color: "bg-red-100 text-red-800" };
    case "partially_paid":
      return {
        label: "Thanh toán một phần",
        color: "bg-yellow-100 text-yellow-800",
      };
    case "paid":
      return { label: "Đã thanh toán", color: "bg-green-100 text-green-800" };
    case "refunding":
      return {
        label: "Đang hoàn tiền",
        color: "bg-purple-100 text-purple-800",
      };
    case "refunded":
      return { label: "Đã hoàn tiền", color: "bg-blue-100 text-blue-800" };
    case "failed":
      return {
        label: "Thanh toán thất bại",
        color: "bg-gray-100 text-gray-800",
      };
    default:
      return { label: status || "-", color: "bg-gray-100 text-gray-800" };
  }
};

type Props = {
  propertyId: string;
};

export default function PropertyBookingsList({ propertyId }: Props) {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, unknown>>({
    status: "",
    paymentStatus: "",
    keyword: "",
  });
  const [pendingFilters, setPendingFilters] = useState<Record<string, unknown>>(
    {
      status: "",
      paymentStatus: "",
      keyword: "",
    }
  );

  const fetchData = async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
      );
      const params = {
        propertyId,
        page,
        limit,
        sortBy: "created_at",
        sortOrder: "desc",
        ...apiFilters,
      } as Record<string, unknown>;
      const res = await api.get<ApiListResponse<BookingItem>>("/bookings", {
        params,
      });
      const payload = (res.data?.data as any) || {};
      setBookings(payload.data || []);
      setTotal(payload.total || 0);
    } catch (e) {
      setError("Không tải được danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, page, limit, filters]);

  const totalPages = Math.ceil(total / limit) || 0;
  const currentBookings = useMemo(() => bookings, [bookings]);
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-2xl border border-white/20 shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Danh sách Booking theo Homestay
          </h2>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center mt-3">
          <div>
            <select
              value={
                pendingFilters.status
                  ? (pendingFilters.status as string)
                  : "all"
              }
              onChange={(e) => {
                const value = e.target.value;
                setPendingFilters((prev) => ({ ...prev, status: value }));
                const normalized = value === "all" ? undefined : value;
                setFilters((prev) => ({ ...prev, status: normalized }));
                setPage(1);
              }}
              className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
          <div>
            <select
              value={
                pendingFilters.paymentStatus
                  ? (pendingFilters.paymentStatus as string)
                  : "all"
              }
              onChange={(e) => {
                const value = e.target.value;
                setPendingFilters((prev) => ({
                  ...prev,
                  paymentStatus: value,
                }));
                const normalized = value === "all" ? undefined : value;
                setFilters((prev) => ({ ...prev, paymentStatus: normalized }));
                setPage(1);
              }}
              className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="partially_paid">Thanh toán một phần</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunding">Đang hoàn tiền</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="failed">Thanh toán thất bại</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Tìm theo tên khách, tên phòng..."
              value={
                pendingFilters.keyword ? (pendingFilters.keyword as string) : ""
              }
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  keyword: e.target.value,
                }))
              }
              className="w-[270px] h-10 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const processed = Object.fromEntries(
                  Object.entries(pendingFilters).map(([key, value]) => [
                    key,
                    value === "all" ? undefined : value,
                  ])
                );
                setFilters(processed);
                setPage(1);
              }}
              variant="outline"
              className="border-gray-300 px-3 py-2 hover:bg-gray-100 w-[120px]"
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const reset = {
                  status: "",
                  paymentStatus: "",
                  keyword: "",
                } as Record<string, unknown>;
                setPendingFilters(reset);
                setFilters(reset);
                setPage(1);
              }}
              className="border-gray-300 px-3 py-2 hover:bg-gray-100 w-[120px]"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-600">Đang tải...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : (
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
                currentBookings.map((b, idx) => {
                  // Guest
                  let guestName = "";
                  let guestEmail = "";
                  const guestAny = (b as any).guest;
                  const guestIdAny = (b as any).guestId;
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
                  } else if (typeof b.guest_name === "string") {
                    guestName = b.guest_name || guestName;
                  } else if (
                    typeof b.guest_name === "object" &&
                    (b.guest_name as any)?.name
                  ) {
                    guestName = (b.guest_name as any).name || guestName;
                    guestEmail =
                      typeof (b.guest_name as any).email === "string"
                        ? (b.guest_name as any).email
                        : guestEmail;
                  }

                  // Room
                  let roomName = "";
                  if (typeof b.listingId === "object" && b.listingId !== null) {
                    roomName = (b.listingId as any).title || "";
                  } else if (typeof b.listingId === "string") {
                    roomName = b.listingId;
                  }

                  // Property
                  let propertyName = "";
                  let propertyIdStr = "";
                  if (
                    typeof b.propertyId === "object" &&
                    b.propertyId !== null
                  ) {
                    propertyName = ((b.propertyId as any).name as string) || "";
                    propertyIdStr =
                      ((b.propertyId as any)._id as string) || propertyId;
                  } else if (typeof b.propertyId === "string") {
                    propertyName = b.propertyId;
                    propertyIdStr = b.propertyId;
                  } else {
                    propertyIdStr = propertyId;
                  }

                  const bookingStatus = getStatusVN(b.status);
                  const paymentStatus = getPaymentStatusVN(
                    b.payment_status || b.paymentStatus
                  );

                  return (
                    <TableRow
                      key={b._id}
                      className="hover:bg-gray-50/50 border-none cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/bookings/${propertyIdStr}/${b._id}`)
                      }
                    >
                      <TableCell className="text-center py-2 px-1 sm:px-2">
                        <div className="text-xs sm:text-sm">
                          {(page - 1) * limit + idx + 1}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
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
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="font-medium text-gray-900 truncate text-xs sm:text-sm max-w-[140px]">
                            {roomName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {propertyName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-xs sm:text-sm">
                              {b.checkInDate
                                ? new Date(b.checkInDate).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-xs sm:text-sm">
                              {b.check_out_date
                                ? new Date(b.check_out_date).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-xs sm:text-sm">
                              {b.guests}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <Badge
                            className={`${bookingStatus.color} font-medium text-xs`}
                          >
                            {bookingStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <Badge
                            className={`${paymentStatus.color} font-medium text-xs`}
                          >
                            {paymentStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {(b.payment_method as string)?.toUpperCase() ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <div className="font-bold text-gray-700 text-xs sm:text-sm">
                            {(b.final_amount || 0).toLocaleString()}₫
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-1 sm:px-2">
                        <div className="p-1 sm:p-2">
                          <BookingActions
                            // booking type from API may not match exact interface, cast is acceptable here
                            booking={b as any}
                            propertyId={propertyIdStr}
                            onSuccess={() => fetchData()}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-10">
                    Không có booking nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && bookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200/50 gap-3">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Hiển thị {startItem} đến {endItem} trong tổng số {total} booking
            {totalPages > 1 && ` (Trang ${page} / ${totalPages})`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 p-0 ${
                    page === pageNum
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
