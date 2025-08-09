import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/admin/dasboard/DateRangePicker";
import { ListingRevenueChart } from "./ListingRevenueChart";
import { DateRange } from "react-day-picker";
import {
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  Gift,
  Wrench,
  Star,
  Heart,
} from "lucide-react";

interface ListingStatisticsProps {
  statistics: any;
  statisticsLoading: boolean | undefined;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  dateRangeType:
    | "today"
    | "last_7_days"
    | "last_15_days"
    | "last_30_days"
    | "custom";
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ListingStatistics: React.FC<ListingStatisticsProps> = ({
  statistics,
  statisticsLoading,
  dateRange,
  setDateRange,
  dateRangeType,
  open,
  setOpen,
}) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center gap-4">
        <DateRangePicker
          className="w-[280px]"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          open={open}
          onOpenChange={setOpen}
          useRedux={false}
        />
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tổng đặt phòng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.totalBookings}
              </p>
              <p className="text-xs text-gray-600 mt-1">Tổng lượt đặt chỗ</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Tổng doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics.totalRevenue)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Tổng doanh thu từ phòng này
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tỷ lệ lấp đầy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.occupancyRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Tỉ lệ lấp đầy trung bình
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Lượt xem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.totalViews}
              </p>
              <p className="text-xs text-gray-600 mt-1">Tổng lượt xem phòng</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Chart */}
      {statistics?.chartData && (
        <ListingRevenueChart
          chartData={statistics.chartData}
          dateRange={dateRangeType}
          loading={statisticsLoading || false}
        />
      )}

      {/* Bottom Statistics Cards */}
      {statistics && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Vouchers */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <Gift className="w-5 h-5 text-pink-600" />
                Top Vouchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.voucherDetails &&
                statistics.voucherDetails.length > 0 ? (
                  statistics.voucherDetails
                    .slice(0, 5)
                    .map((voucher: any, index: number) => (
                      <div
                        key={voucher.voucherId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          navigate(`/admin/vouchers/${voucher.voucherId}/usage`)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-pink-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {voucher.voucherCode}
                            </p>
                            <p className="text-xs text-gray-500">
                              {voucher.usageCount} lần sử dụng
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-pink-600">
                            {formatCurrency(voucher.totalDiscount)}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có voucher nào được sử dụng
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Top Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.serviceDetails &&
                statistics.serviceDetails.length > 0 ? (
                  statistics.serviceDetails
                    .slice(0, 5)
                    .map((service: any, index: number) => (
                      <div
                        key={service.serviceId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          navigate(`/admin/services/${service.serviceId}/usage`)
                        }
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
                            {formatCurrency(service.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có dịch vụ nào được sử dụng
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Thống kê khác
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Wishlist</p>
                      <p className="text-xs text-gray-500">Lượt yêu thích</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-red-600">
                      {statistics.wishlistCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Đánh giá trung bình</p>
                      <p className="text-xs text-gray-500">
                        {statistics.totalReviews} đánh giá
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-yellow-600">
                      {statistics.averageRating.toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ListingStatistics;
