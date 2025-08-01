import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchAdminBookings, fetchStaffBookings } from "@/store/slices/bookingSlice";
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
import { getPaymentStatusVN, getStatusVN } from "@/helper/status";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";

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
  const { adminBookings, staffBookings, loading, error } = useSelector(
    (state: RootState) => state.booking
  );
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  // Debug staff assignments
  useEffect(() => {
    if (isStaff && user?._id) {
      console.log('🔍 Checking staff assignments for user:', user._id);
      console.log('🔍 User object:', user);
      
      propertyStaffAssignmentApi.getPropertiesByStaff(user._id)
        .then(response => {
          console.log('🔍 Staff assignments response:', response);
          const properties = response.data?.data || response.data || [];
          console.log('🔍 Staff properties:', properties);
          
          // Log chi tiết từng property
          properties.forEach((prop: Record<string, unknown>, index: number) => {
            console.log(`🔍 Property ${index + 1}:`, {
              id: (prop._id as string) || (prop.propertyId as Record<string, unknown>)?.id as string,
              name: (prop.name as string) || (prop.propertyId as Record<string, unknown>)?.name as string,
              type: (prop.type as string) || (prop.propertyId as Record<string, unknown>)?.type as string
            });
          });

          // Log tất cả property IDs để so sánh với backend
          const propertyIds = properties.map((prop: Record<string, unknown>) => 
            (prop._id as string) || (prop.propertyId as Record<string, unknown>)?.id as string
          );
          console.log('🔍 All property IDs for staff:', propertyIds);
        })
        .catch(error => {
          console.error('🔍 Error fetching staff assignments:', error);
        });
    }
  }, [isStaff, user?._id]);

  // Fetch bookings for admin (all bookings)
  useEffect(() => {
    if (!isStaff) {
      console.log('🔍 Fetching admin bookings');
      dispatch(fetchAdminBookings({ ...filters, page }));
    }
  }, [dispatch, filters, page, isStaff]);

  // Fetch bookings for staff
  useEffect(() => {
    if (isStaff) {
      console.log('🔍 Fetching staff bookings with filters:', { ...filters, page, limit: 50 });
      dispatch(fetchStaffBookings({ 
        ...filters,
        page, 
        limit: 50
      }));
    }
  }, [isStaff, dispatch, filters, page]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleActionSuccess = () => {
    if (isStaff) {
      dispatch(fetchStaffBookings({ ...filters, page }));
    } else {
      dispatch(fetchAdminBookings({ ...filters, page }));
    }
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
  const allBookings = isStaff 
    ? (Array.isArray(staffBookings) ? staffBookings : [])
    : (Array.isArray(adminBookings) ? adminBookings : []);

  console.log('🔍 Debug BookingList:', {
    isStaff,
    staffBookingsLength: staffBookings?.length || 0,
    adminBookingsLength: adminBookings?.length || 0,
    allBookingsLength: allBookings?.length || 0,
    staffBookings: staffBookings?.slice(0, 2)?.map(b => ({
      id: b._id,
      guestName: b.guest_name,
      propertyName: typeof b.propertyId === 'object' ? (b.propertyId as { name?: string })?.name : b.propertyId,
      status: b.status
    }))
  });


  return (
    <div>
      <BookingFilter onFilterChange={handleFilterChange} />
      <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg overflow-x-auto mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 sticky top-0 z-10 text-base">
              <TableHead className="text-center">STT</TableHead>
              <TableHead className="text-center">Khách hàng</TableHead>
              <TableHead className="text-center">Phòng</TableHead>
              <TableHead className="text-center">HomeStay</TableHead>
              <TableHead className="text-center">Ngày vào</TableHead>
              <TableHead className="text-center">Ngày ra</TableHead>
              <TableHead className="text-center">Khách</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thanh toán</TableHead>
              <TableHead className="text-center">Phương thức</TableHead>
              <TableHead className="text-center">Tổng tiền</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
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
                  b.payment_status ||
                    (b as { paymentStatus?: string }).paymentStatus ||
                    ""
                );

                // Thêm màu nền cho booking đã hủy
                const rowClassName =
                  b.status === "cancelled"
                    ? "hover:bg-gray-100 bg-red-50 cursor-pointer"
                    : "hover:bg-gray-100 cursor-pointer";

                return (
                  <TableRow key={b._id} className={rowClassName}>
                    <TableCell className="text-center">{idx + 1}</TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        <div>
                          <div className="font-medium">{guestName}</div>
                          <div className="text-xs text-gray-500">
                            {guestEmail}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {roomName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {propertyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {new Date(b.checkInDate).toLocaleDateString("vi-VN")}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {new Date(b.check_out_date).toLocaleDateString("vi-VN")}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {b.guests}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        <Badge className={bookingStatus.color}>
                          {bookingStatus.label}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        <Badge className={paymentStatus.color}>
                          {paymentStatus.label}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {b.payment_method === "vnpay" && <VNPayIcon />}
                        {(b.payment_method as string)?.toUpperCase() || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <Link
                        to={`/admin/bookings/${propertyId}/${b._id}`}
                        className="block"
                      >
                        {(b.final_amount || 0).toLocaleString()}₫
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <BookingActions
                        booking={b}
                        propertyId={propertyId}
                        onSuccess={handleActionSuccess}
                      />
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
