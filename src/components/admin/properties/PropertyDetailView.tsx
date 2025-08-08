import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useParams, Link } from "react-router-dom";
import {
  fetchPropertyStatistics,
  selectPropertyStatistics,
  fetchPropertyById,
  selectPropertyDetail,
  fetchPropertyRoomStatus,
  selectPropertyRoomStatus,
} from "@/store/slices/propertySlice";
import { fetchListings, selectListings } from "@/store/slices/listingSlice";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Star,
  TrendingUp,
  MapPin,
  UserCheck,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyStatistics } from "@/types/property";
import { DateRangePicker } from "@/components/admin/dasboard/DateRangePicker";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

type RevenueByRoom = {
  listingId: string;
  listingTitle: string;
  revenue: number;
  bookings: number;
  totalNights: number;
  averageRevenuePerNight: number;
};
type MonthlyRevenue = {
  month: string;
  revenue: number;
  bookings: number;
};

export default function PropertyDetailView() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const data = useAppSelector(
    selectPropertyStatistics
  ) as PropertyStatistics | null;
  // const loading = useAppSelector(selectPropertyStatisticsLoading);
  // const error = useAppSelector(selectPropertyStatisticsError);
  const propertyDetail = useAppSelector(selectPropertyDetail);
  const roomStatus = useAppSelector((state) =>
    id ? selectPropertyRoomStatus(state, id) : undefined
  );
  const listings = useAppSelector(selectListings);

  // State cho date range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );
  const [open, setOpen] = React.useState(false);

  // Đóng popover khi chọn đủ ngày
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setOpen(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (id) {
      // Nếu đã chọn khoảng ngày, truyền dateRange cho fetchPropertyStatistics
      if (dateRange?.from && dateRange?.to) {
        dispatch(fetchPropertyStatistics({ id, dateRange }));
      } else {
        dispatch(fetchPropertyStatistics({ id }));
      }
      dispatch(fetchPropertyById(id));
      dispatch(fetchPropertyRoomStatus(id));
      dispatch(fetchListings({ propertyId: id }));
    }
  }, [id, dateRange, dispatch]);

  // Không return loading/error toàn trang nữa
  // Hiển thị loading/error ở từng phần bên dưới

  // Không cần prepare chart data trung gian, dùng trực tiếp dưới render với type an toàn

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

  // Debug: log trạng thái phòng và id các listing
  console.log("roomStatus:", roomStatus);
  console.log("listing._id:", listings && listings.map((l) => l._id));

  // Type-safe extraction for overview and customerInsights
  const overview =
    data && "overview" in data
      ? (data as { overview?: { utilizationRate?: number } }).overview
      : undefined;
  const customerInsights =
    data && "customerInsights" in data
      ? (
          data as {
            customerInsights?: {
              returningGuests?: number;
              returningGuestRate?: number;
            };
          }
        ).customerInsights
      : undefined;

  return (
    <div className="px-4 py-8 m-auto max-w-7xl">
      {/* UI chọn ngày giống bên listing detail */}
      <div className="flex items-center gap-4 mb-8">
        <DateRangePicker
          className="w-[280px]"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          open={open}
          onOpenChange={setOpen}
          useRedux={false}
        />
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        <img
          src={propertyDetail?.thumbnail || "/placeholder.svg"}
          alt={propertyDetail?.name || ""}
          className="object-cover rounded-lg w-full max-w-xs md:w-60 h-40"
        />
        <div>
          <h1 className="text-3xl font-bold">
            {propertyDetail?.name || "(Không có tên)"}
          </h1>
          <p className="text-gray-600">{propertyDetail?.description || ""}</p>
          <div className="flex gap-4 text-gray-500 mt-2">
            <MapPin className="w-5 h-5" /> {propertyDetail?.location?.address}
            {propertyDetail?.location?.district
              ? `, ${propertyDetail.location.district}`
              : ""}
            {propertyDetail?.location?.city
              ? `, ${propertyDetail.location.city}`
              : ""}
            <CalendarIcon className="w-5 h-5 ml-4" /> Tạo ngày:{" "}
            {propertyDetail?.createdAt
              ? formatDate(propertyDetail.createdAt)
              : "-"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {renderStars(Math.round(data?.reviewAnalysis?.averageRating || 0))}
            <span className="font-semibold text-lg">
              {(data?.reviewAnalysis?.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({data?.reviewAnalysis?.totalReviews ?? 0} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
          <TrendingUp className="w-8 h-8 text-primary mb-2" />
          <div className="text-3xl font-bold">
            {overview?.utilizationRate?.toFixed(1) ?? "0.0"}%
          </div>
          <div className="text-xs text-gray-500">Tỷ lệ sử dụng phòng</div>
        </Card>
        <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
          <TrendingUp className="w-8 h-8 text-primary mb-2" />
          <div className="text-3xl font-bold">
            {data?.bookingPerformance?.totalBookings ?? 0}
          </div>
          <div className="text-xs text-gray-500">Tổng booking</div>
        </Card>
        <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
          <DollarSign className="w-8 h-8 text-primary mb-2" />
          <div className="text-3xl font-bold">
            {data?.revenueAndPricing?.totalRevenue?.toLocaleString("vi-VN") ??
              0}
            ₫
          </div>
          <div className="text-xs text-gray-500">Tổng doanh thu</div>
        </Card>
        <Card className="flex flex-col items-center gap-2 p-4 border-0 !border-none">
          <UserCheck className="w-8 h-8 text-primary mb-2" />
          <div className="text-3xl font-bold">
            {customerInsights?.returningGuests ?? 0}
            <span className="text-base text-gray-500 ml-1">
              ({customerInsights?.returningGuestRate?.toFixed(1) ?? "0.0"}%)
            </span>
          </div>
          <div className="text-xs text-gray-500">Khách quay lại</div>
        </Card>
      </div>

      {/* Bảng danh sách phòng chi tiết */}
      <Card className="p-4 border-0 !border-none w-full overflow-x-auto mb-8">
        <CardHeader>
          <CardTitle>Danh sách phòng</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full min-w-0 table-auto bg-white rounded-xl border-0 !border-none">
            <thead className="bg-gray-100">
              <tr className="border-0 !border-none">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Ảnh
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Tên phòng
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Giá/đêm
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Đánh giá
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {listings &&
                listings
                  .filter(
                    (l) =>
                      l.propertyId === id ||
                      (typeof l.propertyId === "object" &&
                        l.propertyId?._id === id)
                  )
                  .map((listing) => (
                    <tr
                      key={listing._id}
                      className="hover:bg-gray-50 transition border-0 !border-none"
                    >
                      <td className="py-3 px-4 border-0 !border-none">
                        <Link
                          to={`/admin/listings/${listing._id}`}
                          className="block"
                        >
                          <img
                            src={listing.images?.[0] || "/placeholder.svg"}
                            alt={listing.title}
                            className="w-16 h-12 object-cover rounded hover:opacity-80 transition"
                          />
                        </Link>
                      </td>
                      <td className="py-3 px-4 border-0 !border-none font-semibold">
                        <Link
                          to={`/admin/listings/${listing._id}`}
                          className="hover:underline text-primary"
                        >
                          {listing.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 border-0 !border-none">
                        {listing.price_per_night?.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="py-3 px-4 border-0 !border-none">
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(listing.average_rating || 0))}
                          <span className="ml-1 text-sm font-medium">
                            {(listing.average_rating ?? 0).toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 border-0 !border-none">
                        {/* Nếu phòng bảo trì thì chỉ hiển thị badge bảo trì, nếu hoạt động thì chỉ hiển thị trạng thái booking */}
                        <div className="flex flex-col gap-1">
                          {listing.status === 'inactive' ? (
                            <span className="px-2 py-3 text-sm font-semibold rounded-full bg-red-100 text-red-800 text-center">
                              Sửa chữa - Bảo trì
                            </span>
                          ) : (
                            (() => {
                              const listingId = String(listing._id);
                              const raw = roomStatus && roomStatus[listingId];
                              const status =
                                raw && typeof raw === "object"
                                  ? (raw as { status?: string }).status
                                  : raw;
                              if (status === "available")
                                return (
                                  <span className="bg-green-100 text-blue-700 rounded-full px-2 py-3 text-center ">
                                    Còn trống
                                  </span>
                                );
                              if (status === "reserved")
                                return (
                                  <span className="bg-orange-100 text-orange-700 rounded-full px-2 py-3 text-sm text-center">
                                    Đã đặt
                                  </span>
                                );
                              if (status === "booked" || status === "occupied")
                                return (
                                  <span className="bg-purple-100 text-purple-700 rounded-full px-2 py-3 text-sm text-center">
                                    Đang chờ xác nhận
                                  </span>
                                );
                              return (
                                <span className="bg-gray-100 text-gray-700 rounded-full px-2 py-3 text-sm text-center">
                                  Không rõ
                                </span>
                              );
                            })()
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Bảng doanh thu theo phòng */}
      <Card className="p-4 border-0 !border-none w-full overflow-x-auto mb-8">
        <CardHeader>
          <CardTitle>Bảng doanh thu theo phòng</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full min-w-0 table-auto rounded-xl border-0 !border-none">
            <thead className="bg-gray-100">
              <tr className="border-0 !border-none">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Phòng
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Số booking
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Tổng đêm
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Doanh thu/đêm
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {data &&
                Array.isArray(
                  data.revenueAndPricing &&
                    (
                      data.revenueAndPricing as unknown as {
                        revenueByRoom?: RevenueByRoom[];
                      }
                    ).revenueByRoom
                ) &&
                (
                  data.revenueAndPricing as unknown as {
                    revenueByRoom: RevenueByRoom[];
                  }
                ).revenueByRoom.map((room) => (
                  <tr
                    key={room.listingId}
                    className="hover:bg-gray-50 transition border-0 !border-none"
                  >
                    <td className="py-3 px-4 border-0 !border-none">
                      <Link
                        to={`/admin/listings/${room.listingId}`}
                        className="text-primary"
                      >
                        {room.listingTitle}
                      </Link>
                    </td>
                    <td className="py-3 px-4 border-0 !border-none">
                      {room.bookings}
                    </td>
                    <td className="py-3 px-4 border-0 !border-none">
                      {room.totalNights}
                    </td>
                    <td className="py-3 px-4 border-0 !border-none">
                      {room.averageRevenuePerNight?.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="py-3 px-4 border-0 !border-none">
                      {room.revenue?.toLocaleString("vi-VN")}₫
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Bảng doanh thu theo tháng */}
      <Card className="p-4 border-0 !border-none w-full overflow-x-auto mb-8">
        <CardHeader>
          <CardTitle>Bảng doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full min-w-0 table-auto bg-white rounded-xl border-0 !border-none">
            <thead className="bg-gray-100">
              <tr className="border-0 !border-none">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Tháng
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Doanh thu
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-0 !border-none">
                  Số booking
                </th>
              </tr>
            </thead>
            <tbody>
              {data &&
                Array.isArray(
                  data.revenueAndPricing &&
                    (
                      data.revenueAndPricing as unknown as {
                        monthlyRevenue?: MonthlyRevenue[];
                      }
                    ).monthlyRevenue
                ) &&
                (
                  data.revenueAndPricing as unknown as {
                    monthlyRevenue: MonthlyRevenue[];
                  }
                ).monthlyRevenue.map((month) => (
                  <tr
                    key={month.month}
                    className="hover:bg-gray-50 transition border-0 !border-none"
                  >
                    <td className="py-3 px-4 border-0 !border-none">
                      {month.month}
                    </td>
                    <td className="py-3 px-4 border-0 !border-none">
                      {month.revenue?.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="py-3 px-4 border-0 !border-none">
                      {month.bookings}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Charts Section: Đưa biểu đồ phân bố đánh giá lên trước doanh thu theo phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Biểu đồ phân bố đánh giá */}
        <Card className="p-4 border-0 !border-none">
          <CardHeader>
            <CardTitle>Biểu đồ phân bố đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              width={350}
              height={200}
              data={
                data?.reviewAnalysis?.ratingDistribution
                  ? Object.entries(data.reviewAnalysis.ratingDistribution).map(
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
        {/* Biểu đồ doanh thu theo ngày */}
        <Card className="p-4 border-0 !border-none">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              width={350}
              height={200}
              data={Array.isArray(data?.chartData) ? data.chartData : []}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Bar dataKey="revenue" fill="#22c55e" radius={4} />
            </BarChart>
          </CardContent>
        </Card>
      </div>
      {/* Biểu đồ doanh thu theo phòng */}
      <div className="mb-8">
        <Card className="p-4 border-0 !border-none">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu theo phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              width={Math.max(900, (listings.length || 8) * 120)}
              height={350}
              data={
                data &&
                Array.isArray(
                  data.revenueAndPricing &&
                    (
                      data.revenueAndPricing as unknown as {
                        revenueByRoom?: RevenueByRoom[];
                      }
                    ).revenueByRoom
                )
                  ? (
                      data.revenueAndPricing as unknown as {
                        revenueByRoom: RevenueByRoom[];
                      }
                    ).revenueByRoom
                  : []
              }
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="listingTitle"
                angle={0}
                interval={0}
                tick={{ fontSize: 16 }}
                tickMargin={16}
              />
              <YAxis />
              <Bar dataKey="revenue" fill="#38bdf8" radius={4} barSize={36} />
            </BarChart>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ số booking theo ngày */}
      <div className="mb-8">
        <Card className="p-4 border-0 !border-none">
          <CardHeader>
            <CardTitle>Biểu đồ số booking theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              width={600}
              height={250}
              data={Array.isArray(data?.chartData) ? data.chartData : []}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Bar dataKey="bookings" fill="#6366f1" radius={4} />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
