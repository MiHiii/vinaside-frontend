// components/RoomInfo.tsx
import React, { useState } from "react";
import { IListing } from "@/types/listing";
import RoomHeader from "./RoomHeader";
import RoomDescription from "./RoomDescription";
import BookingForm from "./BookingForm";
import { useBookedDates } from "@/hooks/useBookedDates";

interface RoomInfoProps {
  listing: IListing;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ listing }) => {
  const { bookedDates } = useBookedDates(listing._id);

  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [nights, setNights] = useState<number>(0);

  const [guests, setGuests] = useState({
    adults: listing.guests || 1,
    infants: listing.allow_infants ? 1 : 0,
    pets: listing.allow_pets ? 0 : 0,
  });

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[50%] space-y-6 lg:space-y-8">
          <RoomHeader listing={listing} />
          <RoomDescription listing={listing} />
        </div>

        <BookingForm
          listing={listing}
          checkIn={checkIn}
          checkOut={checkOut}
          setCheckIn={setCheckIn}
          setCheckOut={setCheckOut}
          nights={nights}
          setNights={setNights}
          guests={guests}
          setGuests={setGuests}
          bookedDates={bookedDates}
          dateOpen={dateOpen}
          setDateOpen={setDateOpen}
          guestOpen={guestOpen}
          setGuestOpen={setGuestOpen}
        />
      </div>
    </>
  );
};

export default RoomInfo;
