import React from "react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateAdminBookingStatus } from "@/store/slices/bookingSlice";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, RefreshCw, Eye } from "lucide-react";
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
    <div className="flex flex-wrap gap-2">
      {/* View Details - Hiển thị cho tất cả booking */}
      <Link to={`/admin/bookings/${propertyId}/${booking._id}`}>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Eye size={16} />
          Chi tiết
        </Button>
      </Link>

      {/* Confirm Booking - Chỉ hiển thị khi status là PENDING */}
      {booking.status === BookingStatus.PENDING && (
        <Button
          variant="default"
          size="sm"
          onClick={handleConfirmBooking}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle size={16} />
          Xác nhận
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
              size="sm"
              onClick={handleCompleteBooking}
              disabled={!canComplete}
              className={`flex items-center gap-2 ${
                canComplete
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              title={!canComplete ? "Chưa đến ngày checkout" : ""}
            >
              <Clock size={16} />
              Hoàn thành
            </Button>
          );
        })()}

      {/* Cancel Booking - Chỉ hiển thị khi status là PENDING hoặc CONFIRMED */}
      {(booking.status === BookingStatus.PENDING ||
        booking.status === BookingStatus.CONFIRMED) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancelBooking}
          className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          <XCircle size={16} />
          Hủy
        </Button>
      )}

      {/* Refund Booking - Chỉ hiển thị khi status là CANCELLED và payment_status là REFUNDING */}
      {booking.status === BookingStatus.CANCELLED &&
        booking.payment_status === PaymentStatus.REFUNDING && (
          <Button
            variant="default"
            size="sm"
            onClick={handleRefundBooking}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw size={16} />
            Hoàn tiền
          </Button>
        )}
    </div>
  );
};

export default BookingActions;
