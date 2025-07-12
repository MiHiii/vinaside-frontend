import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useParams } from "react-router-dom";
import { fetchPropertyStatistics, selectPropertyStatistics, selectPropertyStatisticsLoading, selectPropertyStatisticsError, fetchPropertyById, selectPropertyDetail } from "@/store/slices/propertySlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users, Calendar as CalendarIcon, DollarSign, Star, TrendingUp, MapPin, Bed, UserCheck
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PropertyStatistics } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export default function PropertyDetailView() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectPropertyStatistics) as PropertyStatistics | null;
  const loading = useAppSelector(selectPropertyStatisticsLoading);
  const error = useAppSelector(selectPropertyStatisticsError);
  const propertyDetail = useAppSelector(selectPropertyDetail);

  // State cho chọn ngày
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id) {
      // Giả sử fetchPropertyStatistics nhận thêm tham số dateRange
      dispatch(fetchPropertyStatistics({ id, dateRange }));
      dispatch(fetchPropertyById(id));
    }
  }, [id, dateRange, dispatch]);

  // Không return loading/error toàn trang nữa
  // Hiển thị loading/error ở từng phần bên dưới

  // Prepare chart data
  const ratingChartData = data?.reviewAnalysis?.ratingDistribution
    ? Object.entries(data.reviewAnalysis.ratingDistribution).map(([rating, count]) => ({
        rating: `${rating} sao`,
        count: count as number,
      }))
    : [];
  const bookingChartData = Array.isArray(data?.timeStatistics?.peakBookingDays)
    ? data.timeStatistics.peakBookingDays.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN"),
        bookings: item.bookingCount,
      })) 
    : [];
  // Lấy dữ liệu chartData từ BE
  const revenueChartData = Array.isArray(data?.chartData)
    ? data.chartData.map((item) => ({
        label: item.label,
        revenue: item.revenue,
        bookings: item.bookings,
        occupancyRate: item.occupancyRate,
      }))
    : [];

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
  ));

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Date Range Picker Popover (theo style ListingDetail) */}
        <div className="flex items-center gap-4 mb-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={"w-[280px] justify-start text-left font-normal"}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                  : "Chọn khoảng ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-lg border border-gray-200" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                initialFocus
                className="!bg-white rounded-xl p-2"
                modifiersClassNames={{
                  range_start: "!bg-black !text-white",
                  range_end: "!bg-black !text-white",
                  today: "border border-blue-400"
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Header Section */}
        <Card className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-4 md:p-6 border-0 !border-none w-full">
          <img
            src={propertyDetail?.thumbnail || "/placeholder.svg"}
            alt={propertyDetail?.name || ""}
            className="object-cover rounded-lg w-full max-w-xs md:w-60 h-40"
          />
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{propertyDetail?.name || "(Không có tên)"}</h1>
            <p className="text-gray-600">{propertyDetail?.description || ""}</p>
            <div className="flex items-center gap-4 text-gray-500">
              <MapPin className="w-5 h-5" />
              <span>{propertyDetail?.location?.address}{propertyDetail?.location?.district ? `, ${propertyDetail.location.district}` : ""}{propertyDetail?.location?.city ? `, ${propertyDetail.location.city}` : ""}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <CalendarIcon className="w-5 h-5" />
              <span>Tạo ngày: {propertyDetail?.createdAt ? formatDate(propertyDetail.createdAt) : "-"}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {renderStars(Math.round(data?.reviewAnalysis?.averageRating || 0))}
              <span className="font-semibold text-lg">{(data?.reviewAnalysis?.averageRating ?? 0).toFixed(1)}</span>
              <span className="text-sm text-gray-500">({data?.reviewAnalysis?.totalReviews ?? 0} đánh giá)</span>
            </div>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
            <Bed className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold">{data?.roomOverview?.totalRooms ?? 0}</div>
            <div className="text-xs text-gray-500">{data?.roomOverview?.activeRooms ?? 0} phòng đang hoạt động</div>
            <Progress
              value={data?.roomOverview?.activeRooms && data?.roomOverview?.totalRooms ? (data.roomOverview.activeRooms / data.roomOverview.totalRooms) * 100 : 0}
              className="h-2 w-full mt-2"
            />
          </Card>
          <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
            <CalendarCheck className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold">{data?.bookingPerformance?.totalBookings ?? 0}</div>
            <div className="text-xs text-gray-500">Tỷ lệ thành công: {data?.bookingPerformance?.successRate ?? 0}%</div>
          </Card>
          <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
            <Users className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold">{data?.customerStatistics?.uniqueCustomers ?? 0}</div>
            <div className="text-xs text-gray-500">{data?.customerStatistics?.returnCustomerRate ?? 0}% khách quay lại</div>
          </Card>
          <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
            <TrendingUp className="w-8 h-8 text-primary mb-2" />
            <div className="text-3xl font-bold">{data?.roomOverview?.roomUtilizationRate?.toFixed(1) ?? "0.0"}%</div>
            <div className="text-xs text-gray-500">{data?.roomOverview?.roomsWithBookings ?? 0}/{data?.roomOverview?.totalRooms ?? 0} phòng có booking</div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="p-4 border-0 !border-none">
            <CardHeader>
              <CardTitle>Phân bố đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : !data ? (
                <div className="text-center py-8">Không có dữ liệu thống kê</div>
              ) : (
                <BarChart width={350} height={200} data={ratingChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Bar dataKey="count" fill="#22c55e" radius={4} />
                </BarChart>
              )}
            </CardContent>
          </Card>
          <Card className="p-4 border-0 !border-none">
            <CardHeader>
              <CardTitle>Ngày đặt phòng cao điểm</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : !data ? (
                <div className="text-center py-8">Không có dữ liệu thống kê</div>
              ) : (
                <BarChart width={350} height={200} data={bookingChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Bar dataKey="bookings" fill="#fb923c" radius={4} />
                </BarChart>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="p-4 border-0 !border-none w-full overflow-x-auto">
          <div className="w-[600px] md:w-full">
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : !data ? (
                <div className="text-center py-8">Không có dữ liệu thống kê</div>
              ) : (
                typeof ChartContainer !== "undefined" ? (
                  <ChartContainer>
                    <BarChart width={700} height={250} data={revenueChartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      {typeof ChartTooltip !== "undefined" && typeof ChartTooltipContent !== "undefined" ? (
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      ) : null}
                      <Bar dataKey="revenue" fill="var(--chart-1)" radius={8} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <BarChart width={700} height={250} data={revenueChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Bar dataKey="revenue" fill="#22c55e" radius={8} />
                  </BarChart>
                )
              )}
            </CardContent>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 flex flex-col gap-2 border-0 !border-none">
            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : !data ? (
              <div className="text-center py-8">Không có dữ liệu thống kê</div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Thống kê doanh thu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tổng doanh thu:</span>
                  <span className="font-semibold">{data.revenueAndPricing?.totalRevenue?.toLocaleString("vi-VN") ?? 0} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Giá trung bình/đêm:</span>
                  <span className="font-semibold">{data.revenueAndPricing?.averagePricePerNight?.toLocaleString("vi-VN") ?? 0} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tổng đêm đã đặt:</span>
                  <span className="font-semibold">{data.revenueAndPricing?.totalNightsBooked ?? 0}</span>
                </div>
              </>
            )}
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-0 !border-none">
            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : !data ? (
              <div className="text-center py-8">Không có dữ liệu thống kê</div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Thống kê khách hàng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Khách duy nhất:</span>
                  <span className="font-semibold">{data.customerStatistics?.uniqueCustomers ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Khách quay lại:</span>
                  <span className="font-semibold">{data.customerStatistics?.returnCustomers ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Booking TB/khách:</span>
                  <span className="font-semibold">{data.customerStatistics?.averageBookingsPerCustomer ?? 0}</span>
                </div>
              </>
            )}
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-0 !border-none">
            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : !data ? (
              <div className="text-center py-8">Không có dữ liệu thống kê</div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Thống kê thời gian</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Thời gian lưu trú TB:</span>
                  <span className="font-semibold">{data.timeStatistics?.averageStayDurationText ?? ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Booking sớm nhất:</span>
                  <span className="font-semibold text-xs">{data.timeStatistics?.earliestBookingDate ? formatDate(data.timeStatistics.earliestBookingDate) : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Booking muộn nhất:</span>
                  <span className="font-semibold text-xs">{data.timeStatistics?.latestBookingDate ? formatDate(data.timeStatistics.latestBookingDate) : "-"}</span>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card className="p-6 border-0 !border-none w-full">
          <CardHeader>
            <CardTitle>Đánh giá gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : !data ? (
              <div className="text-center py-8">Không có dữ liệu thống kê</div>
            ) : (
              <div className="rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-[600px] bg-white rounded-xl border-0 !border-none">
                  <thead className="bg-gray-100">
                    <tr className="border-0 !border-none">
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">Khách hàng</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">Phòng</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">Đánh giá</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">Bình luận</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reviewAnalysis?.recentReviews?.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50 transition border-0 !border-none">
                        <td className="py-3 px-4 border-0 !border-none">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.userAvatar || undefined} />
                              <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{review.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 border-0 !border-none">{review.listingTitle}</td>
                        <td className="py-3 px-4 border-0 !border-none">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-1 text-sm font-medium">{review.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm border-0 !border-none">{review.comment}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 border-0 !border-none">{formatDate(review.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 