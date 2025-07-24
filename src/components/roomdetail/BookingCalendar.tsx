import React, { useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
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

    // Kiểm tra ngày quá khứ
    const today = startOfToday();
    if (isBefore(range.from, today) || isBefore(range.to, today)) {
      setCheckIn(null);
      setCheckOut(null);
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

  // Tạo mảng ngày bị disable bao gồm cả ngày quá khứ
  const disabledDates = [
    ...bookedDates,
    ...Array.from({ length: startOfToday().getDate() - 1 }, (_, i) => {
      const date = new Date();
      date.setDate(i + 1);
      return date;
    }),
  ];

  const selected = {
    from: checkIn ?? undefined,
    to: checkOut ?? undefined,
  };

  return (
    <div className="relative w-full ">
      <div
        ref={triggerRef}
        className="border rounded-2xl p-3 cursor-pointer text-sm flex items-center justify-between transition min-h-[44px] w-full"
        onClick={() => setDateOpen(!dateOpen)}
      >
        <div>
          <p className="text-xs text-gray-500">NHẬN PHÒNG</p>
          <p className="text-base">
            {checkIn ? format(checkIn, "dd/MM/yyyy") : "Thêm ngày"}
          </p>
        </div>
        <div className="border-l px-2">
          <p className="text-xs text-gray-500">TRẢ PHÒNG</p>
          <p className="text-base">
            {checkOut ? format(checkOut, "dd/MM/yyyy") : "Thêm ngày"}
          </p>
        </div>
        <CalendarIcon className="ml-2 h-4 w-4" />
      </div>

      {dateOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-10 w-auto p-6 bg-white text-gray-900 shadow-lg rounded-xl border-0 -translate-x-60 mt-1"
        >
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={disabledDates}
            fromDate={startOfToday()}
            className="bg-white rounded-xl p-6"
            classNames={{
              
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button:
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex w-full justify-between",
              head_cell:
                "text-muted-foreground w-9 font-normal text-[0.8rem] text-center",
              row: "flex w-full justify-between mt-2",
              cell: "relative w-9 h-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal rounded-full hover:bg-gray-100 mx-auto flex items-center justify-center",
              day_selected:
                "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-full",
              day_today: "bg-gray-100 text-gray-900 rounded-full",
              day_outside: "hidden",
              day_disabled: "text-gray-300 line-through opacity-50",
              day_range_middle:
                "aria-selected:bg-gray-100 aria-selected:text-gray-900",
              day_hidden: "invisible",
              day_range_start:
                "bg-black text-white rounded-full font-semibold hover:bg-black hover:text-white focus:bg-black focus:text-white",
              day_range_end:
                "bg-black text-white rounded-full font-semibold hover:bg-black hover:text-white focus:bg-black focus:text-white",
            }}
            modifiers={{ booked: bookedDates }}
            modifiersClassNames={{
              booked:
                "text-gray-300 line-through opacity-50 cursor-not-allowed",
            }}
          />
          <div className="mt-4 text-right text-base text-gray-600">
            <button
              onClick={() => {
                setCheckIn(null);
                setCheckOut(null);
                setNights(0);
              }}
              className="hover:underline"
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
