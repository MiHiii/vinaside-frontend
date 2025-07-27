import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchListingById,
  incrementViewCount,
} from "@/store/slices/listingSlice";
import { IListing } from "@/types/listing";
import { fetchAmenities, selectAmenities } from "@/store/slices/amenitySlice";
import { fetchServices } from "@/store/slices/serviceSlice";
import { fetchSafetyFeatures } from "@/store/slices/safetyFeatureSlice";
import { fetchHouseRules } from "@/store/slices/houseRuleSlice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// UI & Components
import GallerySection from "@/components/roomdetail/GallerySection";
import RoomInfo from "@/components/roomdetail/RoomInfo";
import BookingForm from "@/components/roomdetail/BookingForm";
import { useBookedDates } from "@/hooks/useBookedDates";
import RoomReviews from "@/components/roomdetail/RoomReviews";
import ButtonWishlist from "@/components/common/ButtonWishlist";
import SearchableGoogleMap from "@/components/roomdetail/RoomMap";
import Propertie from "@/components/roomdetail/Propertie";

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
  // Thay selectedServiceIds bằng selectedServices
  const [selectedServices, setSelectedServices] = useState<
    {
      service_id: string;
      service_name: string;
      service_price: number;
      quantity: number;
      total_price: number;
    }[]
  >([]);

  const amenitiesList = useAppSelector(selectAmenities);
  const services = useAppSelector((state) => state.service.services);
  const safetyFeatures = useAppSelector(
    (state) => state.safetyFeature.safetyFeatures
  );

  // Hàm xử lý chọn dịch vụ (có thể truyền xuống RoomInfo)
  const handleSelectService = (service: any, quantity: number) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.service_id === service.service_id);
      if (exists) {
        return prev.map((s) =>
          s.service_id === service.service_id
            ? { ...s, quantity, total_price: service.service_price * quantity }
            : s
        );
      }
      return [
        ...prev,
        {
          ...service,
          quantity,
          total_price: service.service_price * quantity,
        },
      ];
    });
  };

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

  // Hiển thị toast error nếu có lỗi
  useEffect(() => {
    if (error) {
      toast.error(error, {
        style: { color: "#dc2626" },
      });
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Skeleton cho tiêu đề */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>

          {/* Skeleton cho gallery */}
          <div className="mb-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>

          {/* Skeleton cho layout chính */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            <div className="lg:col-span-8 space-y-6 lg:space-y-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="hidden lg:flex flex-col items-end lg:col-span-4">
              <Skeleton className="h-[500px] w-[360px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // Dữ liệu phòng đã được lấy
  const listingData: IListing = listing as IListing;

  console.log("Listing data:", listingData.propertyId);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tiêu đề & nút chia sẻ/lưu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {listingData.propertyId?.name}
            </h1>
          </div>
          <div className="sm:flex items-center flex-shrink-0 underline relative">
            <ButtonWishlist
              className="static top-0 right-0"
              liked={false}
              roomId={listingData._id}
            />
            <span className="hidden lg:inline">Lưu</span>
          </div>
        </div>

        {/* Lưới bố cục các phần */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-3 items-start">
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
              selectedServices={selectedServices}
              setSelectedServices={setSelectedServices}
              safetyFeatures={safetyFeatures}
            />
          </div>
          {/* Booking Form ngoài cùng bên phải */}
          <div className="hidden lg:flex flex-col items-end lg:col-span-4 sticky top-6">
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
              selectedServices={selectedServices}
              services={services}
            />
          </div>
        </div>

        {/* Đánh giá của khách */}
        <RoomReviews roomId={id || ""} />
        <div className="mt-10 border-t border-gray-200 pt-8">
          <Propertie propertyId={listingData.propertyId?._id} />
        </div>
        {/* Google Map */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold mb-4">Nơi bạn sẽ đến</h2>
          {listingData.propertyId?.location && (
            <SearchableGoogleMap
              lat={listingData.propertyId.location.lat}
              lng={listingData.propertyId.location.lng}
            />
          )}
        </div>
      </div>
    </div>
  );
}
