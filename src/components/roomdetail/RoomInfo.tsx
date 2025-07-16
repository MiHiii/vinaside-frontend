// components/RoomInfo.tsx
import React from "react";
import { IListing } from "@/types/listing";
import { Amenity } from "@/types/amenity";
import RoomHeader from "./RoomHeader";
import RoomDescription from "./RoomDescription";

interface RoomInfoProps {
  listing: IListing;
  amenitiesList: Amenity[];
  selectedServices: string[];
  setSelectedServices: (s: string[]) => void;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ listing, amenitiesList, selectedServices, setSelectedServices }) => {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full max-w-[900px] mr-auto pr-8 space-y-6 lg:space-y-8">
          <RoomHeader listing={listing} />
          <RoomDescription listing={listing} amenitiesList={amenitiesList} selectedServices={selectedServices} setSelectedServices={setSelectedServices} />
        </div>
      </div>
    </>
  );
};

export default RoomInfo;
