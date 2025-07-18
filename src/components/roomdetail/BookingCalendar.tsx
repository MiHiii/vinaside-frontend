import React, { useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dateOpen]);

  return (
    <div className="relative w-full">
      <div
        ref={triggerRef}
        className="border rounded-2xl p-3 cursor-pointer text-sm flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition min-h-[44px] w-full"
        onClick={() => setDateOpen(!dateOpen)}
      >
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
      {dateOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-10 w-auto p-6 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-xl border-0 -translate-x-60 mt-1"
        >
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
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
