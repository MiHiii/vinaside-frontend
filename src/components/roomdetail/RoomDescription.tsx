import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listing";

interface RoomDescriptionProps {
  listing: IListing;
}

const RoomDescription: React.FC<RoomDescriptionProps> = ({ listing }) => {
  return (
    <>
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold">
          Giới thiệu về chỗ ở này
        </h3>
        <div className="text-gray-700 leading-relaxed">
          <p>{listing.description}</p>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold">Tiện nghi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listing.amenities?.map((name, index) => (
            <div key={index} className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{name}</span>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-md border-none shadow-sm transition duration-200"
        >
          Hiển thị tất cả {listing.amenities?.length || 0} tiện nghi
        </Button>
      </div>
    </>
  );
};

export default RoomDescription;
