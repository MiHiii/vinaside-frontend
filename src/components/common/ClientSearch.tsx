"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MinusCircle, PlusCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useClientSearchLogic } from "./useClientSearchLogic";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const libraries: Array<"places"> = ["places"];

export default function ClientSearch() {
  const {
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
  } = useClientSearchLogic();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (activeSection === "location") {
      // Delay to ensure popover/content mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [activeSection]);

  return (
    <>
      <style>
        {`
          .pac-container {
            display: none !important;
          }
          
          /* Hide default scrollbar completely */
          .suggestions-scroll {
            max-height: 400px;
            overflow-y: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
        
        `}
      </style>
      <div className="relative p-3 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] flex justify-center items-center">
        {/* Main search bar ngang hàng */}
        <div className="flex h-16 w-full max-w-[1200px] items-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-full border border-gray-300 shadow-md hover:shadow-lg">
          {/* Địa điểm */}
          <Popover
            open={activeSection === "location"}
            onOpenChange={(open) => setActiveSection(open ? "location" : null)}
          >
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex flex-col justify-center h-full w-64 px-6 py-2 cursor-pointer rounded-full transition-all",
                  activeSection === "location"
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                    : "bg-transparent",
                  "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]"
                )}
                onClick={() => {
                  setActiveSection("location");
                  // Focus input immediately on first click
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              >
                <span className="text-sm font-semibold text-foreground">
                  Địa điểm
                </span>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Tìm kiếm điểm đến"
                      className="bg-transparent border-none outline-none text-sm text-muted-foreground p-0 m-0 w-full"
                      value={location}
                      onChange={(e) => {
                        const value = e.target.value;
                        setLocation(value);
                        setSelectedPlace(null);
                        // Always get Google suggestions, even for short input
                        getGoogleSuggestions(value);
                      }}
                      onFocus={() => {
                        // Show suggestions immediately when input is focused
                        triggerGoogleSuggestions();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          e.preventDefault();
                          if (autocomplete) {
                            const predictions = autocomplete.getPlace();
                            if (predictions && predictions.formatted_address) {
                              setLocation(predictions.formatted_address);
                              setSelectedPlace(predictions);
                              setActiveSection(null);
                            }
                          }
                        }
                      }}
                      autoComplete="off"
                      style={{ caretColor: "transparent" }}
                    />
                  </Autocomplete>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tìm kiếm điểm đến"
                    className="bg-transparent border-none outline-none text-sm text-muted-foreground p-0 m-0 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled
                  />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="z-50 mt-2 min-w-[400px] max-h-[600px] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-0"
              align="start"
            >
              <AnimatePresence>
                {allSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-2"
                  >
                    <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                      {location.trim().length > 2
                        ? "Kết quả tìm kiếm"
                        : "Các địa điểm nổi bật"}
                    </div>
                    <div className="suggestions-scroll">
                      {allSuggestions.map((loc, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted py-2 px-3 rounded-md transition"
                          onMouseDown={() => {
                            setLocation(loc.name);
                            if ((loc as any).isGoogle && (loc as any).placeId) {
                              const placeResult: google.maps.places.PlaceResult =
                                {
                                  place_id: (loc as any).placeId,
                                  formatted_address: loc.name,
                                  name: loc.name,
                                };
                              setSelectedPlace(placeResult);
                            } else if ((loc as any).lat && (loc as any).lng) {
                              // Handle property location with lat/lng
                              const placeResult: google.maps.places.PlaceResult =
                                {
                                  formatted_address: loc.name,
                                  name: loc.name,
                                  geometry: {
                                    location: {
                                      lat: () => (loc as any).lat,
                                      lng: () => (loc as any).lng,
                                    } as any,
                                  } as any,
                                };
                              setSelectedPlace(placeResult);
                            } else {
                              setSelectedPlace(null);
                            }
                            setActiveSection(null);
                          }}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${loc.color}`}
                          >
                            <span className="text-lg">{loc.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {loc.name}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {loc.description}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {allSuggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {location.trim().length > 2
                    ? "Không tìm thấy địa điểm phù hợp"
                    : "Đang tải gợi ý địa điểm..."}
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Vertical border */}
          <div className="h-2/3 w-px bg-border"></div>

          {/* Nhận phòng (Check-in) */}
          <Popover
            open={activeSection === "check-in-date"}
            onOpenChange={(open) =>
              setActiveSection(open ? "check-in-date" : null)
            }
          >
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex flex-col justify-center h-full w-48 px-4 py-2 cursor-pointer rounded-full transition-all",
                  activeSection === "check-in-date"
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                    : "bg-transparent",
                  "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]"
                )}
                onClick={() => setActiveSection("check-in-date")}
              >
                <span className="text-sm font-semibold text-foreground">
                  Nhận phòng
                </span>
                <span className="text-xs text-muted-foreground">
                  {date?.from
                    ? format(date.from, "dd MMM yyyy", { locale: vi })
                    : "Thêm ngày"}
                </span>
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
                className="rounded-md"
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
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell:
                    "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center",
                  row: "flex w-full mt-1 justify-between",
                  cell: "h-10 w-10 mx-0.5 my-0.5 text-center text-sm p-0 relative rounded-md focus-within:relative focus-within:z-20",
                  day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors",
                  day_selected:
                    "bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900 font-medium",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-gray-300 aria-selected:text-gray-900",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Vertical border */}
          <div className="h-2/3 w-px bg-border"></div>

          {/* Trả phòng (Check-out) */}
          <Popover
            open={activeSection === "check-out-date"}
            onOpenChange={(open) =>
              setActiveSection(open ? "check-out-date" : null)
            }
          >
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex flex-col justify-center h-full w-48 px-4 py-2 cursor-pointer rounded-full transition-all",
                  activeSection === "check-out-date"
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                    : "bg-transparent",
                  "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]"
                )}
                onClick={() => setActiveSection("check-out-date")}
              >
                <span className="text-sm font-semibold text-foreground">
                  Trả phòng
                </span>
                <span className="text-xs text-muted-foreground">
                  {date?.to
                    ? format(date.to, "dd MMM yyyy", { locale: vi })
                    : "Thêm ngày"}
                </span>
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
                className="rounded-md"
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
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell:
                    "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center",
                  row: "flex w-full mt-1 justify-between",
                  cell: "h-10 w-10 mx-0.5 my-0.5 text-center text-sm p-0 relative rounded-md focus-within:relative focus-within:z-20",
                  day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors",
                  day_selected:
                    "bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900 font-medium",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-gray-300 aria-selected:text-gray-900",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Vertical border */}
          <div className="h-2/3 w-px bg-border"></div>

          {/* Tiêu chí chỗ ở (Accommodation Criteria) */}
          <Popover
            open={activeSection === "accommodationCriteria"}
            onOpenChange={(open) =>
              setActiveSection(open ? "accommodationCriteria" : null)
            }
          >
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "flex flex-col justify-center h-full w-48 px-4 py-2 cursor-pointer rounded-full transition-all",
                  activeSection === "accommodationCriteria"
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-semibold"
                    : "bg-transparent",
                  "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))]"
                )}
                onClick={() => setActiveSection("accommodationCriteria")}
              >
                <span className="text-sm font-semibold text-foreground">
                  Tiêu chí chỗ ở
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalGuests > 0 || minBeds > 0 || minBathrooms > 0
                    ? `${totalGuests} khách, ${minBeds} giường, ${minBathrooms} phòng tắm`
                    : "Thêm tiêu chí"}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="z-50 mt-2 w-80 border rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-2xl"
              align="end"
            >
              <div className="space-y-4 p-1">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Số khách</div>
                    <div className="text-sm text-muted-foreground">
                      Số lượng khách có thể ở
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() =>
                        setAdults((prev) => (prev > 0 ? prev - 1 : 0))
                      }
                      disabled={adults === 0}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setAdults((prev) => prev + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Số giường</div>
                    <div className="text-sm text-muted-foreground">
                      Số lượng giường cần thiết
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() =>
                        setMinBeds((prev) => (prev > 0 ? prev - 1 : 0))
                      }
                      disabled={minBeds === 0}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{minBeds}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setMinBeds((prev) => prev + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="border-t border-border"></div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Số phòng tắm</div>
                    <div className="text-sm text-muted-foreground">
                      Số lượng phòng tắm cần thiết
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() =>
                        setMinBathrooms((prev) => (prev > 0 ? prev - 1 : 0))
                      }
                      disabled={minBathrooms === 0}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{minBathrooms}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => setMinBathrooms((prev) => prev + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button
            className="h-12 w-12 rounded-full bg-[#FF385C] text-white hover:bg-[#E02B4F] flex items-center justify-center shrink-0 mr-2"
            onClick={handleSearch}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
