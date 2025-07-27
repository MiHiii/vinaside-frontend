import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BookingCalendar from "./BookingCalendar";
import GuestSelector from "./GuestSelector";
import { IListing } from "@/types/listing";
import { toast } from "sonner";
import { Service } from "@/types/services";
import { useAppDispatch } from "@/hooks/useRedux";
import { setSelectedServices } from "@/store/slices/bookingSlice";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingFormProps {
  listing: IListing;
  checkIn: Date | null;
  checkOut: Date | null;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  nights: number;
  setNights: (nights: number) => void;
  guests: {
    adults: number;
    infants: number;
    pets: number;
  };
  setGuests: React.Dispatch<
    React.SetStateAction<{
      adults: number;
      infants: number;
      pets: number;
    }>
  >;
  bookedDates: Date[];
  dateOpen: boolean;
  setDateOpen: (open: boolean) => void;
  guestOpen: boolean;
  setGuestOpen: (open: boolean) => void;
  selectedServiceIds?: string[];
  services: Service[];
  selectedServices: any[]; // Thêm dòng này
  loading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  listing,
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  nights,
  setNights,
  guests,
  setGuests,
  bookedDates,
  dateOpen,
  setDateOpen,
  guestOpen,
  setGuestOpen,
  selectedServiceIds,
  services,
  selectedServices,
  loading = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const pricePerNight = listing.price_per_night || 0;
  const taxRate = 0.08;

  const selectedServiceTotal = (selectedServices ?? []).reduce(
    (sum, s) => sum + (s.total_price || s.service_price * s.quantity || 0),
    0
  );

  const calculatePrice = () => {
    const base = nights * pricePerNight;
    const serviceFee = Math.round(base * 0.1);
    const tax = Math.round(base * taxRate);
    const total = base + serviceFee + tax + selectedServiceTotal;
    return { base, tax, total, selectedServiceTotal, serviceFee };
  };

  const handlePayment = () => {
    if (!checkIn || !checkOut || !guests.adults) {
      toast.error(
        "Vui lòng chọn ngày nhận phòng, trả phòng và số khách trước khi tiếp tục.",
        {
          style: { color: "#dc2626" },
        }
      );
      return;
    }
    // Lưu selectedServices vào Redux trước khi chuyển trang
    dispatch(setSelectedServices(selectedServices));
    // Lưu selectedServices vào localStorage để giữ lại khi reload
    localStorage.setItem("selectedServices", JSON.stringify(selectedServices));

    const formattedCheckIn = format(checkIn, "yyyy-MM-dd");
    const formattedCheckOut = format(checkOut, "yyyy-MM-dd");
    const totalPrice = calculatePrice().total;
    const bookedDatesParam = bookedDates
      .map((d) => format(d, "yyyy-MM-dd"))
      .join(",");

    const params = new URLSearchParams({
      listingId: listing._id,
      propertyId: listing.propertyId?._id || "",
      checkInDate: formattedCheckIn,
      checkOutDate: formattedCheckOut,
      guests: String(guests.adults),
      infants: String(guests.infants),
      pets: String(guests.pets),
      total_price: String(calculatePrice().base),
      final_amount: String(totalPrice),
      bookedDates: bookedDatesParam,
      selectedServiceTotal: String(calculatePrice().selectedServiceTotal),
    }).toString();

    navigate(`/payment?${params}`);
  };

  if (loading) {
    return (
      <div className="w-full lg:w-[360px] p-6 rounded-xl shadow-lg space-y-4 h-fit bg-white">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3 bg-white rounded-xl shadow-md px-6 py-4">
        <img
          src="https://vinaside.sgp1.digitaloceanspaces.com/avatar/1752670679494-617784269.png"
          alt="diamond"
          width={32}
          height={32}
        />
        <span className="text-base font-semibold text-gray-900">
          Hiếm khi còn phòng! Chỗ ở này thường kín phòng
        </span>
      </div>
      <div className="w-full lg:w-[360px] p-6 rounded-xl shadow-lg space-y-4 h-fit bg-white">
        <h3 className="text-lg font-semibold">Thêm ngày để xem giá</h3>

        {checkIn && checkOut && (
          <div className="mb-2">
            <div className="text-xl font-semibold">{nights} đêm</div>
            <div className="text-gray-600">
              {format(checkIn, "dd 'thg' MM yyyy")} -{" "}
              {format(checkOut, "dd 'thg' MM yyyy")}
            </div>
          </div>
        )}

        <BookingCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          setCheckIn={setCheckIn}
          setCheckOut={setCheckOut}
          setNights={setNights}
          bookedDates={bookedDates}
          dateOpen={dateOpen}
          setDateOpen={setDateOpen}
        />

        <GuestSelector
          guests={guests}
          setGuests={setGuests}
          listing={listing}
          guestOpen={guestOpen}
          setGuestOpen={setGuestOpen}
        />

        <Button
          className="w-full h-12 bg-gradient-to-r from-[#ff4668] to-[#b91c5c] text-white font-bold text-lg rounded-xl border-0 hover:opacity-90 transition-all duration-200"
          onClick={handlePayment}
        >
          Đặt phòng
        </Button>

        {nights > 0 && (
          <div className="border-t pt-4 text-sm space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span>
                {pricePerNight} x {nights} đêm
              </span>
              <span>{(pricePerNight * nights).toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between">
              <span>Phí dịch vụ</span>
              <span>{calculatePrice().serviceFee.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between">
              <span>Thuế (8%)</span>
              <span>{calculatePrice().tax.toLocaleString()}₫</span>
            </div>
            {selectedServiceTotal > 0 && (
              <div className="flex justify-between">
                <span>Dịch vụ kèm theo</span>
                <span>{selectedServiceTotal.toLocaleString()}₫</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Tổng cộng</span>
              <span>{calculatePrice().total.toLocaleString()}₫</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingForm;
