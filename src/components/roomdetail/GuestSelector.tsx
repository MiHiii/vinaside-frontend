import React, { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listing";

interface GuestSelectorProps {
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
  listing: IListing;
  guestOpen: boolean;
  setGuestOpen: (open: boolean) => void;
}

const GuestSelector: React.FC<GuestSelectorProps> = ({
  guests,
  setGuests,
  listing,
  guestOpen,
  setGuestOpen,
}) => {
  const guestLabel = `${guests.adults} khách${
    guests.infants ? `, ${guests.infants} em bé` : ""
  }${guests.pets ? `, ${guests.pets} thú cưng` : ""}`;

  const handleChange = (type: keyof typeof guests, delta: number) => {
    setGuests((prev) => {
      let next = prev[type] + delta;
      if (next < 0) next = 0;
      if (next > listing.max_guests) next = listing.max_guests;
      if (type === "adults" && next === 0) next = 1;
      if (type === "infants") {
        if (!listing.allow_infants) return prev;
        if (listing.max_infants !== undefined && next > listing.max_infants) {
          next = listing.max_infants;
        }
      }
      return { ...prev, [type]: next };
    });
  };

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guestOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setGuestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [guestOpen]);

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        onClick={() => setGuestOpen(!guestOpen)}
        className={`w-full rounded-xl border border-gray-300 px-4 py-2 text-left bg-white flex flex-col items-start justify-between relative focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black transition-all ${guestOpen ? 'border-black ring-2 ring-black' : ''}`}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide text-gray-800">KHÁCH</span>
            <span className="text-base font-normal text-gray-900">{guestLabel || "1 khách"}</span>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-500 ml-2" />
        </div>
      </button>
      {guestOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-10 w-full min-w-[300px] max-w-[320px] p-4 bg-white rounded-xl shadow-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.10)] space-y-3 border-none mt-1"
        >
          {/* Người lớn */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-base text-gray-900">Người lớn</p>
              <p className="text-xs text-gray-500">Từ 13 tuổi trở lên</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" onClick={() => handleChange('adults', -1)} disabled={guests.adults <= 1}
              >-</Button>
              <span className="font-bold text-lg w-6 text-center">{guests.adults}</span>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" onClick={() => handleChange('adults', 1)}
              >+</Button>
            </div>
          </div>
          {/* Em bé */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-base text-gray-900">Em bé</p>
              <p className="text-xs text-gray-500">Dưới 2 tuổi</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" onClick={() => handleChange('infants', -1)} disabled={guests.infants <= 0 || !listing.allow_infants}
              >-</Button>
              <span className="font-bold text-lg w-6 text-center">{guests.infants}</span>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" onClick={() => handleChange('infants', 1)} disabled={!listing.allow_infants}
              >+</Button>
            </div>
          </div>
          {/* Thú cưng */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-base text-gray-900">Thú cưng</p>
              <a href="#" className="text-xs text-gray-900 underline font-medium">Bạn sẽ mang theo động vật phục vụ?</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" onClick={() => handleChange('pets', -1)} disabled={guests.pets <= 0 || !listing.allow_pets}
              >-</Button>
              <span className="font-bold text-lg w-6 text-center">{guests.pets}</span>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" onClick={() => handleChange('pets', 1)} disabled={!listing.allow_pets}
              >+</Button>
            </div>
          </div>
          {/* Ghi chú dưới cùng */}
          <div className="mt-4 text-xs text-gray-500">
            Chỗ ở này cho phép tối đa 2 khách, không tính em bé. Không được phép mang theo thú cưng.
          </div>
          {/* Nút đóng */}
          <div className="flex justify-end mt-2">
            <button className="text-base font-semibold underline text-gray-900 px-2 py-1" onClick={() => setGuestOpen(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestSelector;
