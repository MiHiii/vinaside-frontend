// components/RoomInfo.tsx
import React from "react";
import { IListing } from "@/types/listing";
import RoomHeader from "./RoomHeader";
import RoomDescription from "./RoomDescription";

interface RoomInfoProps {
  listing: IListing;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ listing }) => {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[50%] space-y-6 lg:space-y-8">
          <RoomHeader listing={listing} />
          <RoomDescription listing={listing} />
        </div>
      </div>
    </>
  );
};

export default RoomInfo;
