import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  fetchListings,
  fetchListingsByAvailability,
} from "@/store/slices/listingSlice";
import {
  selectListings,
  selectTopViewedListings,
  selectTopRatedListings,
  selectTopWishlistListings,
} from "@/store/slices/listingSlice";
import {
  fetchPropertyLocations,
  selectPropertyLocations,
} from "@/store/slices/propertySlice";
import type { DateRange } from "react-day-picker";
import type { ListingSearchParams } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function useClientSearchLogic() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [googleSuggestions, setGoogleSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const totalGuests = adults + children;
  const [minBeds, setMinBeds] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get listings from Redux store
  const listings = useSelector(selectListings);
  const topViewedListings = useSelector(selectTopViewedListings);
  const topRatedListings = useSelector(selectTopRatedListings);
  const topWishlistListings = useSelector(selectTopWishlistListings);

  // Get property locations from Redux store
  const propertyLocations = useSelector(selectPropertyLocations);

  // Fetch listings and property locations data on component mount
  React.useEffect(() => {
    if (listings.length === 0) {
      dispatch(fetchListings({ limit: 100 }));
    }
    if (propertyLocations.length === 0) {
      dispatch(fetchPropertyLocations());
    }
  }, [dispatch, listings.length, propertyLocations.length]);

  // Combine property locations with existing suggested locations
  const suggestedLocations = useMemo(() => {
    // Convert property locations to the format expected by the UI
    const formattedLocations = propertyLocations.map((prop) => ({
      name: prop.location.city || prop.location.address || prop.name,
      description:
        `${prop.location.district || ""} ${prop.location.ward || ""}`.trim() ||
        `${prop.name} - Địa điểm nổi bật`,
      icon: "🏠",
      color: "bg-blue-100 dark:bg-blue-900",
      lat: prop.location.lat,
      lng: prop.location.lng,
      placeId: prop.location.place_id,
    }));

    // Return only property locations - increased limit to show more
    return formattedLocations.slice(0, 50);
  }, [propertyLocations]);

  // Xử lý khi chọn địa điểm từ Google Places
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setSelectedPlace(place);
      setLocation(place.formatted_address || place.name || "");
      setActiveSection(null); // Đóng Popover khi chọn gợi ý
    }
  };

  // Lấy gợi ý từ Google Places API
  const getGoogleSuggestions = useCallback(async (input: string) => {
    if (!window.google) return;

    // Only show Google suggestions when there's actual input
    const searchInput = input.trim();
    if (!searchInput) {
      setGoogleSuggestions([]);
      return;
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: searchInput,
        componentRestrictions: { country: "vn" }, // Giới hạn cho Việt Nam
        types: ["geocode", "establishment"],
      };

      service.getPlacePredictions(request, (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setGoogleSuggestions(predictions.slice(0, 10)); // Limit to 10 Google suggestions
        } else {
          setGoogleSuggestions([]);
        }
      });
    } catch (error) {
      console.error("Error fetching Google suggestions:", error);
      setGoogleSuggestions([]);
    }
  }, []);

  // Lọc gợi ý dựa trên input của người dùng
  const filteredSuggestions = useMemo(() => {
    if (!location.trim()) {
      return suggestedLocations;
    }

    const searchTerm = location.toLowerCase();
    return suggestedLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(searchTerm) ||
        loc.description.toLowerCase().includes(searchTerm)
    );
  }, [suggestedLocations, location]);

  // Function to trigger Google suggestions when input is focused - only if there's input
  const triggerGoogleSuggestions = useCallback(() => {
    if (window.google && location.trim()) {
      getGoogleSuggestions(location);
    } else {
      setGoogleSuggestions([]);
    }
  }, [location, getGoogleSuggestions]);

  // Kết hợp gợi ý từ database và Google
  const allSuggestions = useMemo(() => {
    const googleSuggestionsFormatted: Array<{
      name: string;
      description: string;
      icon: string;
      color: string;
      isGoogle: boolean;
      placeId: string;
    }> = googleSuggestions.map((prediction) => ({
      name: prediction.description,
      description:
        prediction.structured_formatting?.secondary_text ||
        "Địa điểm từ Google",
      icon: "🔍",
      color: "bg-purple-100 dark:bg-purple-900",
      isGoogle: true,
      placeId: prediction.place_id,
    }));

    return [...filteredSuggestions, ...googleSuggestionsFormatted];
  }, [filteredSuggestions, googleSuggestions]);

  // Hàm kiểm tra input có phải lat,lng không
  function isLatLng(str: string) {
    const regex = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/;
    return regex.test(str);
  }

  const handleSearch = () => {
    const params: Record<string, unknown> = {};
    if (selectedPlace && selectedPlace.place_id) {
      params.place_id = selectedPlace.place_id;
      params.fuzzy_place_search = true;
    } else if (isLatLng(location)) {
      const [lat, lng] = location.split(",").map(Number);
      params.lat = lat;
      params.lng = lng;
    } else if (location) {
      params.locationKeyword = location;
    }
    if (totalGuests > 0) params.guests = totalGuests;
    if (date?.from) params.checkInDate = format(date.from, "yyyy-MM-dd");
    if (date?.to) params.checkOutDate = format(date.to, "yyyy-MM-dd");
    if (minBeds > 0) params.min_beds = minBeds;
    if (minBathrooms > 0) params.min_bathrooms = minBathrooms;

    // Nếu có đủ ngày, guests, minBeds, minBathrooms thì gọi API availability
    if (
      params.checkInDate &&
      params.checkOutDate &&
      params.guests &&
      params.min_beds &&
      params.min_bathrooms
    ) {
      dispatch(
        fetchListingsByAvailability({
          checkInDate: params.checkInDate as string,
          checkOutDate: params.checkOutDate as string,
          guests: params.guests as number,
          min_beds: params.min_beds as number,
          min_bathrooms: params.min_bathrooms as number,
          locationKeyword: params.locationKeyword as string,
          place_id: params.place_id as string,
          lat: params.lat as number,
          lng: params.lng as number,
        })
      );
    } else {
      dispatch(fetchListings(params as ListingSearchParams));
    }
    setActiveSection(null); // Đóng Popover khi nhấn tìm kiếm

    // Tạo URL params để truyền thông tin tìm kiếm
    const searchParams = new URLSearchParams();
    if (params.locationKeyword)
      searchParams.set("locationKeyword", params.locationKeyword as string);
    if (params.place_id)
      searchParams.set("place_id", params.place_id as string);
    if (params.lat) searchParams.set("lat", params.lat as string);
    if (params.lng) searchParams.set("lng", params.lng as string);
    if (params.checkInDate)
      searchParams.set("checkInDate", params.checkInDate as string);
    if (params.checkOutDate)
      searchParams.set("checkOutDate", params.checkOutDate as string);
    if (params.guests) searchParams.set("guests", params.guests as string);
    if (params.min_beds)
      searchParams.set("min_beds", params.min_beds as string);
    if (params.min_bathrooms)
      searchParams.set("min_bathrooms", params.min_bathrooms as string);

    navigate(`/search?${searchParams.toString()}`);
  };

  return {
    activeSection,
    setActiveSection,
    location,
    setLocation,
    selectedPlace,
    setSelectedPlace,
    autocomplete,
    setAutocomplete,
    googleSuggestions,
    setGoogleSuggestions,
    date,
    setDate,
    adults,
    setAdults,
    children,
    setChildren,
    infants,
    setInfants,
    totalGuests,
    onPlaceChanged,
    getGoogleSuggestions,
    triggerGoogleSuggestions,
    allSuggestions,
    handleSearch,
    minBeds,
    setMinBeds,
    minBathrooms,
    setMinBathrooms,
  };
}
