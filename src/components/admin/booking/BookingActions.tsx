import React, { useState } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CancelBookingModal from "./CancelBookingModal";
import { PermissionGuard } from "@/components/common/PermissionGuard";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    description: "",
    confirmText: "Xác nhận",
    variant: "default" as "default" | "destructive",
  });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const showConfirm = (
    title: string,
    description: string,
    action: () => void,
    confirmText = "Xác nhận",
    variant: "default" | "destructive" = "default"
  ) => {
    setConfirmConfig({ title, description, confirmText, variant });
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
  };

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
    <>
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
              onClick={() =>
                showConfirm(
                  "Xác nhận booking",
                  `Bạn có chắc chắn muốn xác nhận booking cho khách hàng "${booking.guest_name}"?`,
                  handleConfirmBooking,
                  "Xác nhận"
                )
              }
              className="flex items-center gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-md px-2 py-1.5 transition-colors duration-200"
            >
              <CheckCircle size={14} />
              Xác nhận booking
            </DropdownMenuItem>
          )}

          {/* Complete Booking - Chỉ hiển thị khi status là CONFIRMED */}
          {booking.status === BookingStatus.CONFIRMED && (
            <DropdownMenuItem
              onClick={() =>
                canComplete &&
                showConfirm(
                  "Hoàn thành booking",
                  `Bạn có chắc chắn muốn hoàn thành booking cho khách hàng "${booking.guest_name}"?`,
                  handleCompleteBooking,
                  "Hoàn thành"
                )
              }
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
              <PermissionGuard permission='booking.cancel'>
                <DropdownMenuItem
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-md px-2 py-1.5 transition-colors duration-200"
                >
                  <XCircle size={14} />
                  Hủy booking
                </DropdownMenuItem>
              </PermissionGuard>
              
            </>
          )}

          {/* Refund Booking - Chỉ hiển thị khi status là CANCELLED và payment_status là REFUNDING */}
          {booking.status === BookingStatus.CANCELLED &&
            booking.payment_status === PaymentStatus.REFUNDING && (
              <DropdownMenuItem
                onClick={() =>
                  showConfirm(
                    "Hoàn tiền booking",
                    `Bạn có chắc chắn muốn hoàn tiền booking cho khách hàng "${booking.guest_name}"?`,
                    handleRefundBooking,
                    "Hoàn tiền"
                  )
                }
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
                className="flex items-center gap-2 text-green-600 hover:bg-green-700 rounded-md px-2 py-1.5 transition-colors duration-200"
              >
                <DollarSign size={14} />
                Thanh toán số tiền còn lại
              </Link>
            </DropdownMenuItem>
          )}

          {/* Completed Booking Info - Chỉ hiển thị khi status là COMPLETED */}
          {booking.status === BookingStatus.COMPLETED && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled
                className="flex items-center gap-2 text-gray-400 cursor-not-allowed rounded-md px-2 py-1.5"
              >
                <CheckCircle size={14} />
                Booking đã hoàn thành
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={handleConfirm}
      />

      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={booking}
        onSuccess={() => {
          onSuccess?.();
          setShowCancelModal(false);
        }}
      />
    </>
  );
};

export default BookingActions;
