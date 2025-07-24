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
  selectedServices: {
    service_id: string;
    service_name: string;
    service_price: number;
    quantity: number;
    total_price: number;
  }[];
  setSelectedServices: (services: any[]) => void;
  safetyFeatures: SafetyFeature[];
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  listing,
  amenitiesList,
  services,
  selectedServices,
  setSelectedServices,
  safetyFeatures,
}) => {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full max-w-[900px] mr-auto pr-8 space-y-6 lg:space-y-8">
          <RoomHeader listing={listing} />
          <RoomDescription
            listing={listing}
            amenitiesList={amenitiesList}
            services={services}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            safetyFeatures={safetyFeatures}
          />
        </div>
      </div>
    </>
  );
};

export default RoomInfo;
