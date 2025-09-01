import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { Tag, Package, TrendingUp, DollarSign, Calendar } from "lucide-react";

// COLORS array removed as it's not being used

interface StatisticsOverview {
  statusBreakdown?: {
    pending?: number;
    confirmed?: number;
    completed?: number;
    cancelled?: number;
    rejected?: number;
  };
  paymentStatusBreakdown?: {
    unpaid?: number;
    partially_paid?: number;
    paid?: number;
    refunding?: number;
    refunded?: number;
    failed?: number;
  };
  chartData?: Array<{
    label?: string;
    date?: string;
    day?: string;
    revenue?: number;
    bookings?: number;
    occupancyRate?: number;
  }>;
  topVouchersUsed?: Array<{
    voucherCode: string;
    usageCount: number;
    totalDiscount: number;
    averageDiscount: number;
  }>;
  topServicesUsed?: Array<{
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
  }>;
}

interface BookingChartsProps {
  statisticsOverview: StatisticsOverview;
  onVoucherClick: (voucherCode: string) => void;
  onServiceClick: (serviceId: string) => void;
}

const BookingCharts: React.FC<BookingChartsProps> = ({
  statisticsOverview,
  onVoucherClick,
  onServiceClick,
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status breakdown data for pie chart
  const statusData = React.useMemo(() => {
    if (!statisticsOverview?.statusBreakdown) return [];

    const breakdown = statisticsOverview.statusBreakdown;
    return [
      { name: "Chờ xác nhận", value: breakdown.pending || 0, color: "#FFCE56" },
      {
        name: "Đã xác nhận",
        value: breakdown.confirmed || 0,
        color: "#36A2EB",
      },
      {
        name: "Đã hoàn thành",
        value: breakdown.completed || 0,
        color: "#4BC0C0",
      },
      { name: "Đã hủy", value: breakdown.cancelled || 0, color: "#FF6384" },
      { name: "Bị từ chối", value: breakdown.rejected || 0, color: "#9966FF" },
    ].filter((item) => item.value > 0);
  }, [statisticsOverview]);

  // Payment status breakdown data
  const paymentStatusData = React.useMemo(() => {
    if (!statisticsOverview?.paymentStatusBreakdown) return [];

    const breakdown = statisticsOverview.paymentStatusBreakdown;
    return [
      {
        name: "Chưa thanh toán",
        value: breakdown.unpaid || 0,
        color: "#FF6384",
      },
      {
        name: "Thanh toán một phần",
        value: breakdown.partially_paid || 0,
        color: "#FFCE56",
      },
      { name: "Đã thanh toán", value: breakdown.paid || 0, color: "#4BC0C0" },
      {
        name: "Đang hoàn tiền",
        value: breakdown.refunding || 0,
        color: "#9966FF",
      },
      {
        name: "Đã hoàn tiền",
        value: breakdown.refunded || 0,
        color: "#36A2EB",
      },
      {
        name: "Thanh toán thất bại",
        value: breakdown.failed || 0,
        color: "#FF9F40",
      },
    ].filter((item) => item.value > 0);
  }, [statisticsOverview]);

  // Chart data for revenue and bookings
  const chartData = React.useMemo(() => {
    if (!statisticsOverview?.chartData) return [];

    // Transform API data (label/revenue/bookings) to chart-ready structure
    return statisticsOverview.chartData.map((item) => ({
      date: item.label || item.date || item.day,
      totalRevenue: item.revenue || 0,
      bookings: item.bookings || 0,
      occupancyRate: item.occupancyRate || 0,
    }));
  }, [statisticsOverview]);

  return (
    <div className="space-y-6">
      {/* Revenue and Bookings Chart */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Biểu đồ doanh thu và booking theo thời gian
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  minTickGap={24}
                  tick={{ fontSize: 11, fill: "#4B5563" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  hide={true}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  hide={true}
                />
                <Tooltip
                  cursor={{
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{ fontSize: 12, padding: 8 }}
                  labelStyle={{ fontSize: 12, color: "#111827" }}
                  itemStyle={{ fontSize: 12 }}
                  labelFormatter={(value: string | number) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value: number, name: string) => [
                    name === "totalRevenue" ? formatCurrency(value) : value,
                    name === "totalRevenue"
                      ? "Doanh thu"
                      : name === "bookings"
                      ? "Tổng booking"
                      : name,
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="natural"
                  dataKey="totalRevenue"
                  fill="url(#fillRevenue)"
                  stroke="#3b82f6"
                  name="Doanh thu"
                />
                <Area
                  yAxisId="right"
                  type="natural"
                  dataKey="bookings"
                  fill="url(#fillBookings)"
                  stroke="#10b981"
                  name="Số booking"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown Pie Chart */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Trạng thái Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ fontSize: 12 }}
                  formatter={(value: number) => [value, "Số lượng"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Breakdown Pie Chart */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Trạng thái Thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ fontSize: 12 }}
                  formatter={(value: number) => [value, "Số lượng"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Vouchers */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Top Vouchers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(statisticsOverview?.topVouchersUsed || [])
                .slice(0, 5)
                .map((voucher, index: number) => (
                  <div
                    key={voucher.voucherCode}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onVoucherClick(voucher.voucherCode)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {voucher.voucherCode}: {voucher.averageDiscount || 0}%
                          discount
                        </p>
                        <p className="text-xs text-gray-500">
                          {voucher.usageCount} lần sử dụng
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-purple-600">
                        {voucher.averageDiscount || 0}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Top Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(statisticsOverview?.topServicesUsed || [])
                .slice(0, 5)
                .map((service, index: number) => (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onServiceClick(service.serviceId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {service.serviceName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.usageCount} lần sử dụng
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-blue-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(service.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCharts;
