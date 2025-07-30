import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchAdminBookings } from "@/store/slices/bookingSlice";
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
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

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
  const { adminBookings, loading, error } = useSelector(
    (state: RootState) => state.booking
  );
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAdminBookings({ ...filters, page }));
  }, [dispatch, filters, page]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleActionSuccess = () => {
    dispatch(fetchAdminBookings({ ...filters, page }));
  };

  if (loading) return <p>Đang tải...</p>;
  if (error)
    return (
      <p className="text-red-500">
        {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );

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
  const allBookings = Array.isArray(adminBookings) ? adminBookings : [];

  return (
    <div>
      <BookingFilter onFilterChange={handleFilterChange} />
      <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg overflow-x-auto mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 sticky top-0 z-10 text-base">
              <TableHead className="text-center">STT</TableHead>
              <TableHead className="text-center">Booking ID</TableHead>
              <TableHead className="text-center">Khách hàng</TableHead>
              <TableHead className="text-center">Phòng</TableHead>
              <TableHead className="text-center">Property</TableHead>
              <TableHead className="text-center">Check-in</TableHead>
              <TableHead className="text-center">Check-out</TableHead>
              <TableHead className="text-center">Đêm</TableHead>
              <TableHead className="text-center">Khách</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thanh toán</TableHead>
              <TableHead className="text-center">Phương thức</TableHead>
              <TableHead className="text-center">Tổng tiền</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
              <TableHead className="text-center">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBookings.length > 0 ? (
              allBookings.map((b: BookingWithDeleted, idx) => {
                // Lấy thông tin khách
                const guestId = (b as { guestId?: { name?: string } }).guestId;
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
                if (typeof b.listingId === "object" && b.listingId !== null) {
                  roomName = b.listingId.title || "";
                } else if (typeof b.listingId === "string") {
                  roomName = b.listingId;
                }
                // Lấy thông tin property
                let propertyName = "";
                let propertyId = "";
                if (typeof b.propertyId === "object" && b.propertyId !== null) {
                  propertyName = (b.propertyId as { name?: string }).name || "";
                  propertyId = (b.propertyId as { _id?: string })._id || "";
                } else if (typeof b.propertyId === "string") {
                  propertyName = b.propertyId;
                  propertyId = b.propertyId;
                }

                const bookingStatus = getStatusVN(b.status);
                const paymentStatus = getPaymentStatusVN(
                  b.payment_status || (b as { paymentStatus?: string }).paymentStatus || ""
                );

                // Thêm màu nền cho booking đã hủy
                const rowClassName =
                  b.status === "cancelled"
                    ? "hover:bg-gray-50 bg-red-50"
                    : "hover:bg-gray-50";

                return (
                  <TableRow key={b._id} className={rowClassName}>
                    <TableCell className="text-center">{idx + 1}</TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {b._id.slice(-8)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div>
                        <div className="font-medium">{guestName}</div>
                        <div className="text-xs text-gray-500">
                          {guestEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{roomName}</TableCell>
                    <TableCell className="text-center">
                      {propertyName}
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(b.checkInDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-center">
                      {new Date(b.check_out_date).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.nights || 0}
                    </TableCell>
                    <TableCell className="text-center">{b.guests}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={bookingStatus.color}>
                        {bookingStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={paymentStatus.color}>
                        {paymentStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {b.payment_method === "vnpay" && <VNPayIcon />}
                      {(b.payment_method as string)?.toUpperCase() || "N/A"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {(b.final_amount || 0).toLocaleString()}₫
                    </TableCell>
                    <TableCell className="text-center">
                      <BookingActions
                        booking={b}
                        propertyId={propertyId}
                        onSuccess={handleActionSuccess}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Link to={`/admin/bookings/${propertyId}/${b._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8">
                  Không có booking nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingList;
