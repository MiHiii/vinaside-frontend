import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateAdminBookingStatus } from "@/store/slices/bookingSlice";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import { BookingStatus, PaymentStatus } from "@/types/enum";
import type { Booking } from "@/types/booking.interface";
import { Link } from "react-router-dom";

interface BookingActionsProps {
  booking: Booking;
  propertyId: string;
  onSuccess?: () => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({
  booking,
  propertyId,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleConfirmBooking = async () => {
    try {
      await dispatch(
        updateAdminBookingStatus({
          propertyId,
          id: booking._id,
          data: { status: BookingStatus.CONFIRMED },
        })
      ).unwrap();
      toast.success("Xác nhận booking thành công!");
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xác nhận booking";
      toast.error(errorMessage);
    }
  };

  const handleCompleteBooking = async () => {
    // Kiểm tra xem đã đến ngày checkout chưa
    const today = new Date();
    const checkoutDate = new Date(booking.check_out_date);

    // Reset thời gian về 00:00:00 để so sánh chỉ ngày
    today.setHours(0, 0, 0, 0);
    checkoutDate.setHours(0, 0, 0, 0);

    if (today < checkoutDate) {
      toast.error("Không thể hoàn thành booking trước ngày checkout!");
      return;
    }

    try {
      await dispatch(
        updateAdminBookingStatus({
          propertyId,
          id: booking._id,
          data: { status: BookingStatus.COMPLETED },
        })
      ).unwrap();
      toast.success("Hoàn thành booking thành công!");
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hoàn thành booking";
      toast.error(errorMessage);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await dispatch(
        updateAdminBookingStatus({
          propertyId,
          id: booking._id,
          data: {
            status: BookingStatus.CANCELLED,
            payment_status: PaymentStatus.REFUNDING,
          },
        })
      ).unwrap();
      toast.success("Hủy booking thành công! Đang xử lý hoàn tiền...");
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hủy booking";
      toast.error(errorMessage);
    }
  };

  const handleRefundBooking = async () => {
    try {
      await dispatch(
        updateAdminBookingStatus({
          propertyId,
          id: booking._id,
          data: { payment_status: PaymentStatus.REFUNDED },
        })
      ).unwrap();
      toast.success("Hoàn tiền booking thành công!");
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hoàn tiền booking";
      toast.error(errorMessage);
    }
  };

  // Kiểm tra có thể hoàn thành booking không
  const canComplete = (() => {
    const today = new Date();
    const checkoutDate = new Date(booking.check_out_date);
    today.setHours(0, 0, 0, 0);
    checkoutDate.setHours(0, 0, 0, 0);
    return today >= checkoutDate;
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
        >
          <MoreHorizontal size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-62 bg-white border border-gray-200 shadow-md rounded-lg p-2"
      >
        {/* View Details - Hiển thị cho tất cả booking */}
        <DropdownMenuItem asChild>
          <Link
            to={`/admin/bookings/${propertyId}/${booking._id}`}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 rounded-md px-2 py-1.5 transition-colors duration-200"
          >
            <Eye size={14} />
            Xem chi tiết
          </Link>
        </DropdownMenuItem>

        {/* Confirm Booking - Chỉ hiển thị khi status là PENDING */}
        {booking.status === BookingStatus.PENDING && (
          <DropdownMenuItem
            onClick={handleConfirmBooking}
            className="flex items-center gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-md px-2 py-1.5 transition-colors duration-200"
          >
            <CheckCircle size={14} />
            Xác nhận booking
          </DropdownMenuItem>
        )}

        {/* Complete Booking - Chỉ hiển thị khi status là CONFIRMED */}
        {booking.status === BookingStatus.CONFIRMED && (
          <DropdownMenuItem
            onClick={handleCompleteBooking}
            disabled={!canComplete}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-200 ${
              canComplete
                ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <Clock size={14} />
            {canComplete ? "Hoàn thành booking" : "Chưa đến ngày checkout"}
          </DropdownMenuItem>
        )}

        {/* Cancel Booking - Chỉ hiển thị khi status là PENDING hoặc CONFIRMED */}
        {(booking.status === BookingStatus.PENDING ||
          booking.status === BookingStatus.CONFIRMED) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancelBooking}
              className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-md px-2 py-1.5 transition-colors duration-200"
            >
              <XCircle size={14} />
              Hủy booking
            </DropdownMenuItem>
          </>
        )}

        {/* Refund Booking - Chỉ hiển thị khi status là CANCELLED và payment_status là REFUNDING */}
        {booking.status === BookingStatus.CANCELLED &&
          booking.payment_status === PaymentStatus.REFUNDING && (
            <DropdownMenuItem
              onClick={handleRefundBooking}
              className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-md px-2 py-1.5 transition-colors duration-200"
            >
              <RefreshCw size={14} />
              Hoàn tiền booking
            </DropdownMenuItem>
          )}

        {/* Edit Cancellation Details - Chỉ hiển thị khi status là CANCELLED */}
        {booking.status === BookingStatus.CANCELLED && (
          <DropdownMenuItem asChild>
            <Link
              to={`/admin/bookings/${propertyId}/${booking._id}`}
              className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 rounded-md px-2 py-1.5 transition-colors duration-200"
            >
              <FileText size={14} />
              Chỉnh sửa thông tin hủy phòng
            </Link>
          </DropdownMenuItem>
        )}

        {/* Staff Payment - Chỉ hiển thị khi status là PENDING hoặc CONFIRMED */}
        {(booking.status === BookingStatus.PENDING ||
          booking.status === BookingStatus.CONFIRMED) && (
          <DropdownMenuItem asChild>
            <Link
              to={`/admin/bookings/${propertyId}/${booking._id}`}
              className="flex items-center gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-md px-2 py-1.5 transition-colors duration-200"
            >
              <DollarSign size={14} />
              Thanh toán số tiền còn lại
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookingActions;
