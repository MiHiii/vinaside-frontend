import React from "react";
import { Users, Home, Bed, Bath, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IListing } from "@/types/listing";

interface RoomHeaderProps {
  listing: IListing;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ listing }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 -mt-7">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {listing.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{listing.max_guests}</p>
                  <p className="text-sm text-gray-600">khách</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">1</p>
                  <p className="text-sm text-gray-600">phòng ngủ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bed className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{listing.beds}</p>
                  <p className="text-sm text-gray-600">giường</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{listing.bathrooms}</p>
                  <p className="text-sm text-gray-600">phòng tắm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-current text-yellow-400" />
          <span className="font-medium">
            {listing.average_rating?.toFixed(1) || 0}
          </span>
        </div>
        <span className="text-gray-600">•</span>
        <button className="text-gray-600 hover:text-gray-900 underline font-medium">
          {listing.reviews_count || 0} đánh giá
        </button>
        <span className="text-gray-600">•</span>
        <Badge
          variant="secondary"
          className="bg-pink-100 text-pink-800 hover:bg-pink-200"
        >
          Được khách yêu thích
        </Badge>
      </div>
    </div>
  );
};

export default RoomHeader;
