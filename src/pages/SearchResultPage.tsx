import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom"; // Assuming react-router-dom is used for navigation
import { useAppSelector } from "@/hooks/useRedux"; // Assuming this hook exists
import { Listing } from "@/types/listing"; // Assuming this type exists
import {
  selectListings,
  selectListingsLoading,
  selectListingsError,
} from "@/store/slices/listingSlice"; // Assuming these Redux selectors exist
import ButtonWishlist from "@/components/common/ButtonWishlist"; // Assuming this component exists
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Ensure Button is imported
import { MapPin, Calendar, Users, Bed, Bath } from "lucide-react";

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy kết quả từ Redux
  const listings = useAppSelector(selectListings);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);

  // Lấy thông tin tìm kiếm từ URL params
  const searchParams = new URLSearchParams(location.search);
  const locationKeyword = searchParams.get("locationKeyword");
  const place_id = searchParams.get("place_id");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const guests = searchParams.get("guests");
  const min_beds = searchParams.get("min_beds");
  const min_bathrooms = searchParams.get("min_bathrooms");

  const handleViewDetail = async (id: string) => {
    navigate(`/list/${id}`);
  };

  // Tạo mô tả tìm kiếm
  const getSearchDescription = () => {
    const parts = [];
    if (locationKeyword) {
      parts.push(`Địa điểm: ${locationKeyword}`);
    } else if (place_id) {
      parts.push("Địa điểm đã chọn");
    } else if (lat && lng) {
      parts.push("Vị trí theo tọa độ");
    }
    if (checkInDate && checkOutDate) {
      parts.push(`Từ ${checkInDate} đến ${checkOutDate}`);
    }
    if (guests) {
      parts.push(`${guests} khách`);
    }
    if (min_beds) {
      parts.push(`${min_beds} giường`);
    }
    if (min_bathrooms) {
      parts.push(`${min_bathrooms} phòng tắm`);
    }
    return parts.join(" • ");
  };

  // Kiểm tra có thông số tìm kiếm nào không
  const hasSearchCriteria =
    locationKeyword ||
    place_id ||
    (lat && lng) ||
    checkInDate ||
    guests ||
    min_beds ||
    min_bathrooms;

  // Lấy tọa độ cho bản đồ
  const getMapCoordinates = () => {
    // Nếu có lat/lng từ URL params
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Nếu có locationKeyword, thử lấy từ property đầu tiên có địa chỉ
    if (locationKeyword && listings.length > 0) {
      const firstProperty = listings[0];
      if (
        firstProperty.propertyId &&
        typeof firstProperty.propertyId === "object" &&
        "location" in firstProperty.propertyId
      ) {
        const propLocation = (firstProperty.propertyId as any).location;
        if (propLocation && propLocation.lat && propLocation.lng) {
          return { lat: propLocation.lat, lng: propLocation.lng };
        }
      }
    }

    // Nếu có place_id, thử lấy từ property data
    if (place_id && listings.length > 0) {
      const firstProperty = listings[0];
      if (
        firstProperty.propertyId &&
        typeof firstProperty.propertyId === "object" &&
        "location" in firstProperty.propertyId
      ) {
        const propLocation = (firstProperty.propertyId as any).location;
        if (propLocation && propLocation.lat && propLocation.lng) {
          return { lat: propLocation.lat, lng: propLocation.lng };
        }
      }
    }

    // Nếu vẫn không có, thử lấy từ bất kỳ property nào có tọa độ
    if (listings.length > 0) {
      for (const listing of listings) {
        if (
          listing.propertyId &&
          typeof listing.propertyId === "object" &&
          "location" in listing.propertyId
        ) {
          const propLocation = (listing.propertyId as any).location;
          if (propLocation && propLocation.lat && propLocation.lng) {
            return { lat: propLocation.lat, lng: propLocation.lng };
          }
        }
      }
    }

    // Fallback về tọa độ mặc định của Việt Nam (Hà Nội)
    return { lat: 21.0285, lng: 105.8542 };
  };

  const mapCoords = getMapCoordinates();
  const mapSrc = `https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&output=embed`;

  return (
    <div className="flex flex-col lg:flex-row w-full p-4 lg:p-10 gap-4 lg:gap-10">
      {/* Cột bên trái - Danh sách phòng dạng grid */}
      <div className="flex-1 order-2 lg:order-1">
        {/* Header với thông tin tìm kiếm */}
        <div className="mb-6 lg:mb-8">
          <div className="text-sm font-semibold text-muted-foreground">
            {(() => {
              // Ưu tiên lấy vị trí từ URL params trước
              let location = locationKeyword;

              // Nếu không có locationKeyword, thử lấy từ place_id
              if (!location && place_id) {
                location = "Địa điểm đã chọn";
              }

              // Nếu không có place_id, thử lấy từ tọa độ
              if (!location && lat && lng) {
                location = "Vị trí theo tọa độ";
              }

              // Nếu vẫn không có, thử lấy từ property đầu tiên
              if (!location && listings.length > 0) {
                const firstProperty = listings[0];
                if (firstProperty.address) {
                  // Lấy phần cuối của address (thường là thành phố)
                  const addressParts = firstProperty.address
                    .split(",")
                    .map((part) => part.trim());
                  location =
                    addressParts[addressParts.length - 1] || addressParts[0];
                } else if (
                  firstProperty.propertyId &&
                  typeof firstProperty.propertyId === "object" &&
                  "location" in firstProperty.propertyId
                ) {
                  // Thử lấy từ propertyId.location
                  const propLocation = (firstProperty.propertyId as any)
                    .location;
                  if (propLocation) {
                    location =
                      propLocation.city ||
                      propLocation.address ||
                      "Địa điểm này";
                  }
                }
              }

              // Fallback cuối cùng
              if (!location) {
                location = "địa điểm này";
              }

              return `Có ${listings.length} phòng ở tại ${location}`;
            })()}
          </div>
          {hasSearchCriteria && (
            <p className="text-muted-foreground mt-1">
              {getSearchDescription()}
            </p>
          )}
        </div>

        {/* Kết quả tìm kiếm dạng grid giống homepage */}
        <div className="mb-8">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="min-w-[280px] max-w-[280px]">
                  <Skeleton className="h-[220px] w-full rounded-2xl mb-2" />
                  <div className="p-3 pb-2">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">{error}</p>
              <p className="text-muted-foreground mt-2">
                Vui lòng thử lại với tiêu chí tìm kiếm khác
              </p>
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Không tìm thấy kết quả phù hợp
              </h3>
              <p className="text-muted-foreground mb-4">
                Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn
              </p>
              <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {listings.map((property: Listing) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cột bên phải - Bản đồ (ẩn trên mobile) */}
      <div className="hidden lg:block w-[45%] flex-shrink-0 order-1 lg:order-2">
        <div className="w-full h-[770px] rounded-2xl overflow-hidden">
          <iframe
            title="Google Map"
            src={mapSrc}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

type PropertyCardProps = {
  property: Listing;
  onViewDetail: (id: string) => void;
};

// Dùng lại PropertyCard dạng grid giống homepage
function PropertyCard({ property, onViewDetail }: PropertyCardProps) {
  const imageUrl = property.images?.[0]?.startsWith("http")
    ? property.images[0]
    : `/placeholder.svg?height=220&width=280&query=property%20image%20of%20${property.title}`; // Fallback to placeholder
  return (
    <Card
      onClick={() => onViewDetail(property._id)}
      className="min-w-[280px] max-w-[280px] rounded-xl bg-card border-none hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={property.title}
          className="h-[220px] w-full object-cover rounded-2xl"
        />
        {/* Assuming ButtonWishlist is a client component and handles its own state */}
        <ButtonWishlist liked={property.is_wishlisted} roomId={property._id} />
      </div>
      <CardContent className="p-3 pb-2">
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3 className="font-medium text-[15px] truncate text-card-foreground">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium text-card-foreground">
            <span>★</span>
            <span>{property.average_rating?.toFixed(1) ?? "--"}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 text-muted-foreground font-medium mb-1">
          {property.price_per_night?.toLocaleString()}₫ /đêm
        </div>
      </CardContent>
    </Card>
  );
}
