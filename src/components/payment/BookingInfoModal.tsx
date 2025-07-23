import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { startOfToday, isBefore } from "date-fns";

interface BookingInfoModalProps {
  open: boolean;
  onClose: () => void;
  initialDateRange: DateRange | undefined;
  initialGuests: { adults: number; infants: number };
  maxGuests: number;
  allowInfants?: boolean;
  maxInfants: number;
  bookedDates: Date[];
  onSave: (data: {
    dateRange: DateRange | undefined;
    guests: { adults: number; infants: number };
  }) => void;
}

const BookingInfoModal: React.FC<BookingInfoModalProps> = ({
  open,
  onClose,
  initialDateRange,
  initialGuests,
  maxGuests,
  allowInfants,
  maxInfants,
  bookedDates,
  onSave,
}) => {
  const [tab, setTab] = useState<"date" | "guest">("date");
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [guests, setGuests] = useState(initialGuests);

  const handleSave = () => {
    onSave({ dateRange, guests });
    onClose();
  };

  const handleChange = (key: "adults" | "infants", delta: number) => {
    setGuests((prev) => {
      let next = prev[key] + delta;
      if (key === "adults") {
        if (next < 1) next = 1;
        if (next > maxGuests) next = maxGuests;
      }
      if (key === "infants") {
        if (!allowInfants) return prev;
        if (next < 0) next = 0;
        if (next > maxInfants) next = maxInfants;
      }
      return { ...prev, [key]: next };
    });
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      setDateRange(range);
      return;
    }

    // Kiểm tra ngày quá khứ
    const today = startOfToday();
    if (isBefore(range.from, today) || isBefore(range.to, today)) {
      setDateRange(undefined);
      return;
    }

    // Kiểm tra có ngày nào trong range bị disable không
    const current = new Date(range.from);
    let invalid = false;
    while (current <= range.to) {
      if (
        (bookedDates || []).some(
          (d) => d.toDateString() === current.toDateString()
        )
      ) {
        invalid = true;
        break;
      }
      current.setDate(current.getDate() + 1);
    }
    if (invalid) {
      setDateRange(undefined);
      return;
    }
    setDateRange(range);
  };

  // Tạo mảng ngày bị disable bao gồm cả ngày quá khứ
  const disabledDates = [
    ...(bookedDates || []),
    ...Array.from({ length: startOfToday().getDate() - 1 }, (_, i) => {
      const date = new Date();
      date.setDate(i + 1);
      return date;
    }),
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-3xl shadow-2xl w-[1200px] min-h-[500px] p-0 border-0 !max-w-[600px]">
        <div className="flex flex-col pt-8 pb-4">
          <div className="flex flex-col items-center justify-center mb-2 px-8">
            <DialogTitle asChild>
              <h2 className="text-2xl font-bold text-center mb-1">
                Thay đổi thông tin đặt phòng
              </h2>
            </DialogTitle>
            <DialogDescription className="mb-2 text-center text-base text-gray-500">
              Bạn có thể thay đổi ngày và số lượng khách.
            </DialogDescription>
          </div>

          {/* Nút chuyển tab */}
          <div className="flex bg-gray-100 mx-8 mb-6 h-14 rounded-full overflow-hidden border border-gray-200">
            <button
              className={`flex-1 py-3 text-center text-lg font-semibold transition-all duration-150 ${
                tab === "date"
                  ? "bg-white shadow text-black"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              style={{ borderRadius: "999px 0 0 999px" }}
              onClick={() => setTab("date")}
            >
              Ngày
            </button>
            <button
              className={`flex-1 py-3 text-center text-lg font-semibold transition-all duration-150 ${
                tab === "guest"
                  ? "bg-white shadow text-black"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              style={{ borderRadius: "0 999px 999px 0" }}
              onClick={() => setTab("guest")}
            >
              Khách
            </button>
          </div>

          <div>
            {tab === "date" && (
              <div>
                <div className="mb-4 text-lg font-semibold text-gray-700 text-center">
                  Chọn ngày nhận phòng - trả phòng
                </div>
                <div className="flex justify-center">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleSelect}
                    numberOfMonths={2}
                    showOutsideDays={false}
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
                      day: "h-9 w-9 p-0 font-normal rounde  d-full hover:bg-gray-100 mx-auto flex items-center justify-center",
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
                </div>
              </div>
            )}

            {tab === "guest" && (
              <div className="w-full h-full flex flex-col justify-center px-8">
                {/* Người lớn */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="font-medium text-base">Người lớn</div>
                  <div className="flex gap-2 items-center">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleChange("adults", -1)}
                      disabled={guests.adults <= 1}
                      className="rounded-full border-gray-300"
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {guests.adults}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleChange("adults", 1)}
                      disabled={guests.adults >= maxGuests}
                      className="rounded-full border-gray-300"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Em bé */}
                {allowInfants && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-base">Em bé</div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleChange("infants", -1)}
                        disabled={guests.infants <= 0}
                        className="rounded-full border-gray-300"
                      >
                        -
                      </Button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {guests.infants}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleChange("infants", 1)}
                        disabled={guests.infants >= maxInfants}
                        className="rounded-full border-gray-300"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-8 py-6 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 bg-white rounded-xl text-lg py-3 hover:bg-gray-100"
              onClick={() => setDateRange(undefined)}
            >
              Xóa ngày
            </Button>
            <Button
              className="bg-black text-white rounded-xl text-lg py-3 px-8 shadow hover:bg-gray-900"
              onClick={handleSave}
            >
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingInfoModal;
