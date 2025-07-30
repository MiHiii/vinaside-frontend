import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import PaymentHeader from "@/components/payment/PaymentHeader";
import BookingSummary from "@/components/payment/BookingSummary";
import VoucherListForUser from "@/components/payment/VoucherListForUser";
import { IListing } from "@/types/listing";
import { Voucher } from "@/types/voucher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setSelectedServices } from "@/store/slices/bookingSlice";

export default function PaymentLayout() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Sử dụng listing từ listingSlice thay vì bookingSlice
  const { listing, loading } = useAppSelector((state) => state.listings);
  const selectedServices = useAppSelector(
    (state) => state.booking.selectedServices
  );

  // State động cho ngày, số đêm, tổng tiền
  const [tripStart, setTripStart] = useState(
    searchParams.get("checkInDate") || ""
  );
  const [tripEnd, setTripEnd] = useState(
    searchParams.get("checkOutDate") || ""
  );
  const [guestCount, setGuestCount] = useState(
    Number(searchParams.get("guests") || 0)
  );

  const calcNights = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    return Math.max(
      1,
      Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    );
  };
  const nights = calcNights(tripStart, tripEnd);
  const totalPrice = listing ? listing.price_per_night * nights : 0;

  const listingId = searchParams.get("listingId");
  const bookingId = searchParams.get("bookingId");
  const propertyId = searchParams.get("propertyId");
  const bookedDatesString = searchParams.get("bookedDates") || "";
  const bookedDates = bookedDatesString
    ? bookedDatesString.split(",").map((d) => {
        const [year, month, day] = d.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day));
      })
    : [];

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");

  useEffect(() => {
    if (listingId) {
      // Import và dispatch action từ listingSlice
      import("@/store/slices/listingSlice").then(({ fetchListingById }) => {
        dispatch(fetchListingById(listingId));
      });
    }
    // Khôi phục selectedServices từ localStorage nếu Redux rỗng
    if (!selectedServices || selectedServices.length === 0) {
      const saved = localStorage.getItem("selectedServices");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            dispatch(setSelectedServices(parsed));
          }
        } catch {}
      }
    }
    // Khôi phục selectedVoucher từ localStorage nếu chưa có
    if (!selectedVoucher) {
      const savedVoucher = localStorage.getItem("selectedVoucher");
      if (savedVoucher) {
        try {
          const parsed = JSON.parse(savedVoucher);
          setSelectedVoucher(parsed);
        } catch {}
      }
    }
  }, [listingId, dispatch]);

  // Callback khi lưu ngày mới từ modal
  const handleSaveBookingInfo = ({
    dateRange,
    guests,
  }: {
    dateRange: { from?: Date; to?: Date } | undefined;
    guests: { adults: number; infants: number };
  }) => {
    if (dateRange?.from && dateRange?.to) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      setTripStart(formatDate(dateRange.from));
      setTripEnd(formatDate(dateRange.to));
    }
    setGuestCount(guests.adults);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Skeleton className="h-16 w-full mb-6 rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-16 w-full mt-6 rounded-xl" />
            </div>
            <div className="lg:pl-8">
              <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PaymentHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {/* Voucher phía trên form thanh toán */}
            <div>
              <VoucherListForUser
                onVoucherSelect={setSelectedVoucher}
                totalAmount={
                  totalPrice +
                  selectedServices.reduce((sum, s) => sum + s.total_price, 0)
                }
              />
              {/* Hiển thị danh sách dịch vụ đã chọn dưới voucher */}
              <Card className="border-none shadow-none rounded-xl bg-white">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Dịch vụ kèm theo đã chọn
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  {selectedServices.length === 0 ? (
                    <div className="text-gray-500 text-sm">
                      Bạn chưa chọn dịch vụ kèm theo nào.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {selectedServices.map((s) => (
                        <li
                          key={s.service_id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium text-sm">
                              {s.service_name}
                            </span>
                            <span className="ml-2 text-gray-500 text-xs">
                              x{s.quantity}
                            </span>
                          </div>
                          <div className="text-pink-600 font-semibold text-sm">
                            ₫
                            {(
                              s.total_price || s.service_price * s.quantity
                            ).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="lg:pl-8">
            {/* BookingSummary */}
            {listing && propertyId ? (
              <BookingSummary
                listing={listing as IListing}
                tripStart={tripStart}
                tripEnd={tripEnd}
                guestCount={guestCount}
                nights={nights}
                totalPrice={totalPrice}
                bookingId={bookingId || ""}
                propertyId={propertyId}
                bookedDates={bookedDates}
                onSaveBookingInfo={handleSaveBookingInfo}
                selectedServices={selectedServices}
                selectedServiceTotal={selectedServices.reduce(
                  (sum, s) => sum + s.total_price,
                  0
                )}
                selectedVoucher={selectedVoucher}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
              />
            ) : (
              <p>Đang tải thông tin đặt chỗ...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
