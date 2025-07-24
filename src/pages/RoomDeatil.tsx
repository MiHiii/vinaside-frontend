import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchListingById, incrementViewCount } from "@/store/slices/listingSlice";
import { IListing } from "@/types/listing";
import { fetchAmenities, selectAmenities } from "@/store/slices/amenitySlice";
import { fetchServices } from "@/store/slices/serviceSlice";
import { fetchSafetyFeatures } from "@/store/slices/safetyFeatureSlice";
import { fetchHouseRules } from "@/store/slices/houseRuleSlice";

// UI & Components

import { Button } from "@/components/ui/button";
import GallerySection from "@/components/roomdetail/GallerySection";
import RoomInfo from "@/components/roomdetail/RoomInfo";
import BookingForm from "@/components/roomdetail/BookingForm";
import { useBookedDates } from "@/hooks/useBookedDates";
import RoomReviews from "@/components/roomdetail/RoomReviews";


export default function RoomDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { listing, loading, error } = useAppSelector((state) => state.listings);
  const [isFavorite, setIsFavorite] = useState(false);

  // Move hooks to top, use fallback values
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [nights, setNights] = useState<number>(0);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  // listingId fallback for hook
  const listingId = listing?._id || "";
  const { bookedDates } = useBookedDates(listingId);
  // guests fallback for state
  const [guests, setGuests] = useState({
    adults: listing?.guests || 1,
    infants: listing?.allow_infants ? 1 : 0,
    pets: listing?.allow_pets ? 0 : 0,
  });
  // State for selected services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const amenitiesList = useAppSelector(selectAmenities);
  const services = useAppSelector((state) => state.service.services);
  const safetyFeatures = useAppSelector(
    (state) => state.safetyFeature.safetyFeatures
  );

  // Gọi API lấy thông tin phòng và tiện ích
  useEffect(() => {
    if (id) {
      dispatch(incrementViewCount(id));
    }
    if (id) dispatch(fetchListingById(id));
    dispatch(fetchAmenities({}));
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
  }, [id, dispatch]);

  if (loading) return <p className="text-center py-10">Đang tải phòng...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!listing)
    return <p className="text-center text-gray-500">Không tìm thấy phòng.</p>;

  // Dữ liệu phòng đã được lấy
  const listingData: IListing = listing as IListing;

  console.log("Listing data:", listingData.propertyId);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tiêu đề & nút chia sẻ/lưu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              {listingData.propertyId?.name}
            </h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Gallery ảnh */}
          <div className="col-span-full">
            <GallerySection
              images={listingData.images}
              title={listingData.title}
            />
          </div>

          {/* Thông tin phòng và mô tả */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            <RoomInfo
              listing={listingData}
              amenitiesList={amenitiesList}
              services={services}
              selectedServiceIds={selectedServiceIds}
              setSelectedServiceIds={setSelectedServiceIds}
              safetyFeatures={safetyFeatures}
            />
          </div>
          {/* Booking Form ngoài cùng bên phải */}
          <div className="hidden lg:flex flex-col items-end lg:col-span-4">
            <BookingForm
              listing={listingData}
              checkIn={checkIn}
              checkOut={checkOut}
              setCheckIn={setCheckIn}
              setCheckOut={setCheckOut}
              nights={nights}
              setNights={setNights}
              guests={guests}
              setGuests={setGuests}
              bookedDates={bookedDates}
              dateOpen={dateOpen}
              setDateOpen={setDateOpen}
              guestOpen={guestOpen}
              setGuestOpen={setGuestOpen}
              selectedServiceIds={selectedServiceIds}
              services={services}
            />
          </div>
        </div>

        {/* Đánh giá của khách */}
        <RoomReviews roomId={id || ""} />

        {/* Google Map */}
        {/* <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold mb-4">Nơi bạn sẽ đến</h2>
          <SearchableGoogleMap lat={listing.lat} lng={listing.lng} />
        </div> */}
      </div>
    </div>
  );
}
