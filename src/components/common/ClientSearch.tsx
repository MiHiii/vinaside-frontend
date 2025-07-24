import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MapPin, MinusCircle, PlusCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store'; // Đường dẫn tới store/index.ts hoặc store.ts
import { fetchListings } from '@/store/slices/listingSlice';
import type { ListingSearchParams } from '@/services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: Array<'places'> = ['places'];

export default function ClientSearch() {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [location, setLocation] = React.useState("");
  const [selectedPlace, setSelectedPlace] = React.useState<google.maps.places.PlaceResult | null>(null);
  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const totalGuests = adults + children;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleIncrement = (type: "adults" | "children" | "infants") => {
    if (type === "adults") setAdults((prev) => prev + 1);
    if (type === "children") setChildren((prev) => prev + 1);
    if (type === "infants") setInfants((prev) => prev + 1);
  };

  const handleDecrement = (type: "adults" | "children" | "infants") => {
    if (type === "adults") setAdults((prev) => (prev > 0 ? prev - 1 : 0));
    if (type === "children") setChildren((prev) => (prev > 0 ? prev - 1 : 0));
    if (type === "infants") setInfants((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Ngăn Popover đóng khi click vào dropdown Google Autocomplete
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.pac-container')) {
        e.stopPropagation();
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, []);

  // Xử lý khi chọn địa điểm từ Google Places
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setSelectedPlace(place);
      setLocation(place.formatted_address || place.name || "");
      setActiveSection(null); // Đóng Popover khi chọn gợi ý
    }
  };

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
      const [lat, lng] = location.split(',').map(Number);
      params.lat = lat;
      params.lng = lng;
    } else if (location) {
      params.locationKeyword = location;
    }
    if (totalGuests > 0) params.guests = totalGuests;
    // Có thể truyền thêm date nếu cần
    dispatch(fetchListings(params as ListingSearchParams));
    setActiveSection(null); // Đóng Popover khi nhấn tìm kiếm
    navigate('/search');
  };

  // Suggested locations
  const suggestedLocations = [
    {
      name: "Thành phố Hồ Chí Minh",
      description: "Có các thắng cảnh như Chợ Bến Thành",
      icon: "🏙️",
      color: "bg-blue-100 dark:bg-blue-900",
    },
    {
      name: "Đà Lạt, Lâm Đồng",
      description: "Phù hợp cho người yêu thiên nhiên",
      icon: "🏔️",
      color: "bg-red-100 dark:bg-red-900",
    },
    {
      name: "Bangkok, Thái Lan",
      description: "Có cuộc sống về đêm náo nhiệt",
      icon: "🏯",
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      name: "Thành phố Huế, Thừa Thiên-Huế",
      description: "Có kiến trúc ấn tượng",
      icon: "🏛️",
      color: "bg-red-100 dark:bg-red-900",
    },
    {
      name: "Đà Nẵng, Đà Nẵng",
      description: "Thích hợp cho kỳ nghỉ hè",
      icon: "🏝️",
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      name: "Melbourne, Úc",
      description: "Có ẩm thực đỉnh cao",
      icon: "🏰",
      color: "bg-pink-100 dark:bg-pink-900",
    },
  ];

  return (
    <div className="relative p-3 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex justify-center items-center">
      {/* Main search bar ngang hàng */}
      <div className="flex h-16 w-full max-w-[900px] items-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-full border border-gray-300 shadow-md hover:shadow-lg md:w-auto">
        {/* Địa điểm */}
        <div className="flex flex-col justify-center h-full px-6 py-2 bg-transparent relative">
          <span className="text-xs font-semibold text-foreground mb-0.5 ml-6">Địa điểm</span>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            {isLoaded && (
              <Autocomplete
                onLoad={setAutocomplete}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm đến"
                  className="bg-transparent border-none outline-none text-sm text-muted-foreground p-0 m-0 w-48"
                  value={location}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setSelectedPlace(null);
                    setShowSuggestions(true);
                  }}
                  autoComplete="off"
                />
              </Autocomplete>
            )}
          </div>
          {/* Gợi ý địa điểm */}
          {showSuggestions && suggestedLocations.length > 0 && (
            <div className="absolute left-0 top-full mt-2 min-w-[350px] bg-white rounded-xl shadow-lg z-50 border border-gray-200">
              {suggestedLocations.map((loc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted py-2 px-3 rounded-md transition"
                  onMouseDown={() => {
                    setLocation(loc.name);
                    setSelectedPlace(null);
                    setShowSuggestions(false);
                  }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${loc.color}`}>
                    <span className="text-lg">{loc.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-sm text-muted-foreground">{loc.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Vertical border */}
        <div className="h-2/3 w-px bg-border"></div>
        {/* Popover chọn ngày */}
        <Popover
          open={activeSection === "date"}
          onOpenChange={(open) => setActiveSection(open ? "date" : null)}
        >
          <PopoverTrigger asChild>
            <div
              className="flex h-full w-[400px] flex-1 cursor-pointer items-center px-6 py-2 rounded-full hover:bg-muted transition-all"
              onClick={() => setActiveSection("date")}
            >
              <div className="flex flex-col w-full">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Nhận phòng</span>
                  <span className="text-sm font-medium">Trả phòng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    {date?.from
                      ? format(date.from, "dd MMM yyyy", { locale: vi })
                      : "Thêm ngày"}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {date?.to
                      ? format(date.to, "dd MMM yyyy", { locale: vi })
                      : "Thêm ngày"}
                  </span>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="z-50 mt-2 w-auto p-7 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-2xl"
            align="center"
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={vi}
              disabled={(date) => date < new Date()}
              className="p-0"
              showOutsideDays={false}
              fixedWeeks
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex justify-between",
                head_cell:
                  "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-1 justify-between",
                cell:
                  "h-10 w-10 mx-0.5 my-0.5 text-center text-sm p-0 relative rounded-md focus-within:relative focus-within:z-20 " +
                  "[&:has([aria-selected].day-range-end)]:rounded-r-md " +
                  "[&:has([aria-selected].day-outside)]:bg-muted/50 " +
                  "[&:has([aria-selected])]:bg-muted " +
                  "first:[&:has([aria-selected])]:rounded-l-md " +
                  "last:[&:has([aria-selected])]:rounded-r-md",
                day:
                  "h-10 w-10 p-0 font-normal rounded-md transition-colors " +
                  "aria-selected:opacity-100 " +
                  "hover:bg-muted hover:text-foreground " +
                  "focus:bg-accent focus:text-accent-foreground",
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
                day_today: "bg-muted text-foreground",
                day_outside:
                  "text-muted-foreground opacity-50 aria-selected:bg-muted/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-muted aria-selected:text-foreground",
                day_hidden: "invisible",
              }}
            />
          </PopoverContent>
        </Popover>
        {/* Vertical border */}
        <div className="h-2/3 w-px bg-border"></div>
        {/* Popover chọn khách + nút tìm kiếm */}
        <Popover
          open={activeSection === "guests"}
          onOpenChange={(open) => setActiveSection(open ? "guests" : null)}
        >
          <PopoverTrigger asChild>
            <div
              className="flex h-full flex-1 cursor-pointer gap-6 items-center px-6 py-2 rounded-full hover:bg-muted transition-all"
              onClick={() => setActiveSection("guests")}
            >
              <div className="flex flex-col w-[100px]">
                <span className="text-sm font-medium">Khách</span>
                <span className="text-[13px] text-muted-foreground">
                  {totalGuests > 0
                    ? `${totalGuests} khách${
                        infants > 0 ? `, ${infants} em bé` : ""
                      }`
                    : "Thêm khách"}
                </span>
              </div>
              {/* Search Button */}
              <div>
                <Button
                  className="h-12 m-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                  onClick={handleSearch}
                >
                  <Search className="h-5 w-5" />
                  <span className="ml-2 hidden md:inline-block">
                    Tìm kiếm
                  </span>
                </Button>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="z-50 mt-2 w-80 border rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-2xl"
            align="end"
          >
            <div className="space-y-4 p-1">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">Người lớn</div>
                  <div className="text-sm text-muted-foreground">
                    Từ 13 tuổi trở lên
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleDecrement("adults")}
                    disabled={adults === 0}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span>{adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleIncrement("adults")}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border-t border-border"></div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">Trẻ em</div>
                  <div className="text-sm text-muted-foreground">
                    Độ tuổi 2–12
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleDecrement("children")}
                    disabled={children === 0}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span>{children}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleIncrement("children")}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border-t border-border"></div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">Em bé</div>
                  <div className="text-sm text-muted-foreground">
                    Dưới 2 tuổi
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleDecrement("infants")}
                    disabled={infants === 0}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span>{infants}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => handleIncrement("infants")}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
