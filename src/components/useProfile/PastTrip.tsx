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
import { useNavigate } from "react-router-dom";

const STATUS_UPCOMING = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

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

  useEffect(() => {
    dispatch(getMyBookingHistory(undefined))
      .then(() => {})
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, [dispatch]);

  //   // Lấy tất cả listingId duy nhất từ bookings
  //   const listingIds = Array.from(
  //     new Set(
  //       ((myBookingHistory as BookingWithStatus[]) || [])
  //         .map((b) =>
  //           typeof b.listingId === "object" && b.listingId._id
  //             ? b.listingId._id
  //             : null
  //         )
  //         .filter(Boolean)
  //     )
  //   );
  //   // Fetch bookedDates cho từng listingId
  //   listingIds.forEach((id) => {
  //     if (!bookedDatesByListing[id]) {
  //       const { bookedDates } = useBookedDates(id);
  //       setBookedDatesByListing((prev) => ({ ...prev, [id]: bookedDates }));
  //     }
  //   });
  //   // eslint-disable-next-line
  // }, [myBookingHistory]);

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
        b.payment_status === PaymentStatus.PENDING);

    return result;
  });

  const ongoingBookings = bookings.filter((b) => {
    const checkInDate = new Date(b.checkInDate);
    const checkOutDate = new Date(b.check_out_date);
    return (
      STATUS_UPCOMING.includes(b.status as BookingStatus) &&
      checkInDate <= now &&
      checkOutDate >= now &&
      b.payment_status === PaymentStatus.PAID
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
  const partiallyPaidBookings = bookings.filter(
    (b) => b.payment_status === PaymentStatus.PARTIALLY_PAID
  );

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

    if (booking.payment_status === PaymentStatus.FAILED) {
      statusDisplay = "Thanh toán thất bại";
      statusColor = "text-red-600";
      showPaymentButton = true;
    } else if (booking.payment_status === PaymentStatus.PENDING) {
      statusDisplay = "Chờ thanh toán";
      statusColor = "text-yellow-600";
      showPaymentButton = true;
    } else if (booking.payment_status === PaymentStatus.PARTIALLY_PAID) {
      statusDisplay = "Đã trả trước 50%";
      statusColor = "text-blue-600";
      showPayRemainderButton = true;
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

    return (
      <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Ảnh */}
          <div className="w-full md:w-1/3 h-48 relative overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Thông tin */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{title}</h3>
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
                <span>{booking.final_amount?.toLocaleString()}₫</span>
              </div>
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

              {showPaymentButton && !isBooked && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-black text-white"
                  onClick={() => {
                    if (
                      listing &&
                      typeof listing === "object" &&
                      "_id" in listing &&
                      listing._id
                    ) {
                      const params = new URLSearchParams({
                        listingId: listing._id,
                        propertyId: booking.propertyId,
                        checkInDate: new Date(booking.checkInDate)
                          .toISOString()
                          .slice(0, 10),
                        checkOutDate: new Date(booking.check_out_date)
                          .toISOString()
                          .slice(0, 10),
                        guests: String(booking.guests),
                        infants: "0",
                        pets: "0",
                        total_price: String(booking.total_price),
                        final_amount: String(booking.final_amount),
                        bookedDates: (bookedDates || [])
                          .map((d) => d.toISOString().slice(0, 10))
                          .join(","),
                        selectedServiceTotal: String(0),
                      });
                      navigate(`/payment?${params.toString()}`);
                    }
                  }}
                >
                  <DollarSign size={16} />
                  Thanh toán ngay
                </Button>
              )}
              {showPayRemainderButton && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-pink-600 text-white"
                  onClick={() => handlePayRemainder(booking._id)}
                  disabled={payRemainderLoadingId === booking._id}
                >
                  <DollarSign size={16} />
                  {payRemainderLoadingId === booking._id
                    ? "Đang xử lý..."
                    : "Trả nốt"}
                </Button>
              )}
              {showPaymentButton && isBooked && (
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

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => navigate("/messages")}
                  >
                    <MessageCircle size={16} />
                    Liên hệ với nhân viên
                  </Button>
                </>
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Chuyến đi của tôi</h2>
        <div className="flex gap-4">
          <Button
            variant={tab === "upcoming" ? "default" : "outline"}
            onClick={() => setTab("upcoming")}
          >
            Sắp tới
          </Button>
          <Button
            variant={tab === "history" ? "default" : "outline"}
            onClick={() => setTab("history")}
          >
            Trước đây
          </Button>
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

      {/* Danh sách phòng đã trả trước 50% */}
      {partiallyPaidBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2 text-blue-600">
            Phòng đã trả trước 50%
          </h3>
          {partiallyPaidBookings.map((b) => renderBooking(b))}
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
    </div>
  );
};

export default PastTrip;
