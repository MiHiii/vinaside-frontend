// components/RoomInfo.tsx
import React from "react";
import { IListing } from "@/types/listing";
import { Amenity } from "@/types/amenity";
import { Service } from "@/types/services";
import { SafetyFeature } from "@/types/safety-feature";
import RoomHeader from "./RoomHeader";
import RoomDescription from "./RoomDescription";

interface RoomInfoProps {
  listing: IListing;
  amenitiesList: Amenity[];
  services: Service[];
  selectedServiceIds: string[];
  setSelectedServiceIds: (ids: string[]) => void;
  safetyFeatures: SafetyFeature[];
}

const RoomInfo: React.FC<RoomInfoProps> = ({ listing, amenitiesList, services, selectedServiceIds, setSelectedServiceIds, safetyFeatures }) => {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full max-w-[900px] mr-auto pr-8 space-y-6 lg:space-y-8">
          <RoomHeader listing={listing} />
          <RoomDescription
            listing={listing}
            amenitiesList={amenitiesList}
            services={services}
            selectedServiceIds={selectedServiceIds}
            setSelectedServiceIds={setSelectedServiceIds}
            safetyFeatures={safetyFeatures}
          />
        </div>
      </div>
    </>
  );
};

export default RoomInfo;
