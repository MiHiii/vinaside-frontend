import React from "react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex items-center gap-1">
      {/* View Details - Hiển thị cho tất cả booking */}
      <Link to={`/admin/bookings/${propertyId}/${booking._id}`}>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-blue-600 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
          title="Xem chi tiết"
        >
          <Eye size={14} />
        </Button>
      </Link>

      {/* Confirm Booking - Chỉ hiển thị khi status là PENDING */}
      {booking.status === BookingStatus.PENDING && (
        <Button
          variant="default"
          size="icon"
          onClick={handleConfirmBooking}
          className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-200 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105"
          title="Xác nhận booking"
        >
          <CheckCircle size={14} />
        </Button>
      )}

      {/* Complete Booking - Chỉ hiển thị khi status là CONFIRMED */}
      {booking.status === BookingStatus.CONFIRMED &&
        (() => {
          const today = new Date();
          const checkoutDate = new Date(booking.check_out_date);

          // Reset thời gian về 00:00:00 để so sánh chỉ ngày
          today.setHours(0, 0, 0, 0);
          checkoutDate.setHours(0, 0, 0, 0);

          const canComplete = today >= checkoutDate;

          return (
            <Button
              variant="default"
              size="icon"
              onClick={handleCompleteBooking}
              disabled={!canComplete}
              className={`h-8 w-8 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 ${
                canComplete
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                canComplete ? "Hoàn thành booking" : "Chưa đến ngày checkout"
              }
            >
              <Clock size={14} />
            </Button>
          );
        })()}

      {/* Cancel Booking - Chỉ hiển thị khi status là PENDING hoặc CONFIRMED */}
      {(booking.status === BookingStatus.PENDING ||
        booking.status === BookingStatus.CONFIRMED) && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleCancelBooking}
          className="h-8 w-8 text-orange-600 border-orange-600 hover:bg-orange-50 hover:border-orange-700 hover:text-orange-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
          title="Hủy booking"
        >
          <XCircle size={14} />
        </Button>
      )}

      {/* Refund Booking - Chỉ hiển thị khi status là CANCELLED và payment_status là REFUNDING */}
      {booking.status === BookingStatus.CANCELLED &&
        booking.payment_status === PaymentStatus.REFUNDING && (
          <Button
            variant="default"
            size="icon"
            onClick={handleRefundBooking}
            className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transition-all duration-200 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105"
            title="Hoàn tiền booking"
          >
            <RefreshCw size={14} />
          </Button>
        )}

      {/* Edit Cancellation Details - Chỉ hiển thị khi status là CANCELLED */}
      {booking.status === BookingStatus.CANCELLED && (
        <Link to={`/admin/bookings/${propertyId}/${booking._id}`}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-blue-600 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
            title="Chỉnh sửa thông tin hủy phòng"
          >
            <FileText size={14} />
          </Button>
        </Link>
      )}

      {/* Staff Payment - Chỉ hiển thị khi status là PENDING hoặc CONFIRMED */}
      {(booking.status === BookingStatus.PENDING ||
        booking.status === BookingStatus.CONFIRMED) && (
        <Link to={`/admin/bookings/${propertyId}/${booking._id}`}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-green-600 border-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
            title="Thanh toán số tiền còn lại"
          >
            <DollarSign size={14} />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default BookingActions;
