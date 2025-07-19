import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentForm from "@/components/payment/PaymentForm";
import BookingSummary from "@/components/payment/BookingSummary";
import VoucherListForUser from "@/components/payment/VoucherListForUser";
import { IListing } from "@/types/listing";
import { Voucher } from "@/types/voucher";

export default function PaymentLayout() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Sử dụng listing từ listingSlice thay vì bookingSlice
  const { listing, loading } = useAppSelector((state) => state.listings);

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

  const selectedServiceTotal = Number(
    searchParams.get("selectedServiceTotal") || 0
  );

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    if (listingId) {
      // Import và dispatch action từ listingSlice
      import("@/store/slices/listingSlice").then(({ fetchListingById }) => {
        dispatch(fetchListingById(listingId));
      });
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
        <div className="text-lg">Đang tải thông tin...</div>
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
            <VoucherListForUser
              onVoucherSelect={setSelectedVoucher}
              totalAmount={totalPrice + selectedServiceTotal}
            />
            <PaymentForm />
          </div>
          <div className="lg:pl-8">
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
                selectedServiceTotal={selectedServiceTotal}
                selectedVoucher={selectedVoucher}
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
