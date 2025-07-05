import React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface BookingCalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setNights: (nights: number) => void;
  bookedDates: Date[];
  dateOpen: boolean;
  setDateOpen: (open: boolean) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  setNights,
  bookedDates,
  dateOpen,
  setDateOpen,
}) => {
  const calculateNights = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Popover open={dateOpen} onOpenChange={setDateOpen}>
      <PopoverTrigger asChild>
        <div className="border rounded-md p-3 cursor-pointer text-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">NHẬN PHÒNG</p>
            <p>{checkIn ? format(checkIn, "dd/MM/yyyy") : "Thêm ngày"}</p>
          </div>
          <div className="border-l px-4">
            <p className="text-xs text-gray-500">TRẢ PHÒNG</p>
            <p>{checkOut ? format(checkOut, "dd/MM/yyyy") : "Thêm ngày"}</p>
          </div>
          <CalendarIcon className="ml-2 h-4 w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <Calendar
          mode="range"
          selected={{
            from: checkIn ?? undefined,
            to: checkOut ?? undefined,
          }}
          onSelect={(range) => {
            const from = range?.from ?? null;
            const to = range?.to ?? null;
            setCheckIn(from);
            setCheckOut(to);
            setNights(calculateNights(from, to));
          }}
          numberOfMonths={2}
          disabled={bookedDates}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked: "bg-red-100 text-red-700 line-through",
          }}
        />

        <div className="mt-2 text-right text-sm text-gray-600">
          <button
            onClick={() => {
              setCheckIn(null);
              setCheckOut(null);
              setNights(0);
            }}
          >
            Xóa ngày
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BookingCalendar;
