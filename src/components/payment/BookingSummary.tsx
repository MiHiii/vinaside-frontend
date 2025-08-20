"use client";

import React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IListing } from "@/types/listing";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { createBooking, createPayment } from "@/store/slices/bookingSlice";
import type { DateRange } from "react-day-picker";
import BookingInfoModal from "./BookingInfoModal";
import CancelPolicyDetail from "./CancelPolicyDetail";
import type { Voucher } from "@/types/voucher";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { calculateWeekendSurcharge } from "@/utils/priceCalculation";

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
  selectedServices?: Array<{
    service_id: string;
    service_name: string;
    service_price: number;
    quantity: number;
    total_price: number;
    icon_url?: string;
  }>;
  paymentType?: "full" | "deposit";
  setPaymentType?: (type: "full" | "deposit") => void;
}

interface LocationInfo {
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
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
  selectedServices = [],
  paymentType: paymentTypeProp,
  setPaymentType: setPaymentTypeProp,
}) => {
  const [open, setOpen] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [internalPaymentType, internalSetPaymentType] = useState<
    "full" | "deposit"
  >("full");
  const paymentType = paymentTypeProp ?? internalPaymentType;
  const setPaymentType = setPaymentTypeProp ?? internalSetPaymentType;
  const [specialRequests, setSpecialRequests] = useState(""); // Thêm state cho specialRequests
  const [infants, setInfants] = useState(0); // Thêm state cho infants
  const [adults, setAdults] = useState(guestCount); // Để đồng bộ số người lớn nếu muốn

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!tripStart || !tripEnd || !adults) {
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
        propertyId: listing.propertyId._id,
        listingId: listing._id,
        price_per_night: listing.price_per_night,
        total_price: base, // Giá phòng gốc
        final_amount: finalTotal,
        checkInDate: tripStart,
        checkOutDate: tripEnd,
        guests: adults,
        infants: infants,
        guest_name: user?.name || "Khách chưa đặt tên",
        guest_email: user?.email || "unknown@example.com",
        specialRequests: specialRequests,
        voucherCode: selectedVoucher?.code || undefined,
        services: selectedServices.map((s) => ({
          serviceId: s.service_id,
          quantity: s.quantity,
        })),
      };
      console.log("[FE] bookingData gửi lên backend:", bookingData);
      console.log("[FE] Debug - Frontend calculation:", {
        base,
        discount,
        amountAfterDiscount,
        serviceFee,
        tax,
        finalTotal,
      });
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
      console.log("[FE] Response từ createPayment:", paymentRes);
      const paymentUrl = paymentRes?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không lấy được link thanh toán.");
      }
    } catch (err: unknown) {
      // Nếu là lỗi từ API tạo booking
      if (
        err &&
        typeof err === "object" &&
        "statusCode" in err &&
        err.statusCode === 400 &&
        "message" in err &&
        typeof err.message === "string" &&
        err.message.toLowerCase().includes("voucher")
      ) {
        toast.error(err.message, { style: { color: "#dc2626" } });
      } else {
        toast.error(
          "Đã có lỗi xảy ra khi thanh toán! Mã voucher đã bị vô hiệu hóa",
          {
            style: { color: "#dc2626" },
          }
        );
      }
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
    setInfants(guests.infants); // Lưu số infants từ modal
    setAdults(guests.adults); // Lưu số người lớn nếu muốn đồng bộ
  };

  // Tính giá cơ bản
  const base = nights * listing.price_per_night;

  // Tính weekend surcharge nếu có
  let weekendSurcharge = 0;
  if (
    listing.has_weekend_surcharge &&
    listing.weekend_surcharge_percent &&
    tripStart &&
    tripEnd
  ) {
    const startDate = new Date(tripStart);
    const endDate = new Date(tripEnd);

    // Sử dụng utility function giống Backend
    weekendSurcharge = calculateWeekendSurcharge(listing, startDate, endDate);
  }

  // Tổng tiền phòng bao gồm weekend surcharge
  const totalRoomPrice = base + weekendSurcharge;

  // Tính tổng tiền trước khi áp dụng voucher
  const totalAmount = totalRoomPrice + selectedServiceTotal;

  // Tính discount trên tổng tiền (phòng + dịch vụ) để nhất quán với backend
  const discount = selectedVoucher
    ? Math.round((totalAmount * selectedVoucher.discount_percent) / 100)
    : 0;

  // Tính tổng sau khi trừ discount
  const amountAfterDiscount = totalAmount - discount;

  // Tính phí và thuế dựa trên amountAfterDiscount (sau khi trừ voucher) - nhất quán với backend
  const serviceFee = Math.round(amountAfterDiscount * 0.1);
  const tax = Math.round(amountAfterDiscount * 0.08);

  // Tính tổng cuối cùng: giá sau voucher + phí + thuế
  let finalTotal = amountAfterDiscount + serviceFee + tax;

  if (paymentType === "deposit") {
    // Tính 50% của tổng tiền sau khi đã trừ voucher
    const depositAmount = Math.round(amountAfterDiscount * 0.5);

    // Tính phí và thuế cho deposit (50% của phí và thuế gốc)
    const depositServiceFee = Math.round(serviceFee * 0.5);
    const depositTax = Math.round(tax * 0.5);

    finalTotal = depositAmount + depositServiceFee + depositTax;
  }

  // Debug logging
  console.log("[DEBUG] Price calculation:", {
    price_per_night: listing.price_per_night,
    nights,
    base,
    weekendSurcharge,
    totalRoomPrice,
    selectedServiceTotal,
    discount,
    amountAfterDiscount,
    serviceFee,
    tax,
    paymentType,
    finalTotal,
    originalTotal: totalRoomPrice + selectedServiceTotal,
    voucherCode: selectedVoucher?.code,
    voucherDiscount: selectedVoucher?.discount_percent,
  });

  // Lấy vị trí từ property/location
  const location = listing.propertyId?.location || listing.location || {};
  const locationText = [
    (location as LocationInfo).address,
    (location as LocationInfo).ward,
    (location as LocationInfo).district,
    (location as LocationInfo).city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="sticky top-6 rounded-xl border border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Lựa chọn loại thanh toán */}
        <div className="space-y-3">
          <div className="font-semibold text-lg">Chọn loại thanh toán</div>
          <div className="flex gap-4">
            <label
              className={cn(
                "flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors",
                paymentType === "full"
                  ? "border-pink-600 bg-pink-50 text-pink-800"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                value="full"
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
                className="sr-only"
              />
              <span className="font-medium">Thanh toán toàn bộ</span>
            </label>
            <label
              className={cn(
                "flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors",
                paymentType === "deposit"
                  ? "border-pink-600 bg-pink-50 text-pink-800"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                value="deposit"
                checked={paymentType === "deposit"}
                onChange={() => setPaymentType("deposit")}
                className="sr-only"
              />
              <span className="font-medium">Đặt cọc 50%</span>
            </label>
          </div>
        </div>

        {/* Input specialRequests */}
        <div className="space-y-2">
          <label
            htmlFor="specialRequests"
            className="block font-semibold text-lg"
          >
            Yêu cầu đặc biệt
          </label>
          <textarea
            id="specialRequests"
            className="w-full border border-gray-400 bg-background rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Nhập yêu cầu thêm (nếu có)..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
          />
        </div>

        {/* Ảnh + Tiêu đề + Đánh giá */}
        <div className="flex gap-4 items-center border-t border-gray-400 pt-6">
          <img
            src={
              listing.images?.[0] ||
              "/placeholder.svg?height=96&width=96&text=Listing+Image"
            }
            alt="Ảnh đặt chỗ"
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          />
          <div className="flex-1">
            <div className="font-semibold text-lg leading-tight">
              {listing.title}
            </div>
            {/* Hiển thị vị trí nếu có */}
            {locationText && (
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-pink-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-3.866 0-7 3.134-7 7 0 1.657 1.343 3 3 3h8c1.657 0 3-1.343 3-3 0-3.866-3.134-7-7-7z"
                  />
                </svg>
                <span>{locationText}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="font-medium">
                {listing.average_rating?.toFixed(1) || "0.0"}
              </span>
              <span>({listing.reviews_count || 0})</span>
            </div>
          </div>
        </div>

        {/* Chính sách hủy */}
        <div className="space-y-2">
          <div className="font-semibold text-lg">Chính sách hủy</div>
          <div className="text-sm text-gray-600">
            Hủy trước 21 thg 8 để được hoàn tiền đầy đủ
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-medium text-black ml-1 underline"
              onClick={() => setShowPolicy(true)}
              type="button"
            >
              Toàn bộ chính sách
            </Button>
          </div>
          <CancelPolicyDetail
            open={showPolicy}
            onClose={() => setShowPolicy(false)}
            policy={listing.cancel_policy}
            checkInDate={tripStart}
          />
        </div>

        {/* Thông tin chuyến đi */}
        <div className="border-t border-gray-400  pt-6 space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-lg">Thông tin chuyến đi</div>
            <Button
              onClick={() => setOpen(true)}
              variant="ghost"
              size="sm"
              className="text-sm px-3 py-1 hover:bg-gray-100"
            >
              Thay đổi
            </Button>
          </div>
          <div className="text-base text-gray-700">
            {tripStart} – {tripEnd}
          </div>
          <div className="text-base text-gray-700">{adults} người lớn</div>
          <BookingInfoModal
            open={open}
            onClose={() => setOpen(false)}
            initialDateRange={{
              from: tripStart ? new Date(tripStart) : undefined,
              to: tripEnd ? new Date(tripEnd) : undefined,
            }}
            initialGuests={{ adults: adults, infants: infants }}
            maxGuests={listing.max_guests}
            allowInfants={listing.allow_infants}
            maxInfants={listing.max_infants || 0}
            bookedDates={bookedDates}
            onSave={handleSave}
          />
        </div>

        {/* Chi tiết giá */}
        <div className="border-t border-gray-400  pt-6 space-y-3">
          <div className="font-semibold text-lg mb-2">Chi tiết giá</div>
          <div className="flex justify-between text-base text-gray-700">
            <span>
              ₫{listing.price_per_night.toLocaleString()} x {nights} đêm
              {paymentType === "deposit" && (
                <span className="ml-2 text-xs text-pink-600">
                  (Chỉ tính 50%)
                </span>
              )}
            </span>
            <span>
              ₫
              {paymentType === "deposit"
                ? Math.round(base * 0.5).toLocaleString()
                : base.toLocaleString()}
            </span>
          </div>
          {weekendSurcharge > 0 && (
            <div className="flex justify-between text-base text-yellow-600">
              <span>
                Phụ phí cuối tuần (+{listing.weekend_surcharge_percent}%)
              </span>
              <span>
                +₫
                {paymentType === "deposit"
                  ? Math.round(weekendSurcharge * 0.5).toLocaleString()
                  : weekendSurcharge.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base text-gray-700">
            <span>Dịch vụ kèm theo</span>
            <span>
              ₫
              {paymentType === "deposit"
                ? Math.round(selectedServiceTotal * 0.5).toLocaleString()
                : selectedServiceTotal.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-gray-400 pt-2">
            <div className="flex justify-between font-bold text-base">
              <span>Tổng giá phòng và dịch vụ</span>
              <span>
                ₫
                {paymentType === "deposit"
                  ? Math.round(
                      (totalRoomPrice + selectedServiceTotal) * 0.5
                    ).toLocaleString()
                  : (totalRoomPrice + selectedServiceTotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base text-gray-700">
              <span>Phí dịch vụ (10%)</span>
              <span>
                ₫
                {paymentType === "deposit"
                  ? Math.round(serviceFee * 0.5).toLocaleString()
                  : serviceFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base text-gray-700">
              <span>Thuế (8%)</span>
              <span>
                ₫
                {paymentType === "deposit"
                  ? Math.round(tax * 0.5).toLocaleString()
                  : tax.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-base text-green-600 font-medium">
                <span>Đã giảm ({selectedVoucher?.code})</span>
                <span>
                  -₫
                  {paymentType === "deposit"
                    ? Math.round(discount * 0.5).toLocaleString()
                    : discount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-gray-400 pt-2 mt-2">
              <div className="flex justify-between font-bold text-xl">
                <span>Tổng thanh toán</span>
                <span className="text-pink-600">
                  ₫{finalTotal.toLocaleString()}
                </span>
              </div>
              {paymentType === "deposit" && (
                <div className="text-xs text-gray-500 mt-1">
                  Bạn sẽ thanh toán trước 50% tổng tiền, phần còn lại sẽ thanh
                  toán sau.
                </div>
              )}
            </div>
          </div>
        </div>

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
