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

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from || !range?.to) {
      setCheckIn(range?.from ?? null);
      setCheckOut(range?.to ?? null);
      setNights(0);
      return;
    }
    // Kiểm tra có ngày nào trong range bị disable không
    const current = new Date(range.from);
    let invalid = false;
    while (current <= range.to) {
      if (
        bookedDates.some((d) => d.toDateString() === current.toDateString())
      ) {
        invalid = true;
        break;
      }
      current.setDate(current.getDate() + 1);
    }
    if (invalid) {
      setCheckIn(null);
      setCheckOut(null);
      setNights(0);
      return;
    }
    setCheckIn(range.from);
    setCheckOut(range.to);
    setNights(calculateNights(range.from, range.to));
    // Auto close popover when both dates are selected
    if (range.from && range.to) {
      setDateOpen(false);
    }
  };

  return (
    <Popover open={dateOpen} onOpenChange={setDateOpen}>
      <PopoverTrigger asChild>
        <div className="border rounded-2xl p-3 cursor-pointer text-sm flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition min-h-[44px] w-full">
          <div>
            <p className="text-xs text-gray-500">NHẬN PHÒNG</p>
            <p className="text-base">{checkIn ? format(checkIn, "dd/MM/yyyy") : "Thêm ngày"}</p>
          </div>
          <div className="border-l px-2">
            <p className="text-xs text-gray-500">TRẢ PHÒNG</p>
            <p className="text-base">{checkOut ? format(checkOut, "dd/MM/yyyy") : "Thêm ngày"}</p>
          </div>
          <CalendarIcon className="ml-2 h-4 w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-6 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-xl border-0 -translate-x-12" align="start">
        <Calendar
          mode="range"
          selected={{
            from: checkIn ?? undefined,
            to: checkOut ?? undefined,
          }}  
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={bookedDates}
          modifiers={{ booked: bookedDates }}
          modifiersClassNames={{
            booked:
              "bg-gray-300 text-gray-500 line-through opacity-60 cursor-not-allowed",
          }}
        />
        <div className="mt-4 text-right text-base text-gray-600">
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
