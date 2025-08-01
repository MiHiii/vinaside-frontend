import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getMyBookingHistory } from "@/store/slices/bookingSlice";
import { BookingData, isListingObj } from "@/types/booking";
import { BookingStatus, PaymentStatus, CancelPolicy } from "@/types/enum";
import { api } from "@/services/api";
import { toast } from "sonner";
import {
  Calendar,
  DollarSign,
  FileText,
  Star,
  Redo,
  MessageCircle,
  X,
  Info,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Package,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { postReview } from "@/store/slices/reviewSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, Link } from "react-router-dom";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import MessageHostDialog from "../roomdetail/MessageHostDialog";


const STATUS_UPCOMING = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

// Helper function to extract property ID string from booking.propertyId
const getPropertyIdString = (
  propertyId: string | { _id: string; name: string; type?: string } | undefined
): string | null => {
  if (!propertyId) return null;

  if (typeof propertyId === "string") {
    return propertyId;
  }

  if (typeof propertyId === "object" && propertyId._id) {
    return propertyId._id;
  }

  return null;
};

type BookingWithStatus = BookingData;

const canCancelBooking = (booking: BookingWithStatus) => {
  // Không cho phép hủy nếu:
  // - Booking đã bị hủy
  // - Booking đã hoàn thành
  // - Booking bị từ chối
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.REJECTED
  ) {
    return false;
  }

  // Chỉ cho phép hủy booking có status PENDING hoặc CONFIRMED
  if (
    booking.status !== BookingStatus.PENDING &&
    booking.status !== BookingStatus.CONFIRMED
  ) {
    return false;
  }

  // Không cho phép hủy nếu đã qua ngày check-in
  if (!booking.checkInDate) {
    return false;
  }

  // Sử dụng múi giờ Việt Nam
  const checkInDate = new Date(booking.checkInDate);

  // Lấy thời gian hiện tại theo múi giờ Việt Nam
  const now = new Date();
  const vietnamTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  // Cho phép hủy đến trước giờ check-in (14:00) theo múi giờ Việt Nam
  const checkInDeadline = new Date(checkInDate);
  checkInDeadline.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam

  if (vietnamTime >= checkInDeadline) {
    return false;
  }

  // Nếu không có cancel_policy, mặc định là moderate
  const policy = booking.cancel_policy || CancelPolicy.MODERATE;

  let canCancel = false;

  // So sánh không phân biệt hoa thường
  const policyUpper = policy.toUpperCase();

  switch (policyUpper) {
    case CancelPolicy.FLEXIBLE: {
      // Flexible: Hủy trước 1 ngày → hoàn 100%
      const oneDayBefore = new Date(checkInDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam
      canCancel = vietnamTime < oneDayBefore;
      break;
    }
    case CancelPolicy.MODERATE: {
      // Moderate: Hủy trước 5 ngày → hoàn 100%
      const fiveDaysBefore = new Date(checkInDate);
      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);
      fiveDaysBefore.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam
      canCancel = vietnamTime < fiveDaysBefore;
      break;
    }
    case CancelPolicy.STRICT:
      // Strict: Không cho phép hủy
      canCancel = false;
      break;
    default: {
      // Mặc định xử lý như moderate policy
      const fiveDaysBefore = new Date(checkInDate);
      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);
      fiveDaysBefore.setHours(14, 0, 0, 0); // 14:00 giờ Việt Nam
      canCancel = vietnamTime < fiveDaysBefore;
    }
  }

  return canCancel;
};

// Custom hook lấy bookedDates cho nhiều listingId
function useAllBookedDates(listingIds: string[]) {
  const [bookedDatesByListing, setBookedDatesByListing] = useState<
    Record<string, Date[]>
  >({});

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      const results: Record<string, Date[]> = {};
      for (const id of listingIds) {
        try {
          const res = await api.get(`/bookings/booked-dates/${id}`);
          const rawDates = res.data?.data?.bookedDates || [];
          const converted = rawDates.map((d: string) => {
            const [year, month, day] = d.split("-");
            return new Date(Number(year), Number(month) - 1, Number(day));
          });
          results[id] = converted;
        } catch {
          results[id] = [];
        }
      }
      if (isMounted) setBookedDatesByListing(results);
    }
    if (listingIds.length > 0) fetchAll();
    return () => {
      isMounted = false;
    };
  }, [listingIds.join(",")]);
  return bookedDatesByListing;
}

const PastTrip = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { myBookingHistory, loading, error } = useSelector(
    (state: RootState) => {
      return state.booking;
    }
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // Lấy tất cả listingId duy nhất từ bookings
  const listingIds = Array.from(
    new Set(
      ((myBookingHistory as BookingWithStatus[]) || [])
        .map((b) =>
          typeof b.listingId === "object" && "_id" in b.listingId
            ? b.listingId._id
            : null
        )
        .filter(Boolean)
    )
  ) as string[];
  const bookedDatesByListing = useAllBookedDates(listingIds);

  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithStatus | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] =
    useState<BookingWithStatus | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] =
    useState<BookingWithStatus | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [payRemainderLoadingId, setPayRemainderLoadingId] = useState<
    string | null
  >(null);

  // State cho thêm dịch vụ
  const [selectedBookingForService, setSelectedBookingForService] =
    useState<BookingWithStatus | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [availableServices, setAvailableServices] = useState<
    Array<{
      _id: string;
      name: string;
      description?: string;
      default_price: number;
      unit: string;
    }>
  >([]);
  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: number;
  }>({});
  const [addServiceLoading, setAddServiceLoading] = useState(false);

  useEffect(() => {
    dispatch(getMyBookingHistory(undefined))
      .then(() => {})
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, [dispatch]);

  // Log cancel_policy khi mở modal hủy
  useEffect(() => {
    if (showCancelModal && selectedBookingForCancel) {
      // Log đã được xóa
    }
  }, [showCancelModal, selectedBookingForCancel]);

  const bookings: BookingWithStatus[] =
    (myBookingHistory as BookingWithStatus[]) || [];
  const now = new Date();

  // Phân loại booking
  const upcomingBookings = bookings.filter((b) => {
    const checkInDate = new Date(b.checkInDate);
    const result =
      STATUS_UPCOMING.includes(b.status as BookingStatus) &&
      checkInDate > now &&
      (b.payment_status === PaymentStatus.PAID ||
        b.payment_status === PaymentStatus.PENDING ||
        b.payment_status === PaymentStatus.PARTIALLY_PAID);

    return result;
  });

  const ongoingBookings = bookings.filter((b) => {
    const checkInDate = new Date(b.checkInDate);
    const checkOutDate = new Date(b.check_out_date);
    return (
      STATUS_UPCOMING.includes(b.status as BookingStatus) &&
      checkInDate <= now &&
      checkOutDate >= now &&
      (b.payment_status === PaymentStatus.PAID ||
        b.payment_status === PaymentStatus.PARTIALLY_PAID)
    );
  });

  // Sửa: coi CONFIRMED hoặc PAID đã qua ngày checkout là completed (FE logic)
  const historyBookings = bookings.filter((b) => {
    const checkOutDate = new Date(b.check_out_date);
    const result =
      // Các booking đã hoàn thành (status completed hoặc đã checkout)
      b.status === BookingStatus.COMPLETED ||
      ((b.status === BookingStatus.CONFIRMED ||
        b.payment_status === PaymentStatus.PAID) &&
        checkOutDate < now) ||
      // Các booking đã hủy
      b.status === BookingStatus.CANCELLED ||
      // Các booking bị từ chối
      b.status === BookingStatus.REJECTED ||
      // Các booking thanh toán thất bại
      b.payment_status === PaymentStatus.FAILED ||
      // Các booking đã hoàn tiền
      b.payment_status === PaymentStatus.REFUNDED;

    return result;
  });

  // Thêm PaymentStatus.PARTIALLY_PAID vào import

  const handleShowDetail = (booking: BookingWithStatus) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  const handleCancelBooking = (booking: BookingWithStatus) => {
    setSelectedBookingForCancel(booking);
    setShowCancelModal(true);
  };

  const handlePayRemainder = async (bookingId: string) => {
    setPayRemainderLoadingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/payment/remaining`, {
        paymentMethod: "vnpay",
      });
      const paymentUrl = res.data?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Không lấy được link thanh toán phần còn lại.");
      }
    } catch {
      toast.error("Có lỗi khi tạo thanh toán phần còn lại.");
    } finally {
      setPayRemainderLoadingId(null);
    }
  };

  // Functions cho thêm dịch vụ
  const handleAddService = async (booking: BookingWithStatus) => {
    setSelectedBookingForService(booking);
    setShowAddServiceModal(true);
    setSelectedServices({});

    // Lấy danh sách dịch vụ có sẵn
    try {
      const res = await api.get("/services/active");
      console.log("Available services response:", res.data);
      setAvailableServices(res.data.data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    }
  };

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => ({ ...prev, [serviceId]: 1 }));
    } else {
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  };

  const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
    if (quantity > 0) {
      setSelectedServices((prev) => ({ ...prev, [serviceId]: quantity }));
    } else {
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  };

  const handleConfirmAddServices = async () => {
    if (
      !selectedBookingForService ||
      Object.keys(selectedServices).length === 0
    ) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    setAddServiceLoading(true);
    try {
      const selectedServicesArray = Object.entries(selectedServices).map(
        ([serviceId, quantity]) => ({
          serviceId,
          quantity,
        })
      );

      console.log("Sending selected services:", selectedServicesArray);

      // Sử dụng API dành cho guest
      const response = await api.patch(
        `/bookings/my-bookings/${selectedBookingForService._id}`,
        {
          selected_services: selectedServicesArray,
        }
      );

      console.log("API Response:", response.data);

      toast.success("Thêm dịch vụ thành công!");
      setShowAddServiceModal(false);
      setSelectedServices({});

      // Refresh booking list
      dispatch(getMyBookingHistory(undefined));
    } catch (error: unknown) {
      console.error("Error adding services:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi khi thêm dịch vụ";
      toast.error(errorMessage);
    } finally {
      setAddServiceLoading(false);
    }
  };

  const renderBooking = (booking: BookingWithStatus) => {
    // Lấy object listing trực tiếp từ booking.listingId
    const listing:
      | { _id?: string; images?: string[]; title?: string }
      | string = booking.listingId;

    let image = "/placeholder.svg";
    let title = "Phòng không có tiêu đề";
    if (listing && typeof listing === "object") {
      image = listing.images?.[0] || "/placeholder.svg";
      title = listing.title || "Phòng không có tiêu đề";
    }

    // Xác định trạng thái hiển thị
    let statusDisplay = "";
    let statusColor = "";
    let showPaymentButton = false;
    let showPayRemainderButton = false;

    // Tính toán số tiền còn lại cần thanh toán
    const finalAmount = booking.final_amount || 0;
    const depositPaidAmount = booking.deposit_paid_amount || 0;
    const outstandingAmount = finalAmount - depositPaidAmount;

    if (booking.payment_status === PaymentStatus.FAILED) {
      statusDisplay = "Thanh toán thất bại";
      statusColor = "text-red-600";
      showPaymentButton = true;
    } else if (booking.payment_status === PaymentStatus.PENDING) {
      statusDisplay = "Chờ thanh toán";
      statusColor = "text-yellow-600";
      showPaymentButton = true;
    } else if (booking.payment_status === PaymentStatus.PARTIALLY_PAID) {
      // Phân biệt 2 trường hợp PARTIALLY_PAID
      const hasAdditionalServices =
        booking.selected_services && booking.selected_services.length > 0;

      if (hasAdditionalServices && outstandingAmount > 0) {
        // Trường hợp 1: Đã PAID nhưng thêm dịch vụ → chuyển về PARTIALLY_PAID
        statusDisplay = "Cần thanh toán thêm dịch vụ";
        statusColor = "text-orange-600";
        showPaymentButton = true;
      } else {
        // Trường hợp 2: Trả trước 50% booking mới
        statusDisplay = "Đã trả trước 50%";
        statusColor = "text-blue-600";
        // Hiển thị nút thanh toán nếu còn tiền cần thanh toán
        if (outstandingAmount > 0) {
          showPayRemainderButton = true;
        }
      }
    } else if (booking.payment_status === PaymentStatus.PAID) {
      // Kiểm tra nếu đã thanh toán nhưng có thêm dịch vụ
      const hasAdditionalServices =
        booking.selected_services && booking.selected_services.length > 0;
      if (outstandingAmount > 0 && hasAdditionalServices) {
        statusDisplay = "Cần thanh toán thêm";
        statusColor = "text-orange-600";
        showPaymentButton = true;
      } else if (outstandingAmount > 0) {
        // Trường hợp có tiền còn lại nhưng không có dịch vụ (có thể do lỗi data)
        statusDisplay = "Cần thanh toán thêm";
        statusColor = "text-orange-600";
        showPaymentButton = true;
      } else if (hasAdditionalServices && outstandingAmount === 0) {
        statusDisplay = "Đã thanh toán đầy đủ (có dịch vụ)";
        statusColor = "text-green-600";
      } else {
        statusDisplay = "Đã thanh toán";
        statusColor = "text-green-600";
      }
    } else if (booking.payment_status === PaymentStatus.REFUNDED) {
      statusDisplay = "Đã hoàn tiền";
      statusColor = "text-orange-600";
    } else {
      switch (booking.status) {
        case BookingStatus.COMPLETED:
          statusDisplay = "Đã hoàn thành";
          statusColor = "text-green-600";
          break;
        case BookingStatus.CANCELLED:
          statusDisplay = "Đã hủy";
          statusColor = "text-red-600";
          break;
        case BookingStatus.REJECTED:
          statusDisplay = "Bị từ chối";
          statusColor = "text-red-600";
          break;
        case BookingStatus.CONFIRMED:
          statusDisplay = "Đã xác nhận";
          statusColor = "text-green-600";
          break;
        default:
          statusDisplay = "Đang chờ";
          statusColor = "text-yellow-600";
      }
    }

    // Kiểm tra ngày đã được đặt
    let isBooked = false;
    let bookedDates: Date[] = [];
    if (
      listing &&
      typeof listing === "object" &&
      "_id" in listing &&
      listing._id
    ) {
      bookedDates = bookedDatesByListing[listing._id] || [];
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.check_out_date);
      isBooked = bookedDates.some((date) => date >= checkIn && date < checkOut);
    }

    // Debug: Log thông tin để kiểm tra
    console.log("Debug booking:", {
      bookingId: booking._id,
      payment_status: booking.payment_status,
      outstandingAmount,
      showPaymentButton,
      isBooked,
      hasAdditionalServices:
        booking.selected_services && booking.selected_services.length > 0,
    });

    return (
      <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Ảnh */}
          <div className="w-full md:w-1/3 h-48 relative overflow-hidden">
            {listing && typeof listing === "object" && listing._id ? (
              <Link to={`/list/${listing._id}`}>
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </Link>
            ) : (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            )}
          </div>

          {/* Thông tin */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              {listing && typeof listing === "object" && listing._id ? (
                <Link to={`/list/${listing._id}`}>
                  <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors cursor-pointer">
                    {title}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-xl font-semibold">{title}</h3>
              )}
              <span className={`${statusColor} font-medium`}>
                {statusDisplay}
              </span>
            </div>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>
                  {new Date(booking.checkInDate).toLocaleDateString("vi-VN")} –{" "}
                  {new Date(booking.check_out_date).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign size={18} />
                <span>
                  Tổng tiền: {booking.final_amount?.toLocaleString()}₫
                </span>
                {booking.services_total_amount &&
                  booking.services_total_amount > 0 && (
                    <span className="text-sm text-blue-600">
                      (bao gồm {booking.services_total_amount.toLocaleString()}₫
                      dịch vụ)
                    </span>
                  )}
              </div>

              {/* Hiển thị thông tin thanh toán */}
              {outstandingAmount > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="text-green-600 text-sm">
                      Đã thanh toán:{" "}
                      {(booking.deposit_paid_amount || 0).toLocaleString()}₫
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-orange-600" />
                    <span className="text-orange-600 font-medium">
                      Còn lại cần thanh toán:{" "}
                      {outstandingAmount.toLocaleString()}₫
                    </span>
                  </div>
                  {/* Thông tin bổ sung cho từng trường hợp */}
                  {booking.payment_status === PaymentStatus.PARTIALLY_PAID &&
                    booking.selected_services &&
                    booking.selected_services.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-blue-600" />
                        <span className="text-blue-600 text-sm">
                          Thanh toán thêm cho dịch vụ mới
                        </span>
                      </div>
                    )}
                  {booking.payment_status === PaymentStatus.PARTIALLY_PAID &&
                    (!booking.selected_services ||
                      booking.selected_services.length === 0) && (
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-blue-600" />
                        <span className="text-blue-600 text-sm">
                          Thanh toán 50% còn lại của booking
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Hiển thị danh sách dịch vụ đã thêm */}
              {booking.selected_services &&
                booking.selected_services.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Dịch vụ đã thêm:
                    </div>
                    <div className="space-y-1">
                      {booking.selected_services.map(
                        (
                          service: {
                            service_name?: string;
                            quantity?: number;
                            service_price?: number;
                          },
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="text-sm text-blue-700 flex justify-between"
                          >
                            <span>• {service.service_name || "Dịch vụ"}</span>
                            <span>
                              {service.quantity || 1}x{" "}
                              {(service.service_price || 0).toLocaleString()}₫
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Các nút chức năng */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShowDetail(booking)}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Xem chi tiết đặt chỗ
              </Button>

              {showPaymentButton && (outstandingAmount > 0 || !isBooked) && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={async () => {
                    try {
                      // Tạo thanh toán VNPay trực tiếp
                      const response = await api.post(
                        `/bookings/${booking._id}/payment/remaining`,
                        {
                          paymentMethod: "vnpay",
                          amount: outstandingAmount,
                        }
                      );

                      const paymentUrl = response.data?.data?.paymentUrl;
                      if (paymentUrl) {
                        // Chuyển thẳng đến trang VNPay
                        window.location.href = paymentUrl;
                      } else {
                        toast.error("Không lấy được link thanh toán VNPay");
                      }
                    } catch (error) {
                      console.error("Error creating VNPay payment:", error);
                      toast.error("Có lỗi khi tạo thanh toán VNPay");
                    }
                  }}
                >
                  <DollarSign size={16} />
                  Thanh toán thêm {outstandingAmount.toLocaleString()}₫
                </Button>
              )}
              {showPayRemainderButton && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handlePayRemainder(booking._id)}
                  disabled={payRemainderLoadingId === booking._id}
                >
                  <DollarSign size={16} />
                  {payRemainderLoadingId === booking._id
                    ? "Đang xử lý..."
                    : `Trả nốt ${outstandingAmount.toLocaleString()}₫`}
                </Button>
              )}
              {showPaymentButton &&
                isBooked &&
                booking.payment_status !== PaymentStatus.PAID &&
                outstandingAmount === 0 && (
                  <span className="text-red-500 font-medium">
                    Phòng đã được đặt cho ngày này
                  </span>
                )}

              {booking.status === BookingStatus.COMPLETED && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSelectedBookingForReview(booking);
                    setShowReviewModal(true);
                    setReviewRating(5);
                    setReviewComment("");
                  }}
                >
                  <Star size={16} />
                  Viết đánh giá
                </Button>
              )}

              {(booking.status === BookingStatus.COMPLETED ||
                booking.status === BookingStatus.CANCELLED) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (
                      booking.listingId &&
                      typeof booking.listingId === "object" &&
                      "_id" in booking.listingId
                    ) {
                      navigate(`/list/${booking.listingId._id}`);
                    }
                  }}
                >
                  <Redo size={16} />
                  Đặt lại chỗ này
                </Button>
              )}

              {STATUS_UPCOMING.includes(booking.status as BookingStatus) && (
                <>
                  {canCancelBooking(booking) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleCancelBooking(booking)}
                    >
                      <X size={16} />
                      Hủy đặt phòng
                    </Button>
                  )}

                  {(() => {
                    const propertyIdString = getPropertyIdString(
                      booking.propertyId
                    );
                    return (
                      propertyIdString && (
                        <MessageHostDialog
                          propertyId={propertyIdString}
                          hostName="nhân viên"
                          className="w-auto flex items-center gap-2 text-[12px]"
                        />
                      )
                    );
                  })()}
                </>
              )}

              {/* Nút thêm dịch vụ - hiển thị cho tất cả booking đã thanh toán */}
              {(booking.payment_status === PaymentStatus.PAID ||
                booking.payment_status === PaymentStatus.PARTIALLY_PAID) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => handleAddService(booking)}
                >
                  <Plus size={16} />
                  Thêm dịch vụ
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const confirmCancelBooking = async () => {
    if (!selectedBookingForCancel) return;

    try {
      await api.patch(
        `/bookings/my-bookings/${selectedBookingForCancel._id}/cancel`
      );

      // Refresh booking list
      dispatch(getMyBookingHistory(undefined));

      // Close modal
      setShowCancelModal(false);

      // Show success message
      toast.success("Hủy đặt phòng thành công");
    } catch (error: unknown) {
      console.error("Error cancelling booking:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        toast.error(
          axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi hủy đặt phòng"
        );
      } else {
        toast.error("Có lỗi xảy ra khi hủy đặt phòng");
      }
    }
  };

  // Hàm chuyển trạng thái sang tiếng Việt và màu sắc
  const getStatusDisplay = (
    status: string,
    paymentStatus?: string,
    checkOutDate?: Date
  ) => {
    // Nếu status là CONFIRMED hoặc PAID và đã qua ngày checkout, coi là hoàn thành
    if (
      (status === BookingStatus.CONFIRMED ||
        paymentStatus === PaymentStatus.PAID) &&
      checkOutDate &&
      checkOutDate < now
    ) {
      return {
        text: "Đã hoàn thành",
        color: "text-green-600 bg-green-50 border-green-200",
      };
    }
    switch (status) {
      case BookingStatus.COMPLETED:
        return {
          text: "Đã hoàn thành",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case BookingStatus.CANCELLED:
        return {
          text: "Đã hủy",
          color: "text-red-600 bg-red-50 border-red-200",
        };
      case BookingStatus.REJECTED:
        return {
          text: "Bị từ chối",
          color: "text-red-600 bg-red-50 border-red-200",
        };
      case BookingStatus.CONFIRMED:
        return {
          text: "Đã xác nhận",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case BookingStatus.PENDING:
        return {
          text: "Đang chờ",
          color: "text-yellow-700 bg-yellow-50 border-yellow-200",
        };
      default:
        return {
          text: status,
          color: "text-gray-600 bg-gray-50 border-gray-200",
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Chuyến đi của tôi</h2>
        <div className="flex">
          <button
            className={`justify-start text-base font-medium text-center px-10 py-2 h-10 rounded-md shadow-none transition ${
              tab === "upcoming"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                : "bg-transparent"
            } hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]`}
            onClick={() => {
              if (tab !== "upcoming") {
                setTab("upcoming");
              }
            }}
          >
            Sắp tới
          </button>
          <button
            className={`justify-start text-base font-medium text-center px-10 py-2 h-10 rounded-md shadow-none transition ${
              tab === "history"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                : "bg-transparent"
            } hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]`}
            onClick={() => {
              if (tab !== "history") {
                setTab("history");
              }
            }}
          >
            Trước đây
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500 py-8">{error}</div>
      ) : (
        <div>
          {tab === "upcoming" && (
            <>
              {upcomingBookings.length === 0 && ongoingBookings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Bạn chưa có chuyến đi nào sắp tới
                </div>
              ) : (
                <>
                  {upcomingBookings.map((b) => renderBooking(b))}
                  {ongoingBookings.map((b) => renderBooking(b))}
                </>
              )}
            </>
          )}

          {tab === "history" && (
            <>
              {historyBookings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Bạn chưa có chuyến đi nào trước đây
                </div>
              ) : (
                historyBookings.map((b) => renderBooking(b))
              )}
            </>
          )}
        </div>
      )}

      {/* Modal chi tiết */}
      {showDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2">
                <FileText size={22} className="text-blue-600" />
                <h3 className="text-xl font-bold">Chi tiết đặt chỗ</h3>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {isListingObj(selectedBooking.listingId) && (
              <img
                src={
                  selectedBooking.listingId.images?.[0] || "/placeholder.svg"
                }
                alt={selectedBooking.listingId.title}
                className="w-full h-64 object-cover rounded-lg mb-4 border"
              />
            )}

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" />
                  Thông tin đặt phòng
                </h4>
                <div className="space-y-2 text-gray-700 text-base">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">Ngày nhận phòng:</span>{" "}
                    {new Date(selectedBooking.checkInDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">Ngày trả phòng:</span>{" "}
                    {new Date(
                      selectedBooking.check_out_date
                    ).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="font-medium">Số khách:</span>{" "}
                    {selectedBooking.guests} người
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="font-medium">Tổng tiền :</span>{" "}
                    {(selectedBooking.final_amount || 0).toLocaleString()}₫
                  </div>
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-gray-400" />
                    <span className="font-medium">Trạng thái:</span>
                    <span
                      className={`inline-block px-2 py-1 rounded border text-sm font-semibold ml-2 ${
                        getStatusDisplay(
                          selectedBooking.status || "",
                          selectedBooking.payment_status,
                          new Date(selectedBooking.check_out_date)
                        ).color
                      }`}
                    >
                      {
                        getStatusDisplay(
                          selectedBooking.status || "",
                          selectedBooking.payment_status,
                          new Date(selectedBooking.check_out_date)
                        ).text
                      }
                    </span>
                  </div>
                </div>
              </div>

              {user && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users size={18} className="text-green-500" />
                    Thông tin người đặt
                  </h4>
                  <div className="space-y-2 text-gray-700 text-base">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Họ tên:</span> {user.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Số điện thoại:</span>{" "}
                      {user.phone}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedBookingForCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Xác nhận hủy đặt phòng</h3>

            <div className="space-y-4">
              <p>Bạn có chắc chắn muốn hủy đặt phòng này?</p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" />
                  Chính sách hoàn tiền:
                </h4>
                {selectedBookingForCancel?.cancel_policy?.toLowerCase() ===
                  "flexible" && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-1">
                    <CheckCircle size={18} className="text-green-500" />
                    <span>
                      Hủy trước{" "}
                      {format(
                        subDays(
                          new Date(selectedBookingForCancel.checkInDate),
                          1
                        ),
                        "dd/MM/yyyy"
                      )}{" "}
                      14:00 : Hoàn tiền đầy đủ.
                    </span>
                  </div>
                )}
                {selectedBookingForCancel?.cancel_policy?.toLowerCase() ===
                  "moderate" && (
                  <div className="flex items-center gap-2 text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-1">
                    <CheckCircle size={18} className="text-yellow-500" />
                    <span>
                      Hủy trước{" "}
                      {format(
                        subDays(
                          new Date(selectedBookingForCancel.checkInDate),
                          5
                        ),
                        "dd/MM/yyyy"
                      )}{" "}
                      14:00: hoàn tiền đầy đủ.
                    </span>
                  </div>
                )}
                {selectedBookingForCancel?.cancel_policy?.toLowerCase() ===
                  "strict" && (
                  <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-1">
                    <XCircle size={18} className="text-red-500" />
                    <span>Không được hoàn tiền trong mọi trường hợp.</span>
                  </div>
                )}
                {!selectedBookingForCancel?.cancel_policy && (
                  <div className="flex items-center gap-2 text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                    <Info size={18} className="text-gray-400" />
                    <span>Không có thông tin chính sách hoàn tiền.</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Hủy
                </Button>
                <Button variant="default" onClick={confirmCancelBooking}>
                  Đồng ý
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá/bình luận dùng shadcn/ui */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-white shadow-xl border border-gray-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBookingForReview &&
              selectedBookingForReview.listingId &&
              typeof selectedBookingForReview.listingId === "object" &&
              "title" in selectedBookingForReview.listingId
                ? `Đánh giá/Bình luận phòng "${selectedBookingForReview.listingId.title}"`
                : "Đánh giá/Bình luận phòng"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewLoading(true);
              try {
                await dispatch(
                  postReview({
                    roomId:
                      selectedBookingForReview &&
                      selectedBookingForReview.listingId &&
                      typeof selectedBookingForReview.listingId === "object" &&
                      "_id" in selectedBookingForReview.listingId
                        ? (selectedBookingForReview.listingId._id as string)
                        : "",
                    rating: reviewRating,
                    comment: reviewComment,
                  })
                ).unwrap();
                toast.success(
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} className="text-green-500" />
                    Đánh giá thành công!
                  </span>
                );
                setShowReviewModal(false);
              } catch {
                toast.error("Gửi đánh giá/bình luận thất bại!");
              } finally {
                setReviewLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  onClick={() => setReviewRating(star)}
                  className={
                    star <= reviewRating ? "text-yellow-400" : "text-gray-300"
                  }
                >
                  <Star fill={star <= reviewRating ? "#facc15" : "none"} />
                </Button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {reviewRating} sao
              </span>
            </div>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Hãy chia sẻ trải nghiệm hoặc bình luận của bạn..."
              required
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewModal(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={reviewLoading}>
                {reviewLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Gửi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal thêm dịch vụ */}
      <Dialog open={showAddServiceModal} onOpenChange={setShowAddServiceModal}>
        <DialogContent className="bg-white shadow-xl border border-gray-200 rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package size={20} />
              Thêm dịch vụ cho booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {availableServices.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                <p>Đang tải danh sách dịch vụ...</p>
              </div>
            ) : (
              availableServices.map((service) => (
                <div
                  key={service._id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={service._id}
                        checked={!!selectedServices[service._id]}
                        onCheckedChange={(checked) =>
                          handleServiceSelection(
                            service._id,
                            checked as boolean
                          )
                        }
                      />
                      <div>
                        <Label
                          htmlFor={service._id}
                          className="font-medium cursor-pointer"
                        >
                          {service.name}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {service.default_price?.toLocaleString()}₫ /{" "}
                          {service.unit}
                        </p>
                      </div>
                    </div>

                    {selectedServices[service._id] && (
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`quantity-${service._id}`}
                          className="text-sm"
                        >
                          Số lượng:
                        </Label>
                        <input
                          id={`quantity-${service._id}`}
                          type="number"
                          min="1"
                          value={selectedServices[service._id] || 1}
                          onChange={(e) =>
                            handleServiceQuantityChange(
                              service._id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16 px-2 py-1 border rounded text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddServiceModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddServices}
              disabled={
                addServiceLoading || Object.keys(selectedServices).length === 0
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {addServiceLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                "Thêm dịch vụ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PastTrip;
