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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col px-10 pt-8 pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle asChild>
              <h2 className="text-3xl font-bold">Thay đổi thông tin</h2>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
          <DialogDescription>
            Bạn có thể thay đổi ngày và số lượng khách.
          </DialogDescription>
        </div>

        <div className="flex bg-gray-100 mx-10 mb-6 h-14 rounded-full">
          <button
            className={`flex-1 py-3 text-center rounded-full text-lg font-semibold ${
              tab === "date" ? "bg-white shadow" : "text-gray-500"
            }`}
            onClick={() => setTab("date")}
          >
            Ngày
          </button>
          <button
            className={`flex-1 py-3 text-center rounded-full text-lg font-semibold ${
              tab === "guest" ? "bg-white shadow" : "text-gray-500"
            }`}
            onClick={() => setTab("guest")}
          >
            Khách
          </button>
        </div>

        <div className="px-10 pb-8 min-h-[300px]">
          {tab === "date" && (
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              disabled={bookedDates || []}
              modifiers={{
                booked: bookedDates || [],
                "selected-hover": dateRange
                  ? getDatesInRange(dateRange.from, dateRange.to)
                  : [],
              }}
              modifiersClassNames={{
                booked:
                  "bg-red-100 text-red-700 line-through opacity-50 cursor-not-allowed",
                "selected-hover":
                  "hover:bg-blue-100 hover:text-blue-700 cursor-pointer",
              }}
            />
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

        <div className="flex justify-between border-t px-10 py-6">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button className="bg-black text-white" onClick={handleSave}>
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingInfoModal;
