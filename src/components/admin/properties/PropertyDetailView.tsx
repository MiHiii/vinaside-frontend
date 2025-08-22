import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPropertyStatistics,
  selectPropertyStatistics,
  selectPropertyStatisticsLoading,
  selectPropertyStatisticsError,
  fetchPropertyById,
  selectPropertyDetail,
  fetchPropertyRoomStatus,
  selectPropertyRoomStatus,
  fetchPropertyRooms,
  selectPropertyRooms,
} from "@/store/slices/propertySlice";
import { fetchListings, selectListings } from "@/store/slices/listingSlice";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Star,
  TrendingUp,
  MapPin,
  UserCheck,
  RefreshCw,
  List,
  BarChart3,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/admin/dasboard/DateRangePicker";
import PropertyRevenueChart from "./PropertyRevenueChart";
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyRoomsList from "./PropertyRoomsList";

export default function PropertyDetailView() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const data = useAppSelector(selectPropertyStatistics) as any;
  const loading = useAppSelector(selectPropertyStatisticsLoading);
  const error = useAppSelector(selectPropertyStatisticsError);
  const propertyDetail = useAppSelector(selectPropertyDetail);
  const listings = useAppSelector(selectListings);
  const roomStatus = useAppSelector((state) =>
    id ? selectPropertyRoomStatus(state, id) : undefined
  );
  const propertyRooms = useAppSelector(selectPropertyRooms);

  // State cho date range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );
  const [open, setOpen] = React.useState(false);
  const [dateRangeType, setDateRangeType] = React.useState<
    "today" | "last_7_days" | "last_15_days" | "last_30_days" | "custom"
  >("custom");
  const [activeTab, setActiveTab] = React.useState<"statistics" | "rooms">(
    "statistics"
  );

  // Đóng popover khi chọn đủ ngày
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setOpen(false);
    }
  }, [dateRange]);

  // Function to fetch property statistics
  const fetchData = React.useCallback(
    (dateRangeParam?: DateRange, dateRangeTypeParam?: typeof dateRangeType) => {
      if (!id) return;

      const range = dateRangeParam || dateRange;
      const type = dateRangeTypeParam || dateRangeType;

      if (range?.from && range?.to) {
        if (type === "custom") {
          dispatch(
            fetchPropertyStatistics({
              id,
              dateRange: "custom",
              startDate: format(range.from, "yyyy-MM-dd"),
              endDate: format(range.to, "yyyy-MM-dd"),
            })
          );
        } else {
          dispatch(
            fetchPropertyStatistics({
              id,
              dateRange: type,
            })
          );
        }
      } else {
        // Không truyền dateRange nếu không có range
        dispatch(
          fetchPropertyStatistics({
            id,
          })
        );
      }
    },
    [id, dateRange, dateRangeType, dispatch]
  );

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    console.log("🔄 PropertyDetailView: Date range changed:", newDateRange);
    setDateRange(newDateRange);
    setDateRangeType("custom");
    if (newDateRange?.from && newDateRange?.to) {
      fetchData(newDateRange, "custom");
    }
  };

  useEffect(() => {
    if (id) {
      // Gọi API không có dateRange khi component mount
      dispatch(
        fetchPropertyStatistics({
          id,
        })
      );
      dispatch(fetchPropertyById(id));
    }
  }, [id, dispatch]);

  // Fetch rooms data when switching to rooms tab
  useEffect(() => {
    if (id && activeTab === "rooms") {
      // Use new API to get full rooms including inactive
      dispatch(fetchPropertyRooms(id));
    }
  }, [id, activeTab, dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    if (id) {
      // Gọi API không có dateRange khi refresh
      dispatch(
        fetchPropertyStatistics({
          id,
        })
      );
    }
  };

  // Loading and error handling
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  // Debug: log property statistics data
  console.log("Property statistics data:", data);

  return (
    <div className="px-4 py-8 m-auto max-w-8xl">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <div className="flex items-center justify-between">
          <TabsList className="flex items-center gap-2 mb-2">
            <TabsTrigger
              value="statistics"
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-100 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              Thống kê
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-100 cursor-pointer"
            >
              <List className="w-4 h-4" />
              Danh sách phòng
            </TabsTrigger>
          </TabsList>
          <div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white border-gray-200 hover:bg-gray-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        <TabsContent value="statistics" className="mt-0">
          {/* Header with date picker and refresh button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DateRangePicker
                className="w-[280px]"
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                open={open}
                onOpenChange={setOpen}
                useRedux={false}
              />
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row gap-10 items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
            <img
              src={propertyDetail?.thumbnail || "/placeholder.svg"}
              alt={data?.propertyName || propertyDetail?.name || ""}
              className="object-cover rounded-lg w-full max-w-xs md:w-60 h-40"
            />
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {data?.propertyName || propertyDetail?.name || "(Không có tên)"}
              </h1>
              <p className="text-gray-600">
                {propertyDetail?.description || ""}
              </p>
              <div className="flex gap-4 text-gray-500 mt-2">
                <MapPin className="w-5 h-5" />{" "}
                {propertyDetail?.location?.address}
                {propertyDetail?.location?.district
                  ? `, ${propertyDetail.location.district}`
                  : ""}
                {propertyDetail?.location?.city
                  ? `, ${propertyDetail.location.city}`
                  : ""}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {renderStars(Math.round(data?.reviewStats?.averageRating || 0))}
                <span className="font-semibold text-lg">
                  {(data?.reviewStats?.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({data?.reviewStats?.totalReviews ?? 0} đánh giá)
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none bg-white">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <div className="text-3xl font-bold">
                {data?.occupancyStats?.occupancyRate?.toFixed(1) ?? "0.0"}%
              </div>
              <div className="text-xs text-gray-500">Tỷ lệ lấp đầy</div>
            </Card>
            <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none bg-white">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <div className="text-3xl font-bold">
                {data?.bookingPerformance?.totalBookings ?? 0}
              </div>
              <div className="text-xs text-gray-500">Tổng booking</div>
            </Card>
            <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none bg-white">
              <DollarSign className="w-8 h-8 text-primary mb-2" />
              <div className="text-3xl font-bold">
                {data?.totalRevenue?.toLocaleString("vi-VN") ?? 0}₫
              </div>
              <div className="text-xs text-gray-500">Tổng doanh thu</div>
            </Card>
            <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none bg-white">
              <UserCheck className="w-8 h-8 text-primary mb-2" />
              <div className="text-3xl font-bold">{data?.totalUsers ?? 0}</div>
              <div className="text-xs text-gray-500">Tổng khách hàng</div>
            </Card>
          </div>

          {/* Revenue Chart */}
          <div className="mb-8">
            <PropertyRevenueChart
              chartData={data?.chartData || []}
              dateRange={data?.dateRange}
              loading={loading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Biểu đồ phân bố đánh giá */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-lg gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Phân bố đánh giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  width={300}
                  height={200}
                  data={
                    data?.reviewStats?.ratingDistribution
                      ? Object.entries(data.reviewStats.ratingDistribution).map(
                          ([rating, count]) => ({
                            rating: `${rating} sao`,
                            count: Number(count),
                          })
                        )
                      : []
                  }
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="rating" />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="count" fill="#fbbf24" radius={4} />
                </BarChart>
              </CardContent>
            </Card>

            {/* Top Vouchers */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-lg gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Top Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data?.voucherStats?.topVouchers || [])
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
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">
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
                          <p className="font-bold text-sm text-purple-600">
                            {voucher.totalDiscount?.toLocaleString("vi-VN") ||
                              0}
                            ₫
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
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Top Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data?.serviceStats?.topServices || [])
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
                            {service.totalRevenue?.toLocaleString("vi-VN") || 0}
                            ₫
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="mt-0">
          {(() => {
            const roomsAsListings = Array.isArray(propertyRooms)
              ? propertyRooms.map((r: any) => ({
                  _id: r.listingId,
                  title: r.title,
                  images: r.images,
                  price_per_night: r.price_per_night,
                  // Weekend surcharge info
                  has_weekend_surcharge: r.has_weekend_surcharge,
                  weekend_surcharge_percent: r.weekend_surcharge_percent,
                  // Property info
                  propertyId: r.propertyId || {
                    _id: id,
                    name: propertyDetail?.name || "Không rõ",
                  },
                  // Provide both listingStatus and booking status
                  listingStatus: r.listingStatus,
                  status: r.status,
                }))
              : [];
            return (
              <PropertyRoomsList
                listings={roomsAsListings}
                roomStatus={{}}
                propertyId={id}
              />
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
