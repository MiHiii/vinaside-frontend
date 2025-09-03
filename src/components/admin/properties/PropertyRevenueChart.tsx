"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

interface PropertyRevenueChartProps {
  chartData: Array<{
    date: string;
    totalRevenue: number;
  }>;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  loading?: boolean;
}

// Hàm format tiền tệ VND
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function PropertyRevenueChart({
  chartData,
  dateRange,
  loading,
}: PropertyRevenueChartProps) {
  // Tính tổng doanh thu của khoảng thời gian được chọn
  const totalRevenue = React.useMemo(() => {
    try {
      if (!Array.isArray(chartData)) return 0;
      return chartData.reduce(
        (sum, item) => sum + (item?.totalRevenue || 0),
        0
      );
    } catch (error) {
      console.error("Error calculating totalRevenue:", error);
      return 0;
    }
  }, [chartData]);

  const averageRevenue = React.useMemo(() => {
    try {
      if (!Array.isArray(chartData) || chartData.length === 0) return 0;
      return totalRevenue / chartData.length;
    } catch (error) {
      console.error("Error calculating averageRevenue:", error);
      return 0;
    }
  }, [chartData, totalRevenue]);

  // Format khoảng thời gian hiển thị
  const dateRangeText = React.useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate)
      return "Chưa chọn khoảng thời gian";

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (startDate.getTime() === endDate.getTime()) {
      return `Ngày ${format(startDate, "dd/MM/yyyy")}`;
    }

    return `Từ ${format(startDate, "dd/MM/yyyy")} đến ${format(
      endDate,
      "dd/MM/yyyy"
    )}`;
  }, [dateRange]);

  if (loading) {
    return (
      <Card className="pt-0">
        <CardHeader>
          <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0 bg-white border-none">
      <CardHeader className="flex items-center gap-2 space-y-0 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-xl">Biểu Đồ Doanh Thu</CardTitle>
          <CardDescription>{dateRangeText}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={Array.isArray(chartData) ? chartData : []}
              margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={34}
                fontSize={13}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                hide={true}
              />
              <Tooltip
                cursor={{
                  stroke: "#3b82f6",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                labelFormatter={(value: any) => {
                  return new Date(value).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value: any) => [
                  formatCurrency(value as number),
                  "Doanh Thu",
                ]}
              />
              <Area
                dataKey="totalRevenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="#3b82f6"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
