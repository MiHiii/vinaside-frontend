import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchBookingStatisticsOverview,
  fetchBookingStatisticsFinancial,
  fetchBookingStatisticsCustomers,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Định nghĩa type tạm thời sát backend
interface StatusBreakdown {
  pending?: number;
  confirmed?: number;
  cancelled?: number;
  completed?: number;
  rejected?: number;
  confirmationRate?: number;
  cancellationRate?: number;
}
interface Overview {
  totalBookings?: number;
  totalRevenue?: number;
  totalNights?: number;
  totalGuests?: number;
  averageOccupancyRate?: number;
  averageBookingValue?: number;
  totalInfants?: number;
  statusBreakdown?: StatusBreakdown | number;
}
interface Financial {
  totalRevenue?: number;
  totalServiceFees?: number;
  totalTaxAmount?: number;
  totalRefunds?: number;
  netRevenue?: number;
  averageBookingValue?: number;
  revenueByMonth?: Array<{ month: string; revenue: number; bookings: number }>;
}
interface Customers {
  totalCustomers?: number;
  newCustomers?: number;
  returningCustomers?: number;
  averageNightsPerBooking?: number;
  averageGuestsPerBooking?: number;
  topCustomers?: Array<{
    customerId: string;
    customerName: string;
    totalBookings: number;
    totalSpent: number;
  }>;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#FFBB28",
];

const BookingStatisticsAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const statisticsOverview = useAppSelector(
    (state: RootState) => state.booking.statisticsOverview
  ) as Overview | null;
  const statisticsFinancial = useAppSelector(
    (state: RootState) => state.booking.statisticsFinancial
  ) as Financial | null;
  const statisticsCustomers = useAppSelector(
    (state: RootState) => state.booking.statisticsCustomers
  ) as Customers | null;
  const { loading, error } = useAppSelector(
    (state: RootState) => state.booking
  );

  // Filter state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (!startDate && !endDate) {
      dispatch(fetchBookingStatisticsOverview());
      dispatch(fetchBookingStatisticsFinancial());
      dispatch(fetchBookingStatisticsCustomers());
    } else {
      dispatch(fetchBookingStatisticsOverview());
      dispatch(fetchBookingStatisticsFinancial());
      dispatch(fetchBookingStatisticsCustomers());
    }
  }, [dispatch, startDate, endDate]);

  // PieChart trạng thái booking
  const statusData = useMemo(() => {
    const breakdown = statisticsOverview?.statusBreakdown as
      | StatusBreakdown
      | undefined;
    if (!breakdown) return [];
    return [
      { name: "Chờ xác nhận", value: breakdown.pending || 0 },
      { name: "Đã xác nhận", value: breakdown.confirmed || 0 },
      { name: "Đã hoàn thành", value: breakdown.completed || 0 },
      { name: "Đã huỷ", value: breakdown.cancelled || 0 },
      { name: "Bị từ chối", value: breakdown.rejected || 0 },
    ];
  }, [statisticsOverview]);

  // BarChart doanh thu theo tháng
  const revenueData = statisticsFinancial?.revenueByMonth || [];

  // LineChart số booking theo tháng
  const bookingByMonth = useMemo(() => {
    if (!Array.isArray(statisticsFinancial?.revenueByMonth)) return [];
    return statisticsFinancial.revenueByMonth.map((item) => ({
      month: item.month,
      bookings: item.bookings,
    }));
  }, [statisticsFinancial]);

  // Top khách hàng
  const topCustomers = statisticsCustomers?.topCustomers || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Từ ngày</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đến ngày</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && (
        <p className="text-red-500">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tổng quan */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <b>Tổng booking:</b> {statisticsOverview?.totalBookings ?? "-"}
              </div>
              <div>
                <b>Doanh thu:</b> {statisticsOverview?.totalRevenue ?? "-"}
              </div>
              <div>
                <b>Tổng đêm:</b> {statisticsOverview?.totalNights ?? "-"}
              </div>
              <div>
                <b>Tổng khách:</b> {statisticsOverview?.totalGuests ?? "-"}
              </div>
              <div>
                <b>Tỉ lệ lấp đầy:</b>{" "}
                {statisticsOverview?.averageOccupancyRate ?? "-"}%
              </div>
              <div>
                <b>Giá trị booking TB:</b>{" "}
                {statisticsOverview?.averageBookingValue ?? "-"}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* PieChart trạng thái booking */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái Booking</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData && statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
        {/* BarChart doanh thu theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData && revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LineChart số booking theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle>Số booking theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingByMonth && bookingByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={bookingByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#82ca9d"
                    name="Số booking"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
        {/* Top khách hàng */}
        <Card>
          <CardHeader>
            <CardTitle>Top khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Tên khách</th>
                      <th className="text-left font-semibold">Số booking</th>
                      <th className="text-left font-semibold">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((item) => (
                      <tr key={item.customerId}>
                        <td>{item.customerName}</td>
                        <td>{item.totalBookings}</td>
                        <td>
                          {item.totalSpent?.toLocaleString("vi-VN") ?? 0}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Không có dữ liệu top khách hàng</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Thông tin tài chính tổng */}
      <Card>
        <CardHeader>
          <CardTitle>Tài chính tổng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <b>Doanh thu:</b> {statisticsFinancial?.totalRevenue ?? "-"}
            </div>
            <div>
              <b>Phí dịch vụ:</b> {statisticsFinancial?.totalServiceFees ?? "-"}
            </div>
            <div>
              <b>Thuế:</b> {statisticsFinancial?.totalTaxAmount ?? "-"}
            </div>
            <div>
              <b>Hoàn tiền:</b> {statisticsFinancial?.totalRefunds ?? "-"}
            </div>
            <div>
              <b>Doanh thu thực:</b> {statisticsFinancial?.netRevenue ?? "-"}
            </div>
            <div>
              <b>Giá trị booking TB:</b>{" "}
              {statisticsFinancial?.averageBookingValue ?? "-"}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Thông tin khách hàng tổng */}
      <Card>
        <CardHeader>
          <CardTitle>Khách hàng tổng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <b>Tổng khách:</b> {statisticsCustomers?.totalCustomers ?? "-"}
            </div>
            <div>
              <b>Khách mới:</b> {statisticsCustomers?.newCustomers ?? "-"}
            </div>
            <div>
              <b>Khách quay lại:</b>{" "}
              {statisticsCustomers?.returningCustomers ?? "-"}
            </div>
            <div>
              <b>Đêm TB/booking:</b>{" "}
              {statisticsCustomers?.averageNightsPerBooking ?? "-"}
            </div>
            <div>
              <b>Khách TB/booking:</b>{" "}
              {statisticsCustomers?.averageGuestsPerBooking ?? "-"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingStatisticsAdmin;
