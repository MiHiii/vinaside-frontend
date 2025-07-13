import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  return (
    <Popover open={guestOpen} onOpenChange={setGuestOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {guestLabel || "Khách"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="start">
        {[
          {
            label: "Người lớn",
            desc: "Từ 13 tuổi trở lên",
            key: "adults" as keyof typeof guests,
            disabled: false,
          },
          {
            label: "Em bé",
            desc: "Dưới 2 tuổi",
            key: "infants" as keyof typeof guests,
            disabled: !listing.allow_infants,
          },
          {
            label: "Thú cưng",
            desc: "Có thể mang theo",
            key: "pets" as keyof typeof guests,
            disabled: !listing.allow_pets,
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b last:border-b-0 opacity-100"
          >
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleChange(item.key, -1)}
                disabled={item.disabled}
              >
                -
              </Button>
              <span>{guests[item.key]}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleChange(item.key, 1)}
                disabled={item.disabled}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default GuestSelector;
