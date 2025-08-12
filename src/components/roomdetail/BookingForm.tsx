import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BookingCalendar from "./BookingCalendar";
import GuestSelector from "./GuestSelector";
import { IListing } from "@/types/listing";
import { toast } from "sonner";
import { Service } from "@/types/services";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setSelectedServices } from "@/store/slices/bookingSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateWeekendSurcharge } from "@/utils/priceCalculation";
import LoginForm from "@/components/auth/LoginForm";

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
  selectedServices: Array<{
    service_id: string;
    service_name: string;
    service_price: number;
    quantity: number;
    total_price: number;
    icon_url?: string;
  }>;
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
  selectedServices,
  loading = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  // State để quản lý modal login
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  const pricePerNight = listing.price_per_night || 0;

  // Debug: Log selectedServices để kiểm tra
  console.log("BookingForm selectedServices:", selectedServices);

  // Force re-render khi selectedServices thay đổi
  React.useEffect(() => {
    console.log("BookingForm: selectedServices changed, recalculating...");
  }, [selectedServices]);

  const calculatePrice = () => {
    // Tính weekend surcharge nếu có
    let weekendSurcharge = 0;
    if (
      listing.has_weekend_surcharge &&
      listing.weekend_surcharge_percent &&
      checkIn &&
      checkOut
    ) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      // Sử dụng utility function giống Backend
      weekendSurcharge = calculateWeekendSurcharge(listing, startDate, endDate);
    }

    const base = nights * pricePerNight + weekendSurcharge;

    // Tính lại selectedServiceTotal mỗi khi gọi calculatePrice
    const currentSelectedServiceTotal = (selectedServices ?? []).reduce(
      (sum, s) => {
        const serviceTotal = s.total_price || s.service_price * s.quantity || 0;
        return sum + serviceTotal;
      },
      0
    );

    // Tính tổng tiền (phòng + dịch vụ) - giống logic trang thanh toán
    const totalAmount = base + currentSelectedServiceTotal;

    // Tính phí dịch vụ và thuế dựa trên tổng tiền (phòng + dịch vụ)
    const serviceFee = Math.round(totalAmount * 0.1);
    const tax = Math.round(totalAmount * 0.08);

    const total = base + serviceFee + tax + currentSelectedServiceTotal;
    console.log("calculatePrice:", {
      base: nights * pricePerNight,
      weekendSurcharge,
      totalBase: base,
      currentSelectedServiceTotal,
      totalAmount,
      serviceFee,
      tax,
      total,
    });
    return {
      base: nights * pricePerNight,
      weekendSurcharge,
      totalBase: base,
      tax,
      total,
      selectedServiceTotal: currentSelectedServiceTotal,
      serviceFee,
    };
  };

  const handlePayment = () => {
    if (!checkIn || !checkOut || !guests.adults) {
      toast.error(
        "Vui lòng chọn ngày nhận phòng, trả phòng và số khách trước khi tiếp tục.",
        {
          style: { color: "#ffffff" },
        }
      );
      return;
    }

    // Kiểm tra authentication trước khi đặt phòng
    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để đặt phòng.", {
        style: { color: "#ffffff" },
      });
      setIsLoginModalOpen(true);
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

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    // Sau khi đăng nhập thành công, tự động tiếp tục đặt phòng
    handlePayment();
  };

  if (loading) {
    return (
      <div
        key="booking-form-loading"
        className="w-full lg:w-[360px] p-6 rounded-xl shadow-lg space-y-4 h-fit bg-white"
      >
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
      <div
        key={`booking-form-${selectedServices.length}-${selectedServices.reduce(
          (sum, s) => sum + (s.total_price || 0),
          0
        )}`}
        className="w-full lg:w-[360px] p-6 rounded-xl shadow-lg space-y-4 h-fit bg-white"
      >
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
            {calculatePrice().weekendSurcharge > 0 && (
              <div className="flex justify-between text-yellow-600">
                <span>
                  Phụ phí cuối tuần (+{listing.weekend_surcharge_percent}%)
                </span>
                <span>
                  +{calculatePrice().weekendSurcharge.toLocaleString()}₫
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí dịch vụ</span>
              <span>{calculatePrice().serviceFee.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between">
              <span>Thuế (8%)</span>
              <span>{calculatePrice().tax.toLocaleString()}₫</span>
            </div>
            {calculatePrice().selectedServiceTotal > 0 && (
              <div className="flex justify-between">
                <span>Dịch vụ kèm theo</span>
                <span>
                  {calculatePrice().selectedServiceTotal.toLocaleString()}₫
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Tổng cộng</span>
              <span>{calculatePrice().total.toLocaleString()}₫</span>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default BookingForm;
