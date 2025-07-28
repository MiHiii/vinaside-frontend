// components/RoomInfo.tsx
import React from "react";
import { IListing } from "@/types/listing";
import { Amenity } from "@/types/amenity";
import { Service } from "@/types/services";
import { SafetyFeature } from "@/types/safety-feature";
import RoomHeader from "./RoomHeader";
import RoomDescription from "./RoomDescription";
import { Skeleton } from "@/components/ui/skeleton";

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
  loading?: boolean;
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  listing,
  amenitiesList,
  services,
  selectedServices,
  setSelectedServices,
  safetyFeatures,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full max-w-[900px] mr-auto pr-8 space-y-6 lg:space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

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
