/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Temporarily disable TypeScript checking due to complex type inference issues with paymentStatus.label
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookingDetail,
  updateAdminBookingStatus,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import type { BookingDetail } from "@/types/booking.interface";
import { useSelector } from "react-redux";
import { useServices } from "@/hooks/useServices";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusVN, getPaymentStatusVN } from "@/helper/status";

// Define the interface for payment status
interface PaymentStatusVM {
  label: string;
  color: string;
}
import { toast } from "sonner";
import { BookingStatus, PaymentStatus } from "@/types/enum";
import CancellationDetailsModal from "./CancellationDetailsModal";
import EditCancellationModal from "./EditCancellationModal";
import StaffPaymentModal from "./StaffPaymentModal";
import AddServiceModal from "./AddServiceModal";
import {
  User,
  Settings,
  ArrowLeft,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Dumbbell,
  Baby,
  Dog,
  Camera,
  Music,
  Tv,
  Snowflake,
  Sun,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Star,
  AlertCircle,
  FileText,
  Building,
  CreditCard,
  Banknote,
  DollarSign,
  Package,
} from "lucide-react";

const BookingDetail: React.FC<{
  propertyId: string;
  bookingId: string;
  onBack: () => void;
}> = ({ propertyId, bookingId, onBack }) => {
  const dispatch = useAppDispatch();
  const { adminBookingDetail, loading, error } = useSelector(
    (state: RootState) => state.booking
  );
  const { services, getServices } = useServices();
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showEditCancellationModal, setShowEditCancellationModal] =
    useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const booking = adminBookingDetail as unknown as BookingDetail;

  useEffect(() => {
    if (propertyId && bookingId)
      dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));

    // Fetch services để lấy icon
    getServices();
  }, [dispatch, propertyId, bookingId, getServices]);

  // Action handlers
  const handleConfirmBooking = async () => {
    try {
      await dispatch(
        updateAdminBookingStatus({
          propertyId,
          id: bookingId,
          data: { status: BookingStatus.CONFIRMED },
        })
      ).unwrap();
      toast.success("Xác nhận booking thành công!");
      // Refresh booking data
      dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
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
          id: bookingId,
          data: { status: BookingStatus.COMPLETED },
        })
      ).unwrap();
      toast.success("Hoàn thành booking thành công!");
      // Refresh booking data
      dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
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
          id: bookingId,
          data: {
            status: BookingStatus.CANCELLED,
            payment_status: PaymentStatus.REFUNDING,
          },
        })
      ).unwrap();
      toast.success("Hủy booking thành công! Đang xử lý hoàn tiền...");
      // Refresh booking data
      dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
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
          id: bookingId,
          data: { payment_status: PaymentStatus.REFUNDED },
        })
      ).unwrap();
      toast.success("Hoàn tiền booking thành công!");
      // Refresh booking data
      dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi hoàn tiền booking";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
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

  if (!adminBookingDetail) return <p>Không tìm thấy booking (null)</p>;

  // Lấy các trường cần hiển thị
  const status = booking.status;
  const payment_status = booking.payment_status;
  const listing = booking.listingId;
  const guest = booking.guestId;
  const checkInDate = booking.checkInDate;
  const check_out_date = booking.check_out_date;
  const guests = booking.guests;
  const nights = booking.nights;
  const final_amount = booking.final_amount;
  const guest_name = booking.guest_name;
  const guest_email = booking.guest_email;
  const guest_phone = booking.guest_phone;
  const created_at = booking.created_at;
  const updated_at = booking.updated_at;
  const property = booking.propertyId;

  // Thêm các trường cho dịch vụ và voucher
  const selected_services =
    (booking.selected_services as Array<{
      service_name: string;
      quantity: number;
      service_price: number;
      total_price: number;
      service_id?: string;
    }>) || [];
  const voucher_code = booking.voucher_code;
  const voucher_discount_percent = booking.voucher_discount_percent || 0;
  const services_total_amount = booking.services_total_amount || 0;
  const subtotal_amount = booking.subtotal_amount || 0;
  const discount_amount = booking.discount_amount || 0;

  const paymentId = booking.payment_id || "";
  let paymentDate = "Chưa có";
  if (
    booking.vnpay_pay_date &&
    (typeof booking.vnpay_pay_date === "string" ||
      typeof booking.vnpay_pay_date === "number")
  ) {
    paymentDate = new Date(booking.vnpay_pay_date).toLocaleString();
  }

  // Helper functions
  function getGuestAvatar(guest: unknown): string | undefined {
    if (
      guest &&
      typeof guest === "object" &&
      "avatar" in guest &&
      typeof (guest as { avatar?: string }).avatar === "string"
    ) {
      return (guest as { avatar?: string }).avatar;
    }
    return undefined;
  }

  function getListingImage(listing: unknown): string | undefined {
    if (
      listing &&
      typeof listing === "object" &&
      "images" in listing &&
      Array.isArray((listing as { images?: string[] }).images)
    ) {
      return (listing as { images?: string[] }).images?.[0];
    }
    return undefined;
  }

  function hasListingFields(
    obj: unknown
  ): obj is { _id?: string; title?: string; address?: string } {
    return !!obj && typeof obj === "object";
  }

  function hasPropertyName(obj: unknown): obj is { name?: string } {
    return !!obj && typeof obj === "object" && "name" in obj;
  }

  function hasPropertyLocation(obj: unknown): obj is {
    location?: {
      address?: string;
      ward?: string;
      district?: string;
      city?: string;
    };
  } {
    return !!obj && typeof obj === "object" && "location" in obj;
  }

  // Parse propertyId nếu là string JSON
  let propertyObj: unknown = property;
  if (property && typeof property === "string") {
    try {
      const cleaned = property
        .replace(/ObjectId\('([a-fA-F0-9]+)'\)/g, '"$1"')
        .replace(/\n/g, "")
        .replace(/\s+/g, " ");
      propertyObj = JSON.parse(cleaned);
    } catch {
      propertyObj = null;
    }
  }

  // Service icon component - sử dụng icon từ bảng services
  const getServiceIcon = (service: {
    service_name: string;
    service_id?: string;
  }): React.ReactElement => {
    // Tìm service trong danh sách services đã fetch
    const matchedService = services.find((s) => {
      const serviceObj = s as {
        name?: string;
        _id?: string;
        icon_url?: string;
      };
      return (
        serviceObj.name?.toLowerCase() === service.service_name.toLowerCase() ||
        serviceObj._id === service.service_id
      );
    });

    if (
      matchedService &&
      typeof matchedService === "object" &&
      "icon_url" in matchedService &&
      matchedService.icon_url
    ) {
      return (
        <img
          src={matchedService.icon_url as string}
          alt={service.service_name}
          className="w-4 h-4 object-contain"
        />
      );
    }

    // Fallback to default icon if no icon_url
    const name = service.service_name.toLowerCase();
    if (name.includes("wifi")) return <Wifi className="w-4 h-4" />;
    if (name.includes("coffee") || name.includes("cà phê"))
      return <Coffee className="w-4 h-4" />;
    if (name.includes("parking") || name.includes("xe"))
      return <Car className="w-4 h-4" />;
    if (name.includes("breakfast") || name.includes("ăn sáng"))
      return <Utensils className="w-4 h-4" />;
    if (name.includes("gym") || name.includes("thể dục"))
      return <Dumbbell className="w-4 h-4" />;
    if (name.includes("baby") || name.includes("trẻ em"))
      return <Baby className="w-4 h-4" />;
    if (name.includes("pet") || name.includes("thú cưng"))
      return <Dog className="w-4 h-4" />;
    if (name.includes("camera") || name.includes("máy ảnh"))
      return <Camera className="w-4 h-4" />;
    if (name.includes("music") || name.includes("nhạc"))
      return <Music className="w-4 h-4" />;
    if (name.includes("tv") || name.includes("tivi"))
      return <Tv className="w-4 h-4" />;
    if (name.includes("ac") || name.includes("điều hòa"))
      return <Snowflake className="w-4 h-4" />;
    if (name.includes("heater") || name.includes("sưởi"))
      return <Sun className="w-4 h-4" />;
    if (name.includes("electric") || name.includes("điện"))
      return <Zap className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  // Đặt biến paymentStatus ngay trước phần JSX return
  const paymentStatus = getPaymentStatusVN(payment_status) as PaymentStatusVM;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                className={`${
                  getStatusVN(status).color
                } text-sm font-medium px-3 py-1`}
              >
                {getStatusVN(status).label}
              </Badge>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {status === BookingStatus.PENDING && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConfirmBooking}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Xác nhận
                  </Button>
                )}

                {status === BookingStatus.CONFIRMED &&
                  (() => {
                    const today = new Date();
                    const checkoutDate = new Date(check_out_date);
                    today.setHours(0, 0, 0, 0);
                    checkoutDate.setHours(0, 0, 0, 0);
                    const canComplete = today >= checkoutDate;

                    return (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleCompleteBooking}
                        disabled={!canComplete}
                        className={`${
                          canComplete
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        title={!canComplete ? "Chưa đến ngày checkout" : ""}
                      >
                        <Clock size={16} className="mr-2" />
                        Hoàn thành
                      </Button>
                    );
                  })()}

                {(status === BookingStatus.PENDING ||
                  status === BookingStatus.CONFIRMED) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelBooking}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-2" />
                    Hủy
                  </Button>
                )}

                {status === BookingStatus.CANCELLED &&
                  payment_status === PaymentStatus.REFUNDING && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleRefundBooking}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Hoàn tiền
                    </Button>
                  )}

                {/* Edit Cancellation Details Button - Show for cancelled bookings */}
                {status === BookingStatus.CANCELLED && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditCancellationModal(true)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <FileText size={16} className="mr-2" />
                    Chỉnh sửa thông tin hủy
                  </Button>
                )}

                {/* Staff Payment Button - Show for bookings that need payment */}
                {(status === BookingStatus.CONFIRMED ||
                  status === BookingStatus.PENDING) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <DollarSign size={16} className="mr-2" />
                    Thanh toán
                  </Button>
                )}

                {/* Add Service Button - Show for all active bookings */}
                {(status === BookingStatus.PENDING ||
                  status === BookingStatus.CONFIRMED ||
                  status === BookingStatus.COMPLETED) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddServiceModal(true)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Package size={16} className="mr-2" />
                    Thêm dịch vụ
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property & Guest Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                {getListingImage(listing) ? (
                  <img
                    src={getListingImage(listing)}
                    alt="room"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white rounded-lg px-2 py-1 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-500 inline mr-1" />
                  <span className="text-sm font-semibold text-gray-900">
                    Premium
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasListingFields(listing) && listing.title
                    ? listing.title
                    : "N/A"}
                </h3>
                <p className="text-gray-600 mb-2">
                  {hasPropertyName(propertyObj) && propertyObj.name
                    ? propertyObj.name
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {hasPropertyLocation(propertyObj) && propertyObj.location
                    ? [propertyObj.location.address].filter(Boolean).join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Guest Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                {getGuestAvatar(guest) ? (
                  <img
                    src={getGuestAvatar(guest)}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">
                    {typeof guest === "object" && guest !== null
                      ? guest.name
                      : guest_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {typeof guest === "object" && guest !== null
                      ? guest.email
                      : guest_email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số điện thoại:</span>
                  <span className="font-medium">
                    {typeof guest === "object" && guest !== null
                      ? guest.phone
                      : guest_phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Thông tin nhanh
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Check-in:</span>
                  <span className="text-sm font-medium">
                    {checkInDate
                      ? new Date(checkInDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Check-out:</span>
                  <span className="text-sm font-medium">
                    {check_out_date
                      ? new Date(check_out_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Số đêm:</span>
                  <span className="text-sm font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Số khách:</span>
                  <span className="text-sm font-medium">{guests}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin booking
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ngày đặt
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {created_at
                        ? new Date(created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Cập nhật lần cuối
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {updated_at
                        ? new Date(updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin thanh toán
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Payment ID
                    </label>
                    <p className="text-sm font-mono text-gray-900 mt-1">
                      {typeof paymentId === "string" && paymentId
                        ? paymentId
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trạng thái thanh toán
                    </label>
                    <div className="mt-1">
                      <Badge className={`${paymentStatus.color} text-xs`}>
                        {paymentStatus.label as string}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phương thức
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {typeof booking.payment_method === "string" &&
                      booking.payment_method
                        ? booking.payment_method.toUpperCase()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ngày thanh toán
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {typeof paymentDate === "string" ? paymentDate : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            {selected_services && selected_services.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dịch vụ đã chọn
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dịch vụ
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đơn giá
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selected_services.map((service, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-4 h-4">
                                  {getServiceIcon(service)}
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {service.service_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {service.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {service.service_price?.toLocaleString() || "0"}₫
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {service.total_price?.toLocaleString() || "0"}₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-sm font-medium text-gray-900"
                          >
                            Tổng dịch vụ:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                            {(
                              (services_total_amount as number) || 0
                            ).toLocaleString()}
                            ₫
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Voucher */}
            {voucher_code && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Voucher đã sử dụng
                  </h2>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {voucher_code as string}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Giảm giá
                      </label>
                      <div className="mt-1">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {voucher_discount_percent as number}%
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Số tiền giảm
                      </label>
                      <p className="text-sm font-bold text-red-600 mt-1">
                        -{((discount_amount as number) || 0).toLocaleString()}₫
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tổng kết thanh toán
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Giá phòng ({nights} đêm)
                    </span>
                    <span className="text-sm font-medium">
                      {((subtotal_amount as number) || 0).toLocaleString()}₫
                    </span>
                  </div>
                  {((services_total_amount as number) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Dịch vụ</span>
                      <span className="text-sm font-medium text-green-600">
                        +
                        {(
                          (services_total_amount as number) || 0
                        ).toLocaleString()}
                        ₫
                      </span>
                    </div>
                  )}
                  {((discount_amount as number) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Giảm giá</span>
                      <span className="text-sm font-medium text-red-600">
                        -{((discount_amount as number) || 0).toLocaleString()}₫
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng cộng
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {((final_amount as number) || 0).toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Information - Only show for cancelled bookings */}
            {status === BookingStatus.CANCELLED && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Thông tin hủy phòng
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditCancellationModal(true)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <FileText size={16} className="mr-2" />
                      Chỉnh sửa
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {booking.cancellationDetails ? (
                    <div className="space-y-6">
                      {/* Cancellation Reason */}
                      {booking.cancellationDetails.cancellationReason && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200 shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-red-900 mb-3">
                                Lý do hủy phòng
                              </h3>
                              <div className="bg-white rounded-lg p-4 border border-red-100">
                                <p className="text-sm text-red-800 leading-relaxed font-medium">
                                  {
                                    booking.cancellationDetails
                                      .cancellationReason
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Refund Information */}
                      {(booking.cancellationDetails.accountName ||
                        booking.cancellationDetails.bankName ||
                        booking.cancellationDetails.accountNumber ||
                        booking.cancellationDetails.refundMethod) && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-green-600" />
                            Thông tin hoàn tiền
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.cancellationDetails.accountName && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-900">
                                    Tên chủ tài khoản
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-green-800">
                                  {booking.cancellationDetails.accountName}
                                </p>
                              </div>
                            )}

                            {booking.cancellationDetails.bankName && (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-semibold text-blue-900">
                                    Ngân hàng
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-blue-800">
                                  {booking.cancellationDetails.bankName}
                                </p>
                              </div>
                            )}

                            {booking.cancellationDetails.accountNumber && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-semibold text-purple-900">
                                    Số tài khoản
                                  </span>
                                </div>
                                <p className="text-sm font-mono font-medium text-purple-800">
                                  {booking.cancellationDetails.accountNumber}
                                </p>
                              </div>
                            )}

                            {booking.cancellationDetails.refundMethod && (
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Banknote className="w-4 h-4 text-orange-600" />
                                  <span className="text-sm font-semibold text-orange-900">
                                    Phương thức hoàn tiền
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-orange-800">
                                  {booking.cancellationDetails.refundMethod ===
                                    "bank_transfer" && "Chuyển khoản ngân hàng"}
                                  {booking.cancellationDetails.refundMethod ===
                                    "cash" && "Tiền mặt"}
                                  {booking.cancellationDetails.refundMethod ===
                                    "credit_card" && "Thẻ tín dụng"}
                                  {booking.cancellationDetails.refundMethod ===
                                    "other" && "Khác"}
                                  {![
                                    "bank_transfer",
                                    "cash",
                                    "credit_card",
                                    "other",
                                  ].includes(
                                    booking.cancellationDetails.refundMethod
                                  ) && booking.cancellationDetails.refundMethod}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Refund Note */}
                      {booking.cancellationDetails.refundNote && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                                Ghi chú hoàn tiền
                              </h3>
                              <p className="text-sm text-yellow-800 leading-relaxed">
                                {booking.cancellationDetails.refundNote}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cancellation Timestamp */}
                      {booking.cancellationDetails
                        .cancellationDetailsUpdatedAt && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Cập nhật lần cuối:{" "}
                              {new Date(
                                booking.cancellationDetails.cancellationDetailsUpdatedAt
                              ).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có thông tin hủy phòng
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Khách hàng chưa cung cấp thông tin chi tiết về việc hủy
                        phòng hoặc thông tin chưa được cập nhật.
                      </p>
                      <Button
                        onClick={() => setShowEditCancellationModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Thêm thông tin hủy phòng
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Details Modal */}
      <CancellationDetailsModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        propertyId={propertyId}
        bookingId={bookingId}
        onSuccess={() => {
          // Refresh booking data after updating cancellation details
          dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
        }}
      />

      {/* Edit Cancellation Details Modal */}
      <EditCancellationModal
        isOpen={showEditCancellationModal}
        onClose={() => setShowEditCancellationModal(false)}
        cancellationDetails={booking.cancellationDetails}
        propertyId={propertyId}
        bookingId={bookingId}
        onSuccess={() => {
          // Refresh booking data after updating cancellation details
          dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
        }}
      />

      {/* Staff Payment Modal */}
      <StaffPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={booking}
        propertyId={propertyId}
        bookingId={bookingId}
        onSuccess={() => {
          // Refresh booking data after payment
          dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
        }}
      />

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        booking={booking}
        propertyId={propertyId}
        bookingId={bookingId}
        onSuccess={() => {
          // Refresh booking data after adding service
          dispatch(fetchAdminBookingDetail({ propertyId, id: bookingId }));
        }}
      />
    </div>
  );
};

export default BookingDetail;
