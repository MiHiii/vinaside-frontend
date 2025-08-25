import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom"; // Assuming react-router-dom is used for navigation
import { useAppSelector } from "@/hooks/useRedux"; // Assuming this hook exists
import { Listing } from "@/types/listing"; // Assuming this type exists
import {
  selectListings,
  selectListingsLoading,
  selectListingsError,
  fetchListings,
  fetchListingsByAvailability,
} from "@/store/slices/listingSlice"; // Assuming these Redux selectors exist
import {
  selectPropertyLocations,
  selectPropertyRoomsList,
  selectPropertyRoomsListLoading,
  selectPropertyRoomsListError,
  fetchPropertyRoomsList,
} from "@/store/slices/propertySlice";
import { useAppDispatch } from "@/hooks/useRedux";
import ButtonWishlist from "@/components/common/ButtonWishlist"; // Assuming this component exists
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Ensure Button is imported

// Helper function để lấy city từ property
function getPropertyCity(property: Listing): string | null {
  if (
    typeof property.propertyId === "object" &&
    property.propertyId?.location?.city
  ) {
    return property.propertyId.location.city;
  }
  return null;
}

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Lấy kết quả từ Redux
  const listings = useAppSelector(selectListings);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);
  const propertyLocations = useAppSelector(selectPropertyLocations);

  // Lấy rooms từ property
  const propertyRooms = useAppSelector(selectPropertyRoomsList);
  const propertyRoomsLoading = useAppSelector(selectPropertyRoomsListLoading);
  const propertyRoomsError = useAppSelector(selectPropertyRoomsListError);

  // Lấy thông tin tìm kiếm từ URL params
  const searchParams = new URLSearchParams(location.search);
  const locationKeyword = searchParams.get("locationKeyword");
  const propertyId = searchParams.get("propertyId");
  const place_id = searchParams.get("place_id");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const guests = searchParams.get("guests");
  const min_beds = searchParams.get("min_beds");
  const min_bathrooms = searchParams.get("min_bathrooms");
  const sortBy = searchParams.get("sortBy");

  // Fetch rooms nếu có propertyId
  React.useEffect(() => {
    if (propertyId) {
      dispatch(fetchPropertyRoomsList(propertyId));
    }
  }, [propertyId, dispatch]);

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
    if (sortBy) {
      switch (sortBy) {
        case "views":
          parts.push("Sắp xếp theo lượt xem");
          break;
        case "rating":
          parts.push("Sắp xếp theo đánh giá");
          break;
        case "wishlist":
          parts.push("Sắp xếp theo yêu thích");
          break;
        default:
          parts.push(`Sắp xếp theo ${sortBy}`);
      }
    }
    return parts.join(" • ");
  };

  // Kiểm tra có thông số tìm kiếm nào không (không bao gồm sortBy vì sortBy có thể đứng riêng)
  const hasSearchCriteria =
    propertyId ||
    locationKeyword ||
    place_id ||
    (lat && lng) ||
    checkInDate ||
    guests ||
    min_beds ||
    min_bathrooms;

  // Fetch tất cả listings nếu không có search criteria và không có sortBy (click vào "Khám phá tất cả phòng nghỉ tại Vinaside")
  React.useEffect(() => {
    if (!hasSearchCriteria && !sortBy) {
      dispatch(fetchListings({}));
    }
  }, [hasSearchCriteria, sortBy, dispatch]);

  // Fetch listings chỉ với sortBy (click vào các section top listings)
  React.useEffect(() => {
    if (sortBy && !hasSearchCriteria && !propertyId) {
      dispatch(fetchListings({ sortBy }));
    }
  }, [sortBy, hasSearchCriteria, propertyId, dispatch]);

  // Fetch listings với search criteria
  React.useEffect(() => {
    if (hasSearchCriteria && !propertyId) {
      // Kiểm tra xem có availability criteria không (checkInDate, checkOutDate, guests)
      const hasAvailabilityCriteria = checkInDate && checkOutDate && guests;

      if (hasAvailabilityCriteria) {
        // Sử dụng fetchListingsByAvailability cho search với availability
        const availabilityParams: any = {
          checkInDate,
          checkOutDate,
          guests: parseInt(guests),
        };

        if (locationKeyword) {
          availabilityParams.locationKeyword = locationKeyword;
        }
        if (place_id) {
          availabilityParams.place_id = place_id;
        }
        if (lat && lng) {
          availabilityParams.lat = parseFloat(lat);
          availabilityParams.lng = parseFloat(lng);
        }
        if (min_beds) {
          availabilityParams.min_beds = parseInt(min_beds);
        }
        if (min_bathrooms) {
          availabilityParams.min_bathrooms = parseInt(min_bathrooms);
        }
        if (sortBy) {
          availabilityParams.sortBy = sortBy;
        }

        dispatch(fetchListingsByAvailability(availabilityParams));
      } else {
        // Sử dụng fetchListings cho search thông thường
        const searchParams: any = {};

        if (locationKeyword) {
          searchParams.locationKeyword = locationKeyword;
        }
        if (place_id) {
          searchParams.place_id = place_id;
        }
        if (lat && lng) {
          searchParams.lat = parseFloat(lat);
          searchParams.lng = parseFloat(lng);
        }
        if (checkInDate) {
          searchParams.checkInDate = checkInDate;
        }
        if (checkOutDate) {
          searchParams.checkOutDate = checkOutDate;
        }
        if (guests) {
          searchParams.guests = parseInt(guests);
        }
        if (min_beds) {
          searchParams.min_beds = parseInt(min_beds);
        }
        if (min_bathrooms) {
          searchParams.min_bathrooms = parseInt(min_bathrooms);
        }
        if (sortBy) {
          searchParams.sortBy = sortBy;
        }

        dispatch(fetchListings(searchParams));
      }
    }
  }, [
    hasSearchCriteria,
    propertyId,
    locationKeyword,
    place_id,
    lat,
    lng,
    checkInDate,
    checkOutDate,
    guests,
    min_beds,
    min_bathrooms,
    sortBy,
    dispatch,
  ]);

  // Quyết định hiển thị listings hay property rooms
  const shouldShowPropertyRooms = propertyId && propertyRooms.length > 0;
  const displayListings = shouldShowPropertyRooms ? propertyRooms : listings;
  const displayLoading = shouldShowPropertyRooms
    ? propertyRoomsLoading
    : loading;
  const displayError = shouldShowPropertyRooms ? propertyRoomsError : error;

  // Lấy tọa độ cho bản đồ
  const getMapCoordinates = () => {
    // Nếu có lat/lng từ URL params
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Nếu có locationKeyword, thử tìm trong property locations
    if (locationKeyword && propertyLocations.length > 0) {
      const matchingLocation = propertyLocations.find(
        (prop) =>
          prop.location.city
            ?.toLowerCase()
            .includes(locationKeyword.toLowerCase()) ||
          prop.location.address
            ?.toLowerCase()
            .includes(locationKeyword.toLowerCase()) ||
          prop.location.district
            ?.toLowerCase()
            .includes(locationKeyword.toLowerCase())
      );
      if (matchingLocation) {
        return {
          lat: matchingLocation.location.lat,
          lng: matchingLocation.location.lng,
        };
      }
    }

    // Nếu có place_id, thử tìm trong property locations
    if (place_id && propertyLocations.length > 0) {
      const matchingLocation = propertyLocations.find(
        (prop) => prop.location.place_id === place_id
      );
      if (matchingLocation) {
        return {
          lat: matchingLocation.location.lat,
          lng: matchingLocation.location.lng,
        };
      }
    }

    // Nếu vẫn không có, thử lấy từ property locations đầu tiên
    if (propertyLocations.length > 0) {
      const firstLocation = propertyLocations[0];
      return {
        lat: firstLocation.location.lat,
        lng: firstLocation.location.lng,
      };
    }

    // Fallback về tọa độ mặc định của Việt Nam (Hà Nội)
    return { lat: 21.0285, lng: 105.8542 };
  };

  const mapCoords = getMapCoordinates();
  const mapSrc = `https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&output=embed`;

  return (
    <div className="flex flex-col xl:flex-row w-full max-w-[1550px] mx-auto p-3 sm:p-4 lg:p-6 xl:p-8 gap-4 lg:gap-6 xl:gap-8">
      {/* Cột bên trái - Danh sách phòng dạng grid */}
      <div className="flex-1 order-2 xl:order-1 min-w-0">
        {/* Header với thông tin tìm kiếm */}
        <div className="mb-4 lg:mb-6">
          <div className="text-sm lg:text-base font-semibold text-muted-foreground">
            {(() => {
              // Nếu chỉ có sortBy (click vào các section top listings)
              if (sortBy && !hasSearchCriteria) {
                let sortText = "";
                switch (sortBy) {
                  case "views":
                    sortText = "phòng được xem nhiều nhất";
                    break;
                  case "rating":
                    sortText = "phòng được đánh giá cao nhất";
                    break;
                  case "wishlist":
                    sortText = "phòng được yêu thích nhất";
                    break;
                  default:
                    sortText = "phòng nghỉ";
                }
                return `Có ${displayListings.length} ${sortText} tại Vinaside`;
              }

              // Nếu không có search criteria (click vào "Khám phá tất cả phòng nghỉ tại Vinaside")
              if (!hasSearchCriteria) {
                return `Có ${displayListings.length} phòng nghỉ tại Vinaside`;
              }

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
              if (!location && displayListings.length > 0) {
                const firstProperty = displayListings[0] as any;
                if (firstProperty.address) {
                  // Lấy phần cuối của address (thường là thành phố)
                  const addressParts = firstProperty.address
                    .split(",")
                    .map((part: string) => part.trim());
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

              return `Có ${displayListings.length} phòng ở tại ${location}`;
            })()}
          </div>
          {(hasSearchCriteria || sortBy) && (
            <p className="text-muted-foreground mt-1 text-xs lg:text-sm">
              {getSearchDescription()}
            </p>
          )}
        </div>

        {/* Kết quả tìm kiếm dạng grid giống homepage */}
        <div className="mb-8">
          {displayLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-full">
                  <Skeleton className="h-[200px] sm:h-[220px] w-full rounded-2xl mb-2" />
                  <div className="p-3 pb-2">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {displayError && (
            <div className="text-center py-8 lg:py-12">
              <p className="text-red-500 text-lg">{displayError}</p>
              <p className="text-muted-foreground mt-2">
                Vui lòng thử lại với tiêu chí tìm kiếm khác
              </p>
            </div>
          )}

          {!displayLoading && !displayError && displayListings.length === 0 && (
            <div className="text-center py-12 lg:py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl lg:text-2xl font-semibold text-card-foreground mb-2">
                Không tìm thấy kết quả phù hợp
              </h3>
              <p className="text-muted-foreground mb-4 lg:mb-6">
                Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn
              </p>
              <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
            </div>
          )}

          {!displayLoading && !displayError && displayListings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3 lg:gap-4">
              {displayListings.map((property: any) => (
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
      <div className="mt-10 lg:mt-8 xl:mt-10 hidden xl:block w-full xl:w-[460px] 2xl:w-[690px] flex-shrink-0 order-1 xl:order-2">
        <div className="w-full h-[600px] lg:h-[700px] xl:h-[750px] rounded-2xl overflow-hidden sticky top-4">
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
    : `/placeholder.svg?height=200&width=300&query=property%20image%20of%20${property.title}`; // Fallback to placeholder

  // Lấy city từ property
  const city = getPropertyCity(property);

  return (
    <Card
      onClick={() => onViewDetail(property._id)}
      className="w-full rounded-xl bg-card border-none hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="relative">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={property.title}
          className="h-[180px] sm:h-[200px] lg:h-[220px] w-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
        />
        {/* Assuming ButtonWishlist is a client component and handles its own state */}
        <ButtonWishlist liked={property.is_wishlisted} roomId={property._id} />
      </div>
      <CardContent className="p-3 pb-2">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-medium text-sm sm:text-[15px] leading-tight line-clamp-2 text-card-foreground flex-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-card-foreground flex-shrink-0">
            <span>★</span>
            <span>{property.average_rating?.toFixed(1) ?? "--"}</span>
          </div>
        </div>
        {/* Hiển thị city nếu có */}
        {city && (
          <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">
            {city}
          </div>
        )}
        <div className="text-xs sm:text-sm text-gray-500 text-muted-foreground font-medium">
          {property.price_per_night?.toLocaleString()}₫ /đêm
        </div>
      </CardContent>
    </Card>
  );
}
