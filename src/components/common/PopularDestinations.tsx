import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPropertyLocations,
  selectPropertyLocations,
  selectPropertyLocationsLoading,
  fetchPropertyRoomsList,
} from "@/store/slices/propertySlice";
import type { RootState } from "@/store";

interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  propertyCount: number;
}

interface PopularDestinationsProps {
  title?: string;
  destinations?: Destination[];
}

export default function PopularDestinations({
  title = "Những điểm dừng chân được yêu thích nhất",
  destinations,
}: PopularDestinationsProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const propertyLocations = useSelector(selectPropertyLocations);
  const loading = useSelector(selectPropertyLocationsLoading);

  useEffect(() => {
    dispatch(fetchPropertyLocations());
  }, [dispatch]);

  // Chuyển đổi dữ liệu từ API thành format Destination
  const apiDestinations: Destination[] = React.useMemo(() => {
    if (!propertyLocations || propertyLocations.length === 0) return [];

    // Nhóm properties theo city
    const cityGroups: { [city: string]: any[] } = {};
    propertyLocations.forEach((property: any) => {
      const city = property.location?.city || "Unknown";
      if (!cityGroups[city]) {
        cityGroups[city] = [];
      }
      cityGroups[city].push(property);
    });

    // Chuyển đổi thành destinations
    const destinations: Destination[] = Object.entries(cityGroups)
      .slice(0, 5) // Chỉ lấy 5 thành phố đầu tiên
      .map(([city, properties], index) => {
        const firstProperty = properties[0];
        return {
          id: `h${index + 1}`,
          name: city,
          image:
            firstProperty.thumbnail ||
            firstProperty.images?.[0] ||
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          description:
            firstProperty.description ||
            `Khám phá ${city} với nhiều điểm đến hấp dẫn`,
          propertyCount: properties.length,
        };
      });

    return destinations;
  }, [propertyLocations]);

  const handleDestinationClick = async (destination: Destination) => {
    try {
      // Tìm property đầu tiên của thành phố này
      const cityProperties = propertyLocations.filter(
        (property: any) => property.location?.city === destination.name
      );

      if (cityProperties.length > 0) {
        const firstProperty = cityProperties[0];
        // Thử lấy _id trước, nếu không có thì dùng id
        const propertyId = firstProperty._id || firstProperty.id;

        if (!propertyId) {
          console.error("No property ID found for:", firstProperty);
          // Fallback: navigate với locationKeyword
          navigate(
            `/search?locationKeyword=${encodeURIComponent(destination.name)}`
          );
          return;
        }

        // Fetch rooms của property này
        await dispatch(fetchPropertyRoomsList(propertyId));

        // Navigate to search page với propertyId
        navigate(
          `/search?propertyId=${propertyId}&locationKeyword=${encodeURIComponent(
            destination.name
          )}`
        );
      } else {
        // Fallback: navigate với locationKeyword nếu không tìm thấy property
        navigate(
          `/search?locationKeyword=${encodeURIComponent(destination.name)}`
        );
      }
    } catch (error) {
      console.error("Error fetching property rooms:", error);
      // Fallback: navigate với locationKeyword
      navigate(
        `/search?locationKeyword=${encodeURIComponent(destination.name)}`
      );
    }
  };

  // Sử dụng destinations từ API hoặc props
  const finalDestinations = destinations || apiDestinations;

  // Chỉ hiển thị component khi có dữ liệu hoặc đang loading
  if (!loading && finalDestinations.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-medium text-card-foreground mb-6">{title}</h2>

      {loading ? (
        <div
          className="popular-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gridTemplateRows: "auto auto",
            gap: "1rem",
            gridTemplateAreas: `
              "h1 h1 h1 h2 h2 h2"
              "h3 h3 h4 h4 h5 h5"
            `,
          }}
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const gridAreaMap: { [key: string]: string } = {
              h1: "h1",
              h2: "h2",
              h3: "h3",
              h4: "h4",
              h5: "h5",
            };

            return (
              <Skeleton
                key={index}
                className="h-74 rounded-2xl"
                style={{
                  gridArea: gridAreaMap[`h${index + 1}`],
                }}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="popular-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gridTemplateRows: "auto auto",
            gap: "1rem",
            gridTemplateAreas: `
              "h1 h1 h1 h2 h2 h2"
              "h3 h3 h4 h4 h5 h5"
            `,
          }}
        >
          {finalDestinations.map((destination) => {
            // Map destination IDs to grid areas
            const gridAreaMap: { [key: string]: string } = {
              h1: "h1",
              h2: "h2",
              h3: "h3",
              h4: "h4",
              h5: "h5",
              h6: "h6",
            };

            return (
              <Card
                key={destination.id}
                className="relative h-74 rounded-2xl overflow-hidden cursor-pointer border-none hover:border-2 hover:border-red-400 hover:shadow-lg transition-all duration-300"
                style={{ gridArea: gridAreaMap[destination.id] }}
                onClick={() => handleDestinationClick(destination)}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full border-none object-cover transition-all duration-300"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/0 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full p-4">
                  {/* Flag Icon */}
                  <div className="text-white">
                    <h3 className="font-semibold text-lg mb-1">
                      {destination.name}
                    </h3>
                  </div>
                  {/* <div className="absolute top-3 right-3">
                    <img
                      src="https://images.baodantoc.vn/uploads/2022/Th%C3%A1ng%208/Ng%C3%A0y_31/Nga/quockyvietnam-copy-7814.jpg"
                      alt="Quốc kỳ Việt Nam"
                      className="w-8 h-6 rounded-sm object-cover shadow-sm"
                    />
                  </div> */}

                  {/* Destination Info */}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
