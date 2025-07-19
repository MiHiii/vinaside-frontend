import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingSummary from "@/components/payment/BookingSummary";
import PaymentMethodForm from "@/components/payment/PaymentMethodForm";
import PaymentHeader from "./PaymentHeader";
import PaymentFooter from "./PaymentFooter";
import { IListing } from "@/types/listing";
import { api } from "@/services/api";

export default function PaymentLayout() {
  const [searchParams] = useSearchParams();
  const [listing, setListing] = useState<IListing | null>(null);

  const tripStart = searchParams.get("checkInDate") || "";
  const tripEnd = searchParams.get("checkOutDate") || "";
  const guestCount = Number(searchParams.get("guests") || 0);
  const nights = Math.ceil(
    (new Date(tripEnd).getTime() - new Date(tripStart).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const totalPrice = Number(searchParams.get("final_amount") || 0);
  const listingId = searchParams.get("listingId");

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      try {
        const res = await api.get(`/listings/${listingId}`);
        setListing(res.data?.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin listing:", error);
      }
    };

    fetchListing();
  }, [listingId]);

  return (
    <div className="min-h-screen">
      <PaymentHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="lg:pr-8">
            <PaymentMethodForm />
          </div>
          <div className="lg:pl-8">
            {listing ? (
              <BookingSummary
                listing={listing}
                tripStart={tripStart}
                tripEnd={tripEnd}
                guestCount={guestCount}
                nights={nights}
                totalPrice={totalPrice}
                bookingId={searchParams.get("bookingId") || ""}
                propertyId={
                  typeof listing.propertyId === "object"
                    ? listing.propertyId._id
                    : listing.propertyId || ""
                }
                bookedDates={[]}
                onSaveBookingInfo={() => {}}
                selectedServiceTotal={0}
              />
            ) : (
              <p>Đang tải thông tin đặt chỗ...</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <PaymentFooter />
      </div>
    </div>
  );
}
