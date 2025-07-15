import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

type GuestType = {
  key: keyof GuestCount;
  label: string;
  desc: string | React.ReactNode;
};

type DateRangeType = DateRange | undefined;

function DateRangePickerBlock({
  selected,
  onSelect,
}: {
  selected: DateRangeType;
  onSelect: (range: DateRangeType) => void;
}) {
  return (
    <div className="w-full py-4">
      <Calendar
        mode="range"
        selected={selected}
        onSelect={onSelect}
        numberOfMonths={2}
        disabled={{ before: new Date() }}
        className="rounded-xl border-none w-full"
        style={{ width: "100%", minWidth: 0 }}
      />
    </div>
  );
}

function GuestSelector({
  guests,
  setGuests,
}: {
  guests: GuestCount;
  setGuests: (prev: GuestCount) => void;
}) {
  const guestTypes: GuestType[] = [
    { key: "adults", label: "Người lớn", desc: "Từ 13 tuổi trở lên" },
    { key: "children", label: "Trẻ em", desc: "Độ tuổi 2 – 12" },
    { key: "infants", label: "Em bé", desc: "Dưới 2 tuổi" },
    {
      key: "pets",
      label: "Thú cưng",
      desc: (
        <span>
          {" "}
          <a href="#" className="underline">
            Bạn sẽ mang theo động vật phục vụ?
          </a>
        </span>
      ),
    },
  ];

  return (
    <div>
      <p className="text-gray-500 mb-4">
        Chỗ ở này cho phép tối đa 2 khách, không tính em bé. Nếu bạn mang theo
        nhiều hơn 2 thú cưng, vui lòng báo cho Chủ nhà biết.
      </p>
      {guestTypes.map((type) => (
        <div key={type.key} className="flex items-center justify-between py-2">
          <div>
            <div className="font-medium">{type.label}</div>
            <div className="text-xs text-gray-500">{type.desc}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                setGuests({
                  ...guests,
                  [type.key]: Math.max(0, guests[type.key] - 1),
                })
              }
              disabled={guests[type.key] === 0}
            >
              –
            </Button>
            <span className="w-6 text-center">{guests[type.key]}</span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                setGuests({
                  ...guests,
                  [type.key]: guests[type.key] + 1,
                })
              }
            >
              +
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookingInfoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"date" | "guest">("date");
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: addDays(new Date(), 14),
    to: addDays(new Date(), 16),
  });
  const [guests, setGuests] = useState<GuestCount>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const handleDateSelect = (range: DateRangeType) => {
    setDateRange(range);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden bg-white border-none rounded-2xl shadow-lg"
        style={{ width: "650px", maxWidth: "650px", minWidth: 0 }}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-10 pt-8 pb-4">
            <h2 className="text-3xl font-bold">Thay đổi thông tin đặt phòng</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={onClose}
            >
              <span className="sr-only">Đóng</span>
              <svg width={28} height={28} fill="none" stroke="currentColor">
                <path
                  d="M8 8l12 12M8 20L20 8"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </svg>
            </Button>
          </div>
          <div className="flex bg-gray-100 rounded-full mx-10 mb-6 h-14">
            <button
              className={`flex-1 py-3 text-center rounded-full text-lg font-semibold transition ${
                tab === "date" ? "bg-white shadow-lg" : "text-gray-500"
              }`}
              onClick={() => setTab("date")}
            >
              Ngày
            </button>
            <button
              className={`flex-1 py-3 text-center rounded-full text-lg font-semibold transition ${
                tab === "guest" ? "bg-white shadow-lg" : "text-gray-500"
              }`}
              onClick={() => setTab("guest")}
            >
              Khách
            </button>
          </div>
        </div>
        <div className="px-10 pb-8 pt-4 min-h-[400px]">
          {tab === "date" && (
            <DateRangePickerBlock
              selected={dateRange}
              onSelect={handleDateSelect}
            />
          )}
          {tab === "guest" && (
            <GuestSelector guests={guests} setGuests={setGuests} />
          )}
        </div>
        <div className="flex items-center justify-between border-t border-gray-300 px-10 py-6 bg-white">
          <Button variant="ghost" size="lg" className="text-gray-700 text-base">
            {tab === "date" ? "Xóa ngày" : "Hủy"}
          </Button>
          <Button className="bg-black text-white  rounded-xl px-7 py-3 text-lg font-medium">
            Lưu 
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
