import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listing";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { createBooking, createPayment } from "@/store/slices/bookingSlice";
import { DateRange } from "react-day-picker";
// import CancelPolicyDetail from "./CancelPolicyDetail";
import BookingInfoModal from "./BookingInfoModal";
import PriceDetailModal from "./PriceDetailModal";
import CancelPolicyDetail from "./CancelPolicyDetail";
import { Voucher } from "@/types/voucher";

interface BookingSummaryProps {
  listing: IListing;
  tripStart: string;
  tripEnd: string;
  guestCount: number;
  nights: number;
  totalPrice: number;
  bookingId: string;
  propertyId: string;
  bookedDates: Date[];
  onSaveBookingInfo: (data: {
    dateRange: DateRange | undefined;
    guests: { adults: number; infants: number };
  }) => void;
  selectedServiceTotal: number;
  selectedVoucher?: Voucher | null;
  selectedServices: Array<{
    service_id: string;
    service_name: string;
    service_price: number;
    quantity: number;
    total_price: number;
    icon_url?: string;
  }>;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  listing,
  tripStart,
  tripEnd,
  guestCount,
  nights,
  bookedDates,
  onSaveBookingInfo,
  selectedServiceTotal,
  selectedVoucher,
  selectedServices,
}) => {
  const [open, setOpen] = useState(false);
  const [showPriceDetail, setShowPriceDetail] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!tripStart || !tripEnd || !guestCount) {
        alert("Vui lòng chọn ngày nhận phòng, trả phòng và số khách.");
        return;
      }

      if (
        !listing.propertyId ||
        typeof listing.propertyId !== "object" ||
        !listing.propertyId._id
      ) {
        alert("Không tìm thấy propertyId hợp lệ.");
        return;
      }

      const bookingData = {
        listingId: listing._id,
        propertyId: listing.propertyId._id,
        price_per_night: listing.price_per_night,
        total_price: listing.price_per_night * nights,
        final_amount: finalTotal,
        checkInDate: tripStart,
        checkOutDate: tripEnd,
        guests: guestCount,
        infants: 0,
        guest_name: user?.name || "Khách chưa đặt tên",
        guest_email: user?.email || "unknown@example.com",
        ...(selectedVoucher?._id ? { voucher_id: selectedVoucher._id } : {}),
        // Đổi tên trường:
        selected_services: selectedServices,
      };
      console.log('[FE] bookingData gửi lên backend:', bookingData);

      const result = await dispatch(createBooking(bookingData)).unwrap();

      if (!result?._id) {
        alert("Lỗi sau khi đặt phòng.");
        return;
      }
      // Gọi API tạo payment
      const paymentPayload = {
        bookingId: result._id,
        paymentMethod: "vnpay", // hoặc "momo" nếu muốn
        paymentType, // truyền paymentType lên BE
        notifyUrl: undefined,
      };
      console.log("[FE] Payload gửi lên createPayment:", paymentPayload);
      const paymentRes = await dispatch(createPayment(paymentPayload)).unwrap();
      const paymentUrl = paymentRes?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không lấy được link thanh toán.");
      }
    } catch (err) {
      console.error("Thanh toán thất bại:", err);
      alert("Đã có lỗi xảy ra khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async ({
    dateRange,
    guests,
  }: {
    dateRange: DateRange | undefined;
    guests: { adults: number; infants: number };
  }) => {
    onSaveBookingInfo({ dateRange, guests });
  };

  // Disable dịch vụ/voucher khi chọn đặt cọc
  const isDeposit = paymentType === "deposit";

  // Tính toán giá dựa trên loại thanh toán
  let base = listing.price_per_night * nights;
  let serviceFee = Math.round(base * 0.1);
  let tax = Math.round(base * 0.08);
  let total = base + serviceFee + tax + selectedServiceTotal;
  let discount = selectedVoucher
    ? Math.round((total * selectedVoucher.discount_percent) / 100)
    : 0;
  let finalTotal = total - discount;

  if (paymentType === "deposit") {
    // Chỉ tính 50% giá phòng, không cộng dịch vụ/voucher
    base = Math.round(listing.price_per_night * nights * 0.5);
    serviceFee = Math.round(base * 0.1);
    tax = Math.round(base * 0.08);
    total = base + serviceFee + tax;
    discount = 0;
    finalTotal = total;
  }

  return (
    <Card className="sticky top-6 max-w-md rounded-2xl border border-gray-200 shadow-sm">
      <CardContent className="p-8 space-y-7">
        {/* Lựa chọn loại thanh toán */}
        <div className="mb-4">
          <label>
            <input
              type="radio"
              value="full"
              checked={paymentType === "full"}
              onChange={() => setPaymentType("full")}
            />
            Thanh toán toàn bộ
          </label>
          <label className="ml-4">
            <input
              type="radio"
              value="deposit"
              checked={paymentType === "deposit"}
              onChange={() => setPaymentType("deposit")}
            />
            Đặt cọc 50%
          </label>
          {isDeposit && (
            <div className="text-red-500 text-sm mt-1">
              Dịch vụ & voucher chỉ áp dụng khi thanh toán toàn bộ!
            </div>
          )}
        </div>
        {/* Ảnh + Tiêu đề + Đánh giá */}
        <div className="flex gap-5 items-center">
          <img
            src={listing.images?.[0]}
            alt="Ảnh đặt chỗ"
            className="w-24 h-24 object-cover rounded-xl border"
          />
          <div className="flex-1">
            <div className="font-semibold text-lg leading-tight">
              {listing.title}
            </div>
            <div className="flex items-center gap-1 text-base text-gray-600 mt-2">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="font-medium">
                {listing.average_rating?.toFixed(1) || 0}
              </span>
              <span>({listing.reviews_count || 0})</span>
            </div>
          </div>
        </div>

        {/* Chính sách hủy */}
        <div>
          <div className="font-semibold text-base">Hủy miễn phí</div>
          <div className="text-sm text-gray-600">
            Hủy trước 21 thg 8 để được hoàn tiền đầy đủ
            <button
              className="underline font-medium text-black ml-1"
              onClick={() => setShowPolicy(true)}
              type="button"
            >
              Toàn bộ chính sách
            </button>
          </div>
          <CancelPolicyDetail
            open={showPolicy}
            onClose={() => setShowPolicy(false)}
            policy={listing.cancel_policy}
            checkInDate={tripStart}
          />
        </div>

        {/* Thông tin chuyến đi */}
        <div className="border-t pt-5">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-base">Thông tin chuyến đi</div>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className="text-sm px-4 py-2 border-none hover:bg-gray-100"
            >
              Thay đổi
            </Button>
          </div>
          <div className="text-base">
            {tripStart} – {tripEnd}
          </div>
          <div className="text-base">{guestCount} người lớn</div>
          <BookingInfoModal
            open={open}
            onClose={() => setOpen(false)}
            initialDateRange={{
              from: tripStart ? new Date(tripStart) : undefined,
              to: tripEnd ? new Date(tripEnd) : undefined,
            }}
            initialGuests={{ adults: guestCount, infants: 0 }}
            maxGuests={listing.max_guests}
            allowInfants={listing.allow_infants}
            maxInfants={listing.max_infants || 0}
            bookedDates={bookedDates}
            onSave={handleSave}
          />
        </div>

        {/* Chọn dịch vụ/voucher */}
        {/*
        <ServiceSelector disabled={isDeposit} ... />
        <VoucherListForUser disabled={isDeposit} ... />
        */}

        {/* Chi tiết giá */}
        <div className="font-medium text-base mb-2">Chi tiết giá</div>
        <div className="flex justify-between text-base">
          <span>
            ₫{listing.price_per_night.toLocaleString()} x {nights} đêm
          </span>
          <span>₫{base.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-base">
          <span>Phí dịch vụ</span>
          <span>₫{serviceFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-base">
          <span>Thuế (8%)</span>
          <span>₫{tax.toLocaleString()}</span>
        </div>
        {/* Dịch vụ/voucher chỉ hiển thị khi thanh toán toàn bộ */}
        {paymentType === "full" && (
          <div className="flex justify-between text-base">
            <span>Dịch vụ kèm theo</span>
            <span>₫{selectedServiceTotal.toLocaleString()}</span>
          </div>
        )}
        {/* Tổng tiền */}
        <div className="flex justify-between font-bold text-xl">
          <span>Tổng VND</span>
          <span
            className={discount ? "line-through text-gray-400 text-lg" : ""}
          >
            ₫{total.toLocaleString()}
          </span>
        </div>
        {/* Discount chỉ hiển thị khi thanh toán toàn bộ */}
        {paymentType === "full" && discount > 0 && (
          <div className="flex justify-between text-base text-green-600 font-semibold mt-1">
            <span>Đã giảm ({selectedVoucher?.code})</span>
            <span>-₫{discount.toLocaleString()}</span>
          </div>
        )}
        {((paymentType === "full" && discount > 0) ||
          paymentType === "deposit") && (
          <div className="flex justify-between font-bold text-xl mt-1">
            <span>Tổng sau giảm</span>
            <span className="text-pink-600">
              ₫{finalTotal.toLocaleString()}
            </span>
          </div>
        )}
        <a
          href="#"
          className="text-base text-black mt-2 underline cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setShowPriceDetail(true);
          }}
        >
          Chi tiết giá
        </a>
        <PriceDetailModal
          open={showPriceDetail}
          onClose={() => setShowPriceDetail(false)}
          pricePerNight={listing.price_per_night}
          nights={nights}
          discount={0}
          selectedServiceTotal={selectedServiceTotal}
        />
        <Button
          className="w-full h-12 bg-gradient-to-r from-[#ff4668] to-[#b91c5c] text-white font-bold text-lg rounded-xl border-0 hover:opacity-90 transition-all duration-200 mt-5"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Thanh toán"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookingSummary;
