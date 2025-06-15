import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Navigation, X, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Fix Leaflet default markers - safer approach
const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Set the default icon
L.Marker.prototype.options.icon = DefaultIcon;

// Custom red marker for Airbnb style
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FF385C"/>
      <circle cx="16" cy="16" r="12" fill="white"/>
      <circle cx="16" cy="16" r="8" fill="#FF385C"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map clicks
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (latlng: LatLngExpression) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export default function Location() {
  const [position, setPosition] = useState<LatLngExpression>([
    21.0285, 105.8542,
  ]); // Hanoi coordinates
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: LatLngExpression = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setPosition(newPos);
          if (mapRef.current) {
            mapRef.current.setView(newPos, 15);
          }
          reverseGeocode(newPos);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setAddress("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (coords: LatLngExpression) => {
    try {
      const [lat, lng] = Array.isArray(coords)
        ? coords
        : [coords.lat, coords.lng];
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Search for addresses using Nominatim API
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", Vietnam"
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle address input change with debouncing
  const handleAddressChange = (value: string) => {
    setAddress(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const newPos: LatLngExpression = [
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
    ];
    setPosition(newPos);
    setAddress(suggestion.display_name);
    setShowSuggestions(false);
    if (mapRef.current) {
      mapRef.current.setView(newPos, 15);
    }
  };

  // Handle marker drag
  const handleMarkerDrag = (e: L.LeafletEvent) => {
    const marker = e.target;
    const newPos: LatLngExpression = [
      marker.getLatLng().lat,
      marker.getLatLng().lng,
    ];
    setPosition(newPos);
    reverseGeocode(newPos);
  };

  // Handle map click
  const handleMapClick = (latlng: LatLngExpression) => {
    setPosition(latlng);
    reverseGeocode(latlng);
  };

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Panel - Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
                Chỗ ở của bạn nằm ở đâu?
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Địa chỉ của bạn chỉ được chia sẻ với khách sau khi họ đặt phòng
                thành công.
              </p>
            </div>

            {/* Search Section */}
            <div className="space-y-4">
              <div className="relative" ref={searchContainerRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Nhập địa chỉ của bạn"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="pl-12 pr-12 py-4 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                  />

                  {/* Clear button */}
                  {address && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  {/* Loading spinner */}
                  {isSearching && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
                    </div>
                  )}
                </div>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <Card className="shadow-xl border border-gray-200 bg-white rounded-xl overflow-hidden">
                      <div className="max-h-80 overflow-y-auto">
                        {/* Current location option */}
                        <button
                          onClick={getCurrentLocation}
                          disabled={isLoading}
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Navigation className="h-5 w-5 text-rose-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {isLoading
                                ? "Đang lấy vị trí..."
                                : "Sử dụng vị trí hiện tại của tôi"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Tự động xác định vị trí của bạn
                            </p>
                          </div>
                        </button>

                        {/* Address suggestions */}
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {suggestion.display_name
                                  .split(",")
                                  .slice(0, 2)
                                  .join(", ")}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {suggestion.display_name}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* No results message */}
                {showSuggestions &&
                  suggestions.length === 0 &&
                  address.length >= 3 &&
                  !isSearching && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50">
                      <Card className="shadow-xl border border-gray-200 bg-white rounded-xl p-4">
                        <div className="text-center py-4">
                          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Không tìm thấy địa chỉ phù hợp
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Hãy thử nhập địa chỉ khác
                          </p>
                        </div>
                      </Card>
                    </div>
                  )}
              </div>

              {/* Current Location Button */}
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
              >
                <Navigation className="h-4 w-4" />
                {isLoading
                  ? "Đang lấy vị trí..."
                  : "Sử dụng vị trí hiện tại của tôi"}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Mẹo để chọn vị trí chính xác:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Nhập địa chỉ cụ thể vào ô tìm kiếm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Kéo thả điểm đánh dấu để điều chỉnh vị trí chính xác
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Nhấp vào bản đồ để đặt điểm đánh dấu mới</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
            <Card className="overflow-hidden h-[400px] sm:h-[500px] lg:h-full shadow-lg border border-gray-200">
              <MapContainer
                center={position}
                zoom={13}
                className="h-full w-full"
                ref={mapRef}
                zoomControl={true}
                scrollWheelZoom={true}
                style={{ borderRadius: "0.75rem" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
                <Marker
                  position={position}
                  draggable={true}
                  icon={customIcon}
                  eventHandlers={{
                    dragend: handleMarkerDrag,
                  }}
                />
                <MapClickHandler onLocationSelect={handleMapClick} />
              </MapContainer>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center w-full">
            {/* Nút quay lại bên trái */}
            <Link to="/become-a-host/about-your-place">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>

            {/* Nút tiếp theo bên phải */}
            <Link to="/become-a-host/floor-plan">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200">
                Tiếp theo
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
