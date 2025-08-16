import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingDetail } from "@/store/slices/bookingSlice";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Mail,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Edit,
  ExternalLink,
} from "lucide-react";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetail[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "unpaid":
      return "bg-red-100 text-red-800";
    case "partially_paid":
      return "bg-yellow-100 text-yellow-800";
    case "refunding":
      return "bg-orange-100 text-orange-800";
    case "refunded":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "cancelled":
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BookingDetailsModal({
  isOpen,
  onClose,
  bookingDetails,
}: BookingDetailsModalProps) {
  const navigate = useNavigate();

  const handleViewDetail = (booking: BookingDetail) => {
    // Navigate to booking detail page
    navigate(`/admin/bookings/${booking.propertyId}/${booking._id}`);
    onClose(); // Close modal after navigation
  };

  const handleViewProperty = (propertyId: string) => {
    // Navigate to property detail page
    navigate(`/admin/properties/${propertyId}`);
    onClose(); // Close modal after navigation
  };

  const handleViewListing = (propertyId: string, listingId: string) => {
    // Navigate to listing detail page
    navigate(`/admin/listings/${listingId}`);
    onClose(); // Close modal after navigation
  };
  if (!bookingDetails || bookingDetails.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          size="5xl"
          maxHeight="lg"
          overlayBlur={true}
          overlayOpacity="medium"
          className="bg-white border-0 shadow-2xl rounded-lg"
        >
          <DialogHeader>
            <DialogTitle>Chi tiết Booking</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">Không có dữ liệu booking</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="3xl"
        maxHeight="full"
        overlayBlur={true}
        overlayOpacity="medium"
        showCloseButton={true}
        closeButtonPosition="top-right"
        className="overflow-y-auto bg-white border-0 shadow-2xl rounded-lg"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Chi tiết Booking ({bookingDetails.length} booking)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {bookingDetails.map((booking, index) => (
            <Card key={booking._id} className="border border-gray-200">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.guest_name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {booking.guest_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">
                        {booking.status === "confirmed" && "Đã xác nhận"}
                        {booking.status === "pending" && "Chờ xác nhận"}
                        {booking.status === "cancelled" && "Đã hủy"}
                        {booking.status === "completed" && "Hoàn thành"}
                        {booking.status === "rejected" && "Từ chối"}
                      </span>
                    </Badge>
                    <Badge
                      className={getPaymentStatusColor(booking.payment_status)}
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      <span className="capitalize">
                        {booking.payment_status === "paid" && "Đã thanh toán"}
                        {booking.payment_status === "unpaid" &&
                          "Chưa thanh toán"}
                        {booking.payment_status === "partially_paid" &&
                          "Thanh toán một phần"}
                        {booking.payment_status === "refunding" &&
                          "Đang hoàn tiền"}
                        {booking.payment_status === "refunded" &&
                          "Đã hoàn tiền"}
                        {booking.payment_status === "failed" &&
                          "Thanh toán thất bại"}
                      </span>
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Property & Listing Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Thông tin chỗ nghỉ
                    </h4>
                    <div className="pl-6 space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.property_name}
                          </p>
                          <p className="text-xs text-gray-500">Tên chỗ nghỉ</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProperty(booking.propertyId)}
                          className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Xem
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.listing_title}
                          </p>
                          <p className="text-xs text-gray-500">Tên phòng</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleViewListing(
                              booking.propertyId,
                              booking.listingId
                            )
                          }
                          className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Xem
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Thông tin đặt phòng
                    </h4>
                    <div className="pl-6 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Check-in:</span>{" "}
                        {formatDate(booking.checkInDate)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Check-out:</span>{" "}
                        {formatDate(booking.check_out_date)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Số đêm:</span>{" "}
                        {booking.nights} đêm
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Thông tin thanh toán
                      </h4>
                      <div className="pl-6 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Tổng tiền:</span>{" "}
                          {formatCurrency(booking.final_amount)}
                        </p>
                        {booking.additionalCost > 0 && (
                          <p className="text-sm">
                            <span className="font-medium">
                              Chi phí phát sinh:
                            </span>{" "}
                            {formatCurrency(booking.additionalCost)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listing Images */}
                {booking.listing_images &&
                  booking.listing_images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        Hình ảnh phòng
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {booking.listing_images
                          .slice(0, 4)
                          .map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt={`Listing ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded-md"
                            />
                          ))}
                      </div>
                    </div>
                  )}

                <Separator className="my-4" />

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Tạo lúc: {formatDateTime(booking.created_at)}
                  </p>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetail(booking)}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
