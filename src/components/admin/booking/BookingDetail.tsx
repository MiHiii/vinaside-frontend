import React, { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchAdminBookingDetail,
  updateAdminBookingStatus,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import type { BookingDetail } from "@/types/booking.interface";
import { useSelector } from "react-redux";
import { useServices } from "@/hooks/useServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusVN, getPaymentStatusVN } from "@/helper/status";
import { toast } from "sonner";
import { BookingStatus, PaymentStatus } from "@/types/enum";
import {
  User,
  Home,
  Calendar,
  CreditCard,
  FileText,
  Gift,
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

  if (loading) return <p>Đang tải...</p>;
  if (error)
    return (
      <p style={{ color: "red" }}>
        {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );
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
  const deposit_paid_amount = booking.deposit_paid_amount;
  const deposit_percent = booking.deposit_percent;
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
  }) => {
    // Tìm service trong danh sách services đã fetch
    const matchedService = services.find(
      (s) =>
        s.name.toLowerCase() === service.service_name.toLowerCase() ||
        s._id === service.service_id
    );

    if (matchedService?.icon_url) {
      return (
        <img
          src={matchedService.icon_url}
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết Booking</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusVN(status).color}>
            {getStatusVN(status).label}
          </Badge>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Confirm Booking - Chỉ hiển thị khi status là PENDING */}
            {status === BookingStatus.PENDING && (
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
            {status === BookingStatus.CONFIRMED && (
              <Button
                variant="default"
                size="sm"
                onClick={handleCompleteBooking}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Clock size={16} />
                Hoàn thành
              </Button>
            )}

            {/* Cancel Booking - Chỉ hiển thị khi status là PENDING hoặc CONFIRMED */}
            {(status === BookingStatus.PENDING ||
              status === BookingStatus.CONFIRMED) && (
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
            {status === BookingStatus.CANCELLED &&
              payment_status === PaymentStatus.REFUNDING && (
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
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Thông tin đặt chỗ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-blue-500" />
                Thông tin đặt chỗ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium w-1/3">
                      Booking ID
                    </TableCell>
                    <TableCell className="font-mono break-all w-2/3">
                      {booking._id}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ngày đặt</TableCell>
                    <TableCell>
                      {created_at
                        ? new Date(created_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Cập nhật lần cuối
                    </TableCell>
                    <TableCell>
                      {updated_at
                        ? new Date(updated_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Thông tin người dùng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-green-500" />
                Thông tin người dùng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {getGuestAvatar(guest) ? (
                  <img
                    src={getGuestAvatar(guest)}
                    alt="avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {typeof guest === "object" && guest !== null
                      ? guest.name
                      : guest_name}
                  </h3>
                  <p className="text-gray-600">
                    {typeof guest === "object" && guest !== null
                      ? guest.email
                      : guest_email}
                  </p>
                </div>
              </div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Số điện thoại</TableCell>
                    <TableCell>
                      {typeof guest === "object" && guest !== null
                        ? guest.phone
                        : guest_phone || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium w-1/3">User ID</TableCell>
                    <TableCell className="font-mono break-all w-2/3">
                      {typeof booking.guestId === "string"
                        ? booking.guestId
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Thông tin chỗ ở */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="text-orange-500" />
                Thông tin chỗ ở
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {getListingImage(listing) ? (
                  <img
                    src={getListingImage(listing)}
                    alt="room"
                    className="w-full h-48 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-full h-48 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                    <Camera className="w-12 h-12" />
                  </div>
                )}
              </div>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Tên phòng</TableCell>
                    <TableCell>
                      {hasListingFields(listing) && listing.title
                        ? listing.title
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Tên homestay</TableCell>
                    <TableCell>
                      {hasPropertyName(propertyObj) && propertyObj.name
                        ? propertyObj.name
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium w-1/3">
                      Địa chỉ phòng
                    </TableCell>
                    <TableCell className="w-2/3">
                      <div className="break-words text-sm">
                        {hasPropertyLocation(propertyObj) &&
                        propertyObj.location
                          ? [propertyObj.location.address]
                              .filter(Boolean)
                              .join(", ")
                          : "N/A"}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Thông tin lưu trú */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="text-purple-500" />
                Thông tin lưu trú
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Check-in</TableCell>
                    <TableCell>
                      {checkInDate
                        ? new Date(checkInDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Check-out</TableCell>
                    <TableCell>
                      {check_out_date
                        ? new Date(check_out_date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Số đêm</TableCell>
                    <TableCell>{nights}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Số khách</TableCell>
                    <TableCell>{guests}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Thông tin thanh toán */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="text-pink-500" />
                Thông tin thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium w-1/3">
                      Payment ID
                    </TableCell>
                    <TableCell className="font-mono break-all w-2/3">
                      {typeof paymentId === "string" && paymentId
                        ? paymentId
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Trạng thái</TableCell>
                    <TableCell>
                      <Badge
                        className={getPaymentStatusVN(payment_status).color}
                      >
                        {getPaymentStatusVN(payment_status).label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phương thức</TableCell>
                    <TableCell>
                      {typeof booking.payment_method === "string" &&
                      booking.payment_method
                        ? booking.payment_method.toUpperCase()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Tổng tiền</TableCell>
                    <TableCell className="font-semibold">
                      {typeof final_amount === "number" && final_amount !== null
                        ? final_amount.toLocaleString() + "₫"
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Đã trả trước</TableCell>
                    <TableCell>
                      {typeof deposit_paid_amount === "number" &&
                      deposit_paid_amount > 0
                        ? deposit_paid_amount.toLocaleString() + "₫"
                        : typeof deposit_percent === "number"
                        ? Math.round(deposit_percent * 100) + "%"
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Ngày thanh toán
                    </TableCell>
                    <TableCell>
                      {typeof paymentDate === "string" ? paymentDate : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Dịch vụ đã chọn */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="text-indigo-500" />
                Dịch vụ đã chọn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selected_services && selected_services.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Tổng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected_services.map(
                        (
                          service: {
                            service_name: string;
                            quantity: number;
                            service_price: number;
                            total_price: number;
                            service_id?: string;
                          },
                          index: number
                        ) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getServiceIcon(service)}
                                <span className="font-medium">
                                  {service.service_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {service.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {service.service_price?.toLocaleString() || "0"}₫
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {service.total_price?.toLocaleString() || "0"}₫
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-semibold">Tổng dịch vụ:</span>
                    <span className="font-semibold text-lg">
                      {(
                        (services_total_amount as number) || 0
                      ).toLocaleString()}
                      ₫
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có dịch vụ nào được chọn</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voucher đã sử dụng */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="text-yellow-500" />
                Voucher đã sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {voucher_code ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className="font-mono text-lg px-4 py-2"
                    >
                      {voucher_code as string}
                    </Badge>
                  </div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Giảm giá</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {voucher_discount_percent as number}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Số tiền giảm
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          -{((discount_amount as number) || 0).toLocaleString()}
                          ₫
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có voucher nào được sử dụng</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tổng kết thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="text-blue-500" />
            Tổng kết thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Giá phòng ({nights} đêm):</span>
              <span className="font-medium">
                {((subtotal_amount as number) || 0).toLocaleString()}₫
              </span>
            </div>
            {((services_total_amount as number) || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span>Dịch vụ:</span>
                <span className="font-medium text-blue-600">
                  +{((services_total_amount as number) || 0).toLocaleString()}₫
                </span>
              </div>
            )}
            {((discount_amount as number) || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span>Giảm giá:</span>
                <span className="font-medium text-green-600">
                  -{((discount_amount as number) || 0).toLocaleString()}₫
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-bold">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-600">
                {((final_amount as number) || 0).toLocaleString()}₫
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetail;
