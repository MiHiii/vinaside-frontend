
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchBookingStatisticsOverview,
  fetchBookingStatisticsFinancial,
  fetchBookingStatisticsCustomers,
} from "@/store/slices/bookingSlice";
import BookingCharts from "./BookingCharts";
import { Card } from "@/components/ui/card";
// Định nghĩa lại DatePicker nội bộ (bỏ comment, đặt lại vào đầu file)
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";


// Helper to safely extract revenueByMonth
function getRevenueByMonth(statisticsFinancial: unknown): { month: string; revenue: number }[] {
  if (
    statisticsFinancial &&
    typeof statisticsFinancial === 'object' &&
    'financial' in statisticsFinancial &&
    statisticsFinancial.financial &&
    typeof statisticsFinancial.financial === 'object' &&
    Array.isArray((statisticsFinancial.financial as unknown as { revenueByMonth?: unknown }).revenueByMonth)
  ) {
    return (statisticsFinancial.financial as { revenueByMonth: { month: string; revenue: number }[] }).revenueByMonth;
  }
  return [];
}

function DatePicker({ value, onChange, label }: { value?: string; onChange: (date: string) => void; label: React.ReactNode; }) {
  const [open, setOpen] = React.useState(false);
  const dateValue = value ? new Date(value) : undefined;
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, "dd/MM/yyyy") : <span className="text-gray-400">Chọn ngày</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={date => { setOpen(false); if (date) onChange(format(date, "yyyy-MM-dd")); }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function BookingStatisticsAdmin() {
  const dispatch = useAppDispatch();
  const statisticsOverview = useAppSelector(state => state.booking.statisticsOverview) || {};
  const statisticsFinancial = useAppSelector(state => state.booking.statisticsFinancial) || {};
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");


  useEffect(() => {
    const params: { startDate?: string; endDate?: string } = {};
    
    dispatch(fetchBookingStatisticsOverview(params));
    dispatch(fetchBookingStatisticsFinancial(params));
    dispatch(fetchBookingStatisticsCustomers(params));
  }, [dispatch]);

  // PieChart trạng thái booking
  const statusData = useMemo(() => {
    const breakdown = (statisticsOverview.statusBreakdown ?? {}) as Record<string, number>;
    return [
      { name: "Chờ xác nhận", value: breakdown["pending"] ?? 0 },
      { name: "Đã xác nhận", value: breakdown["confirmed"] ?? 0 },
      { name: "Đã hoàn thành", value: breakdown["completed"] ?? 0 },
      { name: "Đã huỷ", value: breakdown["cancelled"] ?? 0 },
      { name: "Bị từ chối", value: breakdown["rejected"] ?? 0 },
    ];
  }, [statisticsOverview]);

  const bookingByMonth = useMemo(() => {
    if (
      statisticsFinancial &&
      typeof statisticsFinancial === 'object' &&
      'financial' in statisticsFinancial &&
      statisticsFinancial.financial &&
      typeof statisticsFinancial.financial === 'object' &&
      Array.isArray((statisticsFinancial.financial as unknown as { revenueByMonth?: unknown }).revenueByMonth)
    ) {
      return ((statisticsFinancial.financial as { revenueByMonth: { month: string; bookings: number }[] }).revenueByMonth).map((item) => ({
      month: item.month,
      bookings: item.bookings,
    }));
    }
    return [];
  }, [statisticsFinancial]);


 

  return (
    <div className="space-y-8">
      {/* Bộ lọc ngày */}
      <Card className="p-2 md:p-3 bg-white/80 border-none shadow-none">
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3">
          <DatePicker value={startDate} onChange={setStartDate} label={<span className='text-xs md:text-sm'>Từ ngày</span>} />
          <DatePicker value={endDate} onChange={setEndDate} label={<span className='text-xs md:text-sm'>Đến ngày</span>} />
        </div>
      </Card>


      <div className="flex flex-col gap-6">
  
        <BookingCharts
          statusData={statusData}
          revenueData={getRevenueByMonth(statisticsFinancial)}
          bookingByMonth={Array.isArray(bookingByMonth) ? bookingByMonth : []}
        />
      </div>
    </div>
  );
}


