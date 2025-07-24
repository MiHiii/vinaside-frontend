import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchBookingStatisticsOverview,
  fetchBookingStatisticsFinancial,
  fetchBookingStatisticsCustomers,
} from "@/store/slices/bookingSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import BookingCharts from "./BookingCharts";

function DatePicker({ value, onChange, label }: { value?: string; onChange: (date: string) => void; label: string; }) {
  const [open, setOpen] = useState(false);
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

export default function BookingStatisticsAdmin() {
  const dispatch = useAppDispatch();
  const statisticsOverview = useAppSelector(state => state.booking.statisticsOverview) || {};
  const statisticsFinancial = useAppSelector(state => state.booking.statisticsFinancial) || {};


  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const params: { startDate?: string; endDate?: string } = {};
    if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
    dispatch(fetchBookingStatisticsOverview(params));
    dispatch(fetchBookingStatisticsFinancial(params));
    dispatch(fetchBookingStatisticsCustomers(params));
  }, [dispatch, startDate, endDate]);

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


  const formatCurrency = (value?: number) => typeof value === "number" ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "-";
  const formatPercent = (value?: number) => typeof value === "number" ? `${(value * 100).toFixed(2)}%` : "-";

  return (
    <div className="space-y-8">
      {/* Bộ lọc ngày */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <DatePicker value={startDate} onChange={setStartDate} label="Từ ngày" />
          <DatePicker value={endDate} onChange={setEndDate} label="Đến ngày" />
        </div>
      </Card>

      {/* Tổng quan booking */}
      <Card>
        <CardHeader><CardTitle>Tổng quan booking</CardTitle></CardHeader>
        <CardContent>
          <table className="min-w-[300px] w-full text-sm">
            <tbody>
              <tr><td className="py-1">Tổng booking</td><td className="font-bold">{statisticsOverview.totalBookings ?? "-"}</td></tr>
              <tr><td className="py-1">Doanh thu</td><td className="font-bold text-green-600">{formatCurrency(statisticsOverview.totalRevenue)}</td></tr>
              <tr><td className="py-1">Tổng đêm</td><td>{statisticsOverview.totalNights ?? "-"}</td></tr>
              <tr><td className="py-1">Tổng khách</td><td>{statisticsOverview.totalGuests ?? "-"}</td></tr>
              <tr><td className="py-1">Tỉ lệ lấp đầy</td><td>{formatPercent(statisticsOverview.averageOccupancyRate)}</td></tr>
              <tr><td className="py-1">Giá trị booking TB</td><td>{formatCurrency(statisticsOverview.averageBookingValue)}</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Thống kê khách hàng */}
   

      {/* Cột phải */}
      <div className="flex flex-col gap-6">
        {/* Thống kê tài chính */}
        <Card>
          <CardHeader><CardTitle>Thống kê tài chính</CardTitle></CardHeader>
          <CardContent>
            <table className="min-w-[300px] w-full text-sm">
              <tbody>
                <tr><td className="py-1">Doanh thu</td><td className="font-bold text-green-600">{formatCurrency(statisticsFinancial.totalRevenue)}</td></tr>
                <tr><td className="py-1">Phí dịch vụ</td><td>{formatCurrency(statisticsFinancial.totalServiceFees)}</td></tr>
                <tr><td className="py-1">Thuế</td><td>{formatCurrency(statisticsFinancial.totalTaxAmount)}</td></tr>
                <tr><td className="py-1">Hoàn tiền</td><td>{formatCurrency(statisticsFinancial.totalRefunds)}</td></tr>
                <tr><td className="py-1">Doanh thu thực</td><td className="font-bold">{formatCurrency(statisticsFinancial.netRevenue)}</td></tr>
                <tr><td className="py-1">Giá trị booking TB</td><td>{formatCurrency(statisticsFinancial.averageBookingValue)}</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        {/* Các biểu đồ booking */}
        <BookingCharts
          statusData={statusData}
          revenueData={getRevenueByMonth(statisticsFinancial)}
          bookingByMonth={Array.isArray(bookingByMonth) ? bookingByMonth : []}
        />
      </div>
    </div>
  );
}
