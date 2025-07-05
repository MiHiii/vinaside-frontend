import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listing";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { createBooking, updateBooking } from "@/store/slices/bookingSlice";
import { DateRange } from "react-day-picker";
import CancelPolicyDetail from "./CancelPolicyDetail";
import BookingInfoModal from "./BookingInfoModal";
import PriceDetailModal from "./PriceDetailModal";

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
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  listing,
  tripStart,
  tripEnd,
  guestCount,
  nights,
  totalPrice,
  bookingId,
  propertyId,
  bookedDates,
}) => {
  const [open, setOpen] = useState(false);
  const [showPriceDetail, setShowPriceDetail] = useState(false);
  const [currentTripStart, setCurrentTripStart] = useState(tripStart);
  const [currentTripEnd, setCurrentTripEnd] = useState(tripEnd);
  const [currentGuestCount, setCurrentGuestCount] = useState(guestCount);

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!currentTripStart || !currentTripEnd || !currentGuestCount) {
      return alert("Vui lòng chọn ngày nhận phòng, trả phòng và số khách.");
    }

    if (
      !listing.propertyId ||
      typeof listing.propertyId !== "object" ||
      !listing.propertyId._id
    ) {
      return alert("Không tìm thấy propertyId hợp lệ.");
    }

    try {
      const bookingData = {
        listingId: listing._id,
        propertyId: listing.propertyId._id,
        price_per_night: listing.price_per_night,
        total_price: listing.price_per_night * nights,
        final_amount: listing.price_per_night * nights * 1.08 + 16.5,
        checkInDate: currentTripStart,
        checkOutDate: currentTripEnd,
        guests: currentGuestCount,
        infants: 0,
        guest_name: user?.name || "Khách chưa đặt tên",
        guest_email: user?.email || "unknown@example.com",
      };

      const result = await dispatch(createBooking(bookingData)).unwrap();

      if (!result?._id) return alert("Lỗi sau khi thanh toán.");

      const params = new URLSearchParams({
        listingId: listing._id,
        propertyId: listing.propertyId._id,
        bookingId: result._id,
        price_per_night: String(listing.price_per_night),
        total_price: String(listing.price_per_night * nights),
        final_amount: String(listing.price_per_night * nights * 1.08 + 16.5),
        checkInDate: currentTripStart,
        checkOutDate: currentTripEnd,
        guests: String(currentGuestCount),
        infants: "0",
        guest_name: user?.name || "Khách chưa đặt tên",
        guest_email: user?.email || "unknown@example.com",
      });

      navigate(`/payment?${params.toString()}`);
    } catch (err) {
      console.error("Thanh toán thất bại:", err);
      alert("Đã có lỗi xảy ra khi thanh toán.");
    }
  };

  const handleSave = async ({
    dateRange,
    guests,
  }: {
    dateRange: DateRange | undefined;
    guests: { adults: number; infants: number };
  }) => {
    if (dateRange?.from && dateRange?.to) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setCurrentTripStart(formatDate(dateRange.from));
      setCurrentTripEnd(formatDate(dateRange.to));
    }
    setCurrentGuestCount(guests.adults);

    try {
      await dispatch(
        updateBooking({
          propertyId,
          bookingId,
          updateData: {
            check_in_date: dateRange?.from,
            check_out_date: dateRange?.to,
            guests: guests.adults,
            infants: guests.infants,
          },
        })
      ).unwrap();
    } catch (err) {
      console.error("Lỗi khi cập nhật booking:", err);
    }
  };

  return (
    <Card className="sticky top-6 max-w-sm border rounded-2xl border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-4">
          <img src={listing.images?.[0]} alt="Ảnh đặt chỗ" />
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">{listing.title}</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span>
                  {listing.average_rating?.toFixed(1) || 0} (
                  {listing.reviews_count || 0})
                </span>
              </div>
              {listing.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  Được khách yêu thích
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <CancelPolicyDetail
            policy={listing.cancel_policy}
            checkInDate={tripStart}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm">Thông tin chuyến đi</h4>
            <Button
              onClick={() => setOpen(true)}
              variant="link"
              size="sm"
              className="text-sm"
            >
              Thay đổi
            </Button>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              {currentTripStart} – {currentTripEnd}
            </p>
            <p>{currentGuestCount} người lớn</p>
          </div>
          <BookingInfoModal
            open={open}
            onClose={() => setOpen(false)}
            initialDateRange={{
              from: new Date(currentTripStart),
              to: new Date(currentTripEnd),
            }}
            initialGuests={{ adults: currentGuestCount, infants: 0 }}
            maxGuests={listing.max_guests}
            allowInfants={listing.allow_infants}
            maxInfants={listing.max_infants || 0}
            bookedDates={bookedDates}
            onSave={handleSave}
          />
        </div>

        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-sm">Chi tiết giá</h4>
          <div className="flex justify-between">
            <span>
              ₫{listing.price_per_night.toLocaleString()} x {nights} đêm
            </span>
            <span>₫{(listing.price_per_night * nights).toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Tổng VND</span>
            <span>₫{totalPrice.toLocaleString()}</span>
          </div>
          <a
            href="#"
            className="text-sm text-black mt-1 underline cursor-pointer"
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
          />
          <Button
            className="w-full bg-pink-600 hover:bg-pink-700"
            onClick={handlePayment}
          >
            Thanh toán
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummary;
