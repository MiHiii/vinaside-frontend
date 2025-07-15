
import { Button } from "@/components/ui/button";
import {  Heart, Share } from "lucide-react";
import GallerySection from "@/components/roomdetail/GallerySection";
import RoomInfo from "@/components/roomdetail/RoomInfo";
import BookingForm from "@/components/roomdetail/Booking";
import { useState } from "react";
import { RoomAvailabilityAlert } from "@/components/roomdetail/RoomAvailabilityAlert";
import ReviewsSection from "@/components/roomdetail/Evaluate";

import SearchableGoogleMap from "@/components/roomdetail/RoomMap";
// import RoomMap from "@/components/roomdetail/RoomMap";
export default function RoomDetailPage() {
  
    const [isFavorite, setIsFavorite] = useState(false);
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Phòng dịch vụ giá rẻ tại Quận 1 - S2</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0 underline ">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-700 hover:bg-gray-100">
              <Share className="h-4 w-4" />
              <span className="hidden lg:inline">Chia sẻ</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="hidden lg:inline">Lưu</span>
            </Button>
          </div>
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Hàng 1: GallerySection (span cả 3 cột ở lg) */}
          <div className="lg:col-span-3">
            <GallerySection />
          </div>

          {/* Hàng 2 - Phần Left (RoomInfo) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <RoomInfo />
          </div>

          {/* Hàng 2 - Phần Right (BookingForm) */}
          <div className="lg:col-span-1">
            <div>
              <RoomAvailabilityAlert />
            </div>
            <div className="sticky top-0 -mt-55">
              <BookingForm />
            </div>
          </div>

        </div>

        
        <div className=" ">
        <ReviewsSection />


      </div>
        <div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-4">Nơi bạn sẽ đến</h2>
            <SearchableGoogleMap  />
          </div>
        </div>
      </div>
    </div>
  );
}
