import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchListingById } from "@/store/slices/listingSlice";
import { IListing } from "@/types/listing";

// UI & Components
import { Button } from "@/components/ui/button";
import GallerySection from "@/components/roomdetail/GallerySection";
import RoomInfo from "@/components/roomdetail/RoomInfo";


export default function RoomDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedListing, loading, error } = useAppSelector(
    (state) => state.listing
  );
  const [isFavorite, setIsFavorite] = useState(false);

  // Gọi API lấy thông tin phòng
  useEffect(() => {
    if (id) dispatch(fetchListingById(id));
  }, [id, dispatch]);

  if (loading) return <p className="text-center py-10">Đang tải phòng...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!selectedListing)
    return <p className="text-center text-gray-500">Không tìm thấy phòng.</p>;

  // Dữ liệu phòng đã được lấy
  const listing: IListing = selectedListing;
  
console.log("Listing data:", listing.propertyId);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tiêu đề & nút chia sẻ/lưu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{listing.propertyId?.name}</h1>
            
            
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0 underline">
        
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span className="hidden lg:inline">Lưu</span>
            </Button>
          </div>
        </div>

        {/* Lưới bố cục các phần */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Gallery ảnh */}
          <div className="lg:col-span-3">
            <GallerySection images={listing.images} title={listing.title} />
          </div>

          {/* Thông tin phòng */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <RoomInfo listing={listing} />
          </div>
        </div>

  

        {/* Google Map */}
        {/* <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold mb-4">Nơi bạn sẽ đến</h2>
          <SearchableGoogleMap lat={listing.lat} lng={listing.lng} />
        </div> */}
      </div>
    </div>
  );
}
