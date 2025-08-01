import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, Cell } from "recharts";

const COLORS = [
  "#FF6384", // đỏ hồng
  "#36A2EB", // xanh dương sáng
  "#FFCE56", // vàng
  "#4BC0C0", // xanh ngọc
  "#9966FF", // tím
  "#FF9F40", // cam
];

interface BookingChartsProps {
  statusData: Array<{ name: string; value: number }>;
  revenueData: Array<{ month: string; revenue: number }>;
  bookingByMonth: Array<{ month: string; bookings: number }>;
}

const BookingCharts: React.FC<BookingChartsProps> = ({ statusData, revenueData, bookingByMonth }) => {
  // Chuẩn hoá dữ liệu cho PieChart + legend
  const pieData = statusData.map((item, idx) => ({
    ...item,
    fill: COLORS[idx % COLORS.length],
    key: item.name,
  }));

  // Debug log for revenueData


  return (
    <div className="flex flex-col gap-4">
      {/* Biểu đồ trạng thái booking với legend đẹp */}
      <Card className="flex flex-col border-0 shadow">
        <CardHeader className="items-center pb-0">
          <CardTitle>Biểu đồ trạng thái booking</CardTitle>
          <CardDescription>Thống kê trạng thái booking</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 p-3 md:p-4">
          <div className="mx-auto aspect-square max-h-[400px] flex items-center justify-center">
            <PieChart width={360} height={320}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                fill="#8884d8"
                outerRadius={110}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (!percent || percent <= 0) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const angle = midAngle ?? 0;
                  const x = cx + radius * Math.cos(-angle * RADIAN);
                  const y = cy + radius * Math.sin(-angle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#222"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={16}
                      fontWeight={600}
                    >
                      {`${((percent ?? 0) * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                formatter={(value: string) => {
                  const item = pieData.find(d => d.name === value);
                  return (
                    <span>
                      {value} <span style={{ fontWeight: 600 }}>{item ? item.value : 0}</span>
                    </span>
                  );
                }}
                wrapperStyle={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  columnGap: 32,
                  rowGap: 12,
                  maxWidth: 400,
                  margin: '0 auto',
                }}
              />
            </PieChart>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Biểu đồ doanh thu theo tháng */}
        <Card className="flex-1 border-0 shadow">
          <CardHeader className="pb-0 pt-3 px-3 md:px-4 md:pt-4"><CardTitle>Biểu đồ doanh thu theo tháng</CardTitle></CardHeader>
          <CardContent className="p-3 md:p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Array.isArray(revenueData) ? revenueData : []}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })} />
                <Tooltip formatter={v => v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" barSize={44} activeBar={false}>
                  <LabelList dataKey="revenue" position="top" formatter={v => v != null ? Number(v).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }) : ""} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Biểu đồ số booking theo tháng */}
        <Card className="flex-1 border-0 shadow">
          <CardHeader className="pb-0 pt-3 px-3 md:px-4 md:pt-4"><CardTitle>Biểu đồ số booking theo tháng</CardTitle></CardHeader>
          <CardContent className="p-3 md:p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={Array.isArray(bookingByMonth) ? bookingByMonth : []}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#82ca9d" name="Số booking" barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCharts; 