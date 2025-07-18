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

  const getDatesInRange = (start?: Date, end?: Date): Date[] => {
    if (!start || !end) return [];
    const dates: Date[] = [];
    const curr = new Date(start);

    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }

    return dates;
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      setDateRange(range);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl shadow-xl max-w-[700px] w-full p-0">
        <div className="flex flex-col pt-8 pb-4 px-8">
          <div className="flex justify-between items-center">
            <DialogTitle asChild>
              <h2 className="text-3xl font-bold">
                Thay đổi thông tin đặt phòng
              </h2>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
          <DialogDescription className="mb-4">
            Bạn có thể thay đổi ngày và số lượng khách.
          </DialogDescription>
        </div>

        <div className="flex bg-gray-100 mx-0 mb-6 h-16 rounded-full">
          {tab === "date" ? (
            <button className="flex-1 py-4 text-center rounded-full text-lg font-semibold bg-white shadow transition">
              Ngày
            </button>
          ) : (
            <button
              className="flex-1 py-4 text-center rounded-full text-lg font-semibold text-gray-500 transition"
              onClick={() => setTab("date")}
            >
              Ngày
            </button>
          )}
          {tab === "guest" ? (
            <button className="flex-1 py-4 text-center rounded-full text-lg font-semibold bg-white shadow transition">
              Khách
            </button>
          ) : (
            <button
              className="flex-1 py-4 text-center rounded-full text-lg font-semibold text-gray-500 transition"
              onClick={() => setTab("guest")}
            >
              Khách
            </button>
          )}
        </div>

        <div className="w-full px-8 pb-8 min-h-[300px]">
          {tab === "date" && (
            <div className="flex flex-col items-center w-full">
              <div className="mb-4 text-lg font-semibold text-gray-700">
                Chọn ngày nhận phòng - trả phòng
              </div>
              <div className="w-full">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleSelect}
                  numberOfMonths={2}
                  showOutsideDays={false}
                  disabled={bookedDates || []}
                  modifiers={{
                    booked: bookedDates || [],
                    range_middle:
                      dateRange && dateRange.from && dateRange.to
                        ? getDatesInRange(dateRange.from, dateRange.to).filter(
                            (d) =>
                              d.toDateString() !==
                                dateRange.from?.toDateString() &&
                              d.toDateString() !== dateRange.to?.toDateString()
                          )
                        : [],
                  }}
                  modifiersClassNames={{
                    booked:
                      "text-gray-500 line-through opacity-90 cursor-not-allowed",
                    selected: "bg-black text-white rounded-full font-bold",
                    range_middle: "bg-gray-100 text-black rounded-none",
                    today: "border border-black",
                    "selected-hover":
                      "hover:bg-gray-200 hover:text-black cursor-pointer",
                  }}
                  className="w-full max-w-none"
                  classNames={{
                    caption: "text-lg font-bold mb-4",
                    nav: "flex items-center justify-between mb-4",
                    nav_button:
                      "w-10 h-10 rounded-full border border-gray-300 text-xl text-black hover:bg-gray-200",
                    table: "w-full border-collapse",
                    head_row: "",
                    head_cell: "text-base font-semibold text-gray-500 p-2",
                    row: "",
                    cell: "w-12 h-12 p-0 text-center align-middle text-lg",
                  }}
                />
              </div>
            </div>
          )}
          {tab === "guest" && (
            <div>
              {/* Người lớn */}
              <div className="flex justify-between py-2">
                <div>Người lớn</div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleChange("adults", -1)}
                    disabled={guests.adults <= 1}
                  >
                    -
                  </Button>
                  <span>{guests.adults}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleChange("adults", 1)}
                    disabled={guests.adults >= maxGuests}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Em bé */}
              {allowInfants && (
                <div className="flex justify-between py-2">
                  <div>Em bé</div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleChange("infants", -1)}
                      disabled={guests.infants <= 0}
                    >
                      -
                    </Button>
                    <span>{guests.infants}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleChange("infants", 1)}
                      disabled={guests.infants >= maxInfants}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-8 py-6">
          <Button
            variant="outline"
            className="border-black text-black bg-white rounded-xl text-lg py-3"
            onClick={() => setDateRange(undefined)}
          >
            Xóa ngày
          </Button>
          <Button
            className="bg-black text-white rounded-xl text-lg py-3"
            onClick={handleSave}
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingInfoModal;
