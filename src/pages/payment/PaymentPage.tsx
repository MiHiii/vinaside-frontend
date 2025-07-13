import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentFooter from "@/components/payment/PaymentFooter";
import PaymentForm from "@/components/payment/PaymentForm";
import BookingSummary from "@/components/payment/BookingSummary";

export default function PaymentLayout() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Sử dụng listing từ listingSlice thay vì bookingSlice
  const { selectedListing, loading } = useAppSelector(
    (state) => state.listings
  );

  const tripStart = searchParams.get("checkInDate") || "";
  const tripEnd = searchParams.get("checkOutDate") || "";
  const guestCount = Number(searchParams.get("guests") || 0);
  const nights = Math.ceil(
    (new Date(tripEnd).getTime() - new Date(tripStart).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const totalPrice = Number(searchParams.get("final_amount") || 0);
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

  useEffect(() => {
    if (listingId) {
      // Import và dispatch action từ listingSlice
      import("@/store/slices/listingSlice").then(({ fetchListingById }) => {
        dispatch(fetchListingById(listingId));
      });
    }
  }, [listingId, dispatch]);

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
          <PaymentForm />
          <div className="lg:pl-8">
            {selectedListing && propertyId ? (
              <BookingSummary
                listing={selectedListing}
                tripStart={tripStart}
                tripEnd={tripEnd}
                guestCount={guestCount}
                nights={nights}
                totalPrice={totalPrice}
                bookingId={bookingId || ""}
                propertyId={propertyId}
                bookedDates={bookedDates}
              />
            ) : (
              <p>Đang tải thông tin đặt chỗ...</p>
            )}
          </div>
        </div>
      </div>
      <PaymentFooter />
    </div>
  );
}
