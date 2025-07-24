import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookings,
  updateAdminBookingStatus,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import BookingFilter from "./BookingFilter";
import type { Booking } from "@/types/booking.interface";
import { Link } from "react-router-dom";
import { BookingStatus } from "@/types/enum";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPaymentStatusVN, getStatusVN } from "@/helper/status";

type BookingWithDeleted = Booking & {
  isDeleted?: boolean;
  deleted?: boolean;
  payment_status?: string;
  paymentStatus?: string;
  nights?: number;
  paymentMethod?: string;
  payment_method?: string;
};

const BookingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { adminBookings, loading, error, pagination } = useSelector(
    (state: RootState) =>
      state.booking as {
        adminBookings: BookingWithDeleted[];
        loading: boolean;
        error: unknown;
        pagination?: { limit: number };
      }
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

  // Add type guard for _id
  function hasId(obj: unknown): obj is { _id: string } {
    return (
      !!obj &&
      typeof obj === "object" &&
      "_id" in obj &&
      typeof (obj as { _id: unknown })._id === "string"
    );
  }

  return (
    <div>
      <BookingFilter onFilterChange={handleFilterChange} />
      <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg overflow-x-auto mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 sticky top-0 z-10 text-base">
              <TableHead className="text-center">STT</TableHead>
              <TableHead className="text-center">Booking ID</TableHead>
              <TableHead className="text-center">User</TableHead>
              <TableHead className="text-center">Room</TableHead>
              <TableHead className="text-center">Property</TableHead>
              <TableHead className="text-center">Check-in</TableHead>
              <TableHead className="text-center">Check-out</TableHead>
              <TableHead className="text-center">Nights</TableHead>
              <TableHead className="text-center">Guests</TableHead>
              <TableHead className="text-center">Booking Status</TableHead>
              <TableHead className="text-center">Payment Status</TableHead>
              <TableHead className="text-center">Payment Method</TableHead>
              <TableHead className="text-center">Total Amount</TableHead>
              <TableHead className="text-center">Created At</TableHead>
              <TableHead className="text-center">Updated At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(adminBookings) && adminBookings.length > 0 ? (
              adminBookings.map((b: BookingWithDeleted, idx) => {
                // Lấy thông tin khách
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const guestId = (b as any).guestId;
                let guestName = "";
                let guestEmail = "";
                if (typeof guestId === "object" && guestId !== null) {
                  guestName = guestId.name || "";
                  guestEmail = guestId.email || "";
                } else if (typeof b.guest_name === "string") {
                  guestName = b.guest_name;
                }
                // Lấy thông tin phòng
                let roomName = "";
                let roomId = "";
                if (typeof b.listingId === "object" && b.listingId !== null) {
                  roomName = b.listingId.title || "";
                  roomId = hasId(b.listingId) ? b.listingId._id : "";
                } else if (typeof b.listingId === "string") {
                  roomId = b.listingId;
                }
                // Lấy tên property
                let propertyName = "";
                if (
                  typeof b.propertyId === "object" &&
                  b.propertyId !== null &&
                  "name" in b.propertyId
                ) {
                  propertyName = (b.propertyId as { name?: string }).name || "";
                } else if (typeof b.propertyId === "string") {
                  propertyName = b.propertyId;
                }
                // Payment method
                const payment_method =
                  b.payment_method || b.paymentMethod || "";
                return (
                  <TableRow
                    key={b._id}
                    className={`transition hover:bg-blue-50 ${
                      b.isDeleted ? "opacity-50" : ""
                    }`}
                  >
                    <TableCell className="text-center">{idx + 1}</TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {b._id}
                    </TableCell>
                    <TableCell className="text-center">
                      {guestName}
                      <br />
                      <span className="text-xs text-gray-400">
                        {guestEmail}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {roomName}
                      <br />
                      <span className="text-xs text-gray-400">{roomId}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {propertyName}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.checkInDate ? b.checkInDate.slice(0, 10) : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.check_out_date ? b.check_out_date.slice(0, 10) : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {typeof b.nights === "number" ? b.nights : ""}
                    </TableCell>
                    <TableCell className="text-center">{b.guests}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`px-2 py-1 rounded-lg font-semibold ${
                          getStatusVN(b.status).color
                        }`}
                      >
                        {getStatusVN(b.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`px-2 py-1 rounded-lg font-semibold ${
                          getPaymentStatusVN(
                            b.payment_status || b.paymentStatus || ""
                          ).color
                        }`}
                      >
                        {
                          getPaymentStatusVN(
                            b.payment_status || b.paymentStatus || ""
                          ).label
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {payment_method === "vnpay" ? (
                        <span className="flex items-center justify-center">
                          <VNPayIcon />
                          vnpay
                        </span>
                      ) : payment_method ? (
                        payment_method
                      ) : (
                        <span className="italic text-gray-400">
                          Chưa thanh toán
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.final_amount?.toLocaleString() ||
                        b.total_price?.toLocaleString() ||
                        ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {b.updatedAt
                        ? new Date(b.updatedAt).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        title="Chi tiết"
                      >
                        <Link to={`/admin/bookings/${b.propertyId}/${b._id}`}>
                          📄
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        title="Xác nhận"
                        onClick={() =>
                          dispatch(
                            updateAdminBookingStatus({
                              propertyId: b.propertyId,
                              id: b._id,
                              data: { status: BookingStatus.CONFIRMED },
                            })
                          )
                        }
                      >
                        ✅
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="px-2 py-1 text-xs"
                        title="Hủy đặt chỗ"
                      >
                        ❌
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        title="Hoàn tiền"
                      >
                        💵
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="text-center">
                  Không có booking
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          variant="outline"
        >
          Trang trước
        </Button>
        <span className="font-medium">Trang {page}</span>
        <Button
          disabled={
            adminBookings.length < ((pagination && pagination.limit) || 10)
          }
          onClick={() => setPage(page + 1)}
          variant="outline"
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
};

export default BookingList;
