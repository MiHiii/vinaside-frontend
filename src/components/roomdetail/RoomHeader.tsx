import React from "react";
import { Star } from "lucide-react";
import { IListing } from "@/types/listing";

interface RoomHeaderProps {
  listing: IListing;
}

// Laurel SVG chuẩn Airbnb


const RoomHeader: React.FC<RoomHeaderProps> = ({ listing }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
        {listing.title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 mb-2">
        <span>{listing.max_guests} khách</span>
        <span>· {listing.beds} giường</span>
        <span>· {listing.bathrooms} phòng tắm</span>
      </div>
      <div className="rounded-2xl border border-gray-300 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src="https://vinaside.sgp1.digitaloceanspaces.com/avatar/1752684867666-662549443.png" alt="favorite" width={32} height={32} className="inline-block" />
          <div className="text-[1.6rem] font-bold leading-tight text-gray-900 text-center px-2 select-none">
            Được khách<br/>yêu thích
          </div>
          
        </div>
        <div className="flex-1 min-w-0 text-gray-900 text-[1.25rem] font-medium leading-snug font-sans">
          Khách đánh giá đây là một trong những căn phòng được yêu thích nhất trên Vinaside
        </div>
        <div className="flex items-center gap-6 flex-1 min-w-0 justify-end">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{listing.average_rating?.toFixed(2) || '0.00'}</span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
             
            </div>
          </div>
          <div className="border-l h-8 mx-2" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{listing.reviews_count || 0}</span>
            <span className="text-xs text-gray-500">đánh giá</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomHeader;
