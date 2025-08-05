"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  setDateRange,
  setDateRangeType,
  fetchDashboardStatistics,
  fetchDashboardOverview,
  fetchRealTimeData,
  fetchRevenueChartData,
} from "@/store/slices/dashboardSlice";

interface DateRangePickerProps {
  className?: string;
}

export function DateRangePicker({ className }: DateRangePickerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { dateRange, dateRangeType, selectedPropertyId } = useSelector(
    (state: RootState) => state.dashboard
  );

  // Initialize date state from Redux store
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (dateRange.startDate && dateRange.endDate) {
      return {
        from: new Date(dateRange.startDate),
        to: new Date(dateRange.endDate),
      };
    }
    // Default to today
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

  const [isOpen, setIsOpen] = React.useState(false);

  // Update local state when Redux state changes
  React.useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      setDate({
        from: new Date(dateRange.startDate),
        to: new Date(dateRange.endDate),
      });
    }
  }, [dateRange]);

  // Preset options
  const presets = [
    {
      label: "Hôm nay",
      value: () => ({
        from: new Date(),
        to: new Date(),
      }),
      type: "today" as const,
    },
    {
      label: "7 ngày qua",
      value: () => ({
        from: addDays(new Date(), -7),
        to: new Date(),
      }),
      type: "last_7_days" as const,
    },
    {
      label: "15 ngày qua",
      value: () => ({
        from: addDays(new Date(), -15),
        to: new Date(),
      }),
      type: "last_15_days" as const,
    },
    {
      label: "30 ngày qua",
      value: () => ({
        from: addDays(new Date(), -30),
        to: new Date(),
      }),
      type: "last_30_days" as const,
    },
  ];

  // Function to fetch all dashboard data
  const fetchAllDashboardData = React.useCallback(
    (params: {
      dateRange:
        | "today"
        | "last_7_days"
        | "last_15_days"
        | "last_30_days"
        | "custom";
      startDate: string;
      endDate: string;
      propertyId?: string | null;
    }) => {
      dispatch(fetchDashboardStatistics(params));
      dispatch(fetchDashboardOverview(params));
      dispatch(fetchRealTimeData(params));
      dispatch(fetchRevenueChartData(params));
    },
    [dispatch]
  );

  const handleDateChange = (newDate: DateRange | undefined) => {
    if (!newDate?.from || !newDate?.to) return;

    setDate(newDate);

    // Update Redux store
    const startDate = format(newDate.from, "yyyy-MM-dd");
    const endDate = format(newDate.to, "yyyy-MM-dd");

    dispatch(setDateRange({ startDate, endDate }));
    dispatch(setDateRangeType("custom"));

    // Fetch all dashboard data with new date range
    fetchAllDashboardData({
      dateRange: "custom",
      startDate,
      endDate,
      propertyId: selectedPropertyId,
    });
  };

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    const newDate = preset.value();
    setDate(newDate);

    // Update Redux store
    const startDate = format(newDate.from, "yyyy-MM-dd");
    const endDate = format(newDate.to, "yyyy-MM-dd");

    dispatch(setDateRangeType(preset.type));
    dispatch(setDateRange({ startDate, endDate }));

    // Fetch all dashboard data with preset
    fetchAllDashboardData({
      dateRange: preset.type,
      startDate,
      endDate,
      propertyId: selectedPropertyId,
    });

    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full max-w-[300px] justify-start text-left font-normal bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd-MM-yyyy")} ~{" "}
                    {format(date.to, "dd-MM-yyyy")}
                  </>
                ) : (
                  format(date.from, "dd-MM-yyyy")
                )
              ) : (
                "Chọn khoảng thời gian"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 max-w-[800px] shadow-lg border-0"
          align="start"
          sideOffset={4}
        >
          <div className="flex flex-col sm:flex-row bg-white rounded-lg overflow-hidden">
            {/* Preset sidebar */}
            <div className="border-b sm:border-b-0 sm:border-r bg-gray-50/50 border-gray-100">
              <div className="space-y-1 min-w-[160px] p-3">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={
                      dateRangeType === preset.type ? "default" : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "w-full justify-start text-sm font-normal h-10 transition-all",
                      dateRangeType === preset.type
                        ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                        : "hover:bg-white hover:shadow-sm text-gray-700"
                    )}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Calendar */}
            <div className="p-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
                className="rounded-md"
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
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors",
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
