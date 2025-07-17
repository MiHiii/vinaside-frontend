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
import { Link } from "react-router-dom";

export default function ClientSearch() {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const totalGuests = adults + children;

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

  const handleSearch = () => {
    // Implement search functionality
    console.log({ location, date, guests: totalGuests, infants });
    setActiveSection(null);
  };

  // Suggested locations
  const suggestedLocations = [
    {
      name: "Thành phố Hồ Chí Minh, Thành phố Hồ Chí Minh",
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
      {/* Main search bar */}
      <div className="flex h-16 w-full max-w-[900px] items-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] rounded-full border border-gray-300 shadow-md hover:shadow-lg md:w-auto overflow-hidden">
        {/* Location Section */}
        <Popover
          open={activeSection === "location"}
          onOpenChange={(open) => setActiveSection(open ? "location" : null)}
        >
          <PopoverTrigger asChild>
            <div
              className="flex h-full w-[300px] flex-1 cursor-pointer items-center px-6 py-2 rounded-full hover:bg-muted transition-all"
              onClick={() => setActiveSection("location")}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">Địa điểm</span>
                <span className="text-[13px] text-muted-foreground truncate">
                  {location || "Tìm kiếm điểm đến"}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="z-50 mt-2 w-[400px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4 shadow-2xl"
            align="start"
            sideOffset={8}
          >
            <div className="mb-4">
              <div className="flex items-center gap-3 rounded-full bg-muted p-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm đến"
                  className="w-full bg-transparent border-none p-0 outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-lg">📍</span>
                </div>
                <div>
                  <div className="font-medium">Lân cận</div>
                  <div className="text-sm text-muted-foreground">
                    Tìm xung quanh bạn
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium mb-2">
                Điểm đến được đề xuất
              </div>
              <div className="space-y-4">
                {suggestedLocations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-md"
                    onClick={() => {
                      setLocation(loc.name);
                      setActiveSection(null);
                    }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${loc.color}`}
                    >
                      <span className="text-lg">{loc.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium">{loc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {loc.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Vertical border */}
        <div className="h-2/3 w-px bg-border"></div>

        {/* Date Section */}
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
            className="
              z-50 mt-2 w-auto p-7 rounded-2xl border border-[hsl(var(--border))]
              bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]
              shadow-2xl
            "
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

        {/* Guests Section */}
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
                <Link to={"/search"} className="flex items-center">
                  <Button
                    className="h-12 m-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                    onClick={handleSearch}
                  >
                    <Search className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline-block">
                      Tìm kiếm
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="
              z-50 mt-2 w-80 border rounded-2xl border-[hsl(var(--border))]
              bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]
              shadow-2xl
            "
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
