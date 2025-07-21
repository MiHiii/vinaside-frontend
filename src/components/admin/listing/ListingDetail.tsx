import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchListingById, selectListing, selectListingsLoading, selectListingsError } from "@/store/slices/listingSlice";
import { fetchListingStatistics, selectListingStatistics } from "@/store/slices/listingSlice";
import { fetchReviewsByRoomId, selectReviews, selectReviewsLoading, selectReviewsError } from '@/store/slices/reviewSlice';
import { fetchServices } from '@/store/slices/serviceSlice';
import { fetchSafetyFeatures } from '@/store/slices/safetyFeatureSlice';
import { fetchHouseRules } from '@/store/slices/houseRuleSlice';
import { fetchVouchers } from '@/store/slices/voucherSlice';
import { Badge } from "@/components/ui/badge";
import { Home, Users, MapPin, Tag, ShieldCheck, Info, ArrowLeft, BarChart3, DollarSign, Star, CalendarCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Thêm type cho ChartDataPoint để fix lỗi typescript

type ChartDataPoint = {
  label: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const listing = useAppSelector(selectListing);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);
  const statistics = useAppSelector(selectListingStatistics) as (ReturnType<typeof selectListingStatistics> & { chartData?: ChartDataPoint[] });
  const reviews = useAppSelector(selectReviews);
  const reviewsLoading = useAppSelector(selectReviewsLoading);
  const reviewsError = useAppSelector(selectReviewsError);
  const navigate = useNavigate();

  // State cho date range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [open, setOpen] = React.useState(false);

  // Khi chọn ngày, log ra để BE tích hợp API sau
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      console.log("Chọn khoảng ngày:", dateRange);
      // TODO: dispatch(fetchListingStatistics({ id, startDate: dateRange.from, endDate: dateRange.to }))
    }
  }, [dateRange]);

  const services = useAppSelector((state) => state.service.services);
  const safetyFeatures = useAppSelector((state) => state.safetyFeature.safetyFeatures);
  const houseRules = useAppSelector((state) => state.houseRule.houseRules);
  const vouchers = useAppSelector((state) => state.voucher.vouchers);

  useEffect(() => {
    if (id) {
      dispatch(fetchListingById(id));
      dispatch(fetchListingStatistics({ id }));
    }
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
    dispatch(fetchVouchers({}));
  }, [id, dispatch]);

  useEffect(() => {
    if (id && dateRange?.from && dateRange?.to) {
      dispatch(fetchListingStatistics({
        id,
        startDate: dateRange.from.toISOString().slice(0, 10),
        endDate: dateRange.to.toISOString().slice(0, 10)
      }));
    }
  }, [id, dateRange, dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchReviewsByRoomId(id));
    }
  }, [id, dispatch]);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!listing) return <div className="p-8 text-center">Không tìm thấy listing</div>;

  // Hàm render sao
  const renderStars = (rating: number) => (
    <span className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </span>
  );

  const isDateRangeSelected = dateRange?.from && dateRange?.to;
  const now = new Date();
  const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <div className="min-h-screen  p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          className="mb-4 flex items-center gap-2 text-blue-600 hover:underline hover:text-blue-800"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
              {/* Đặt UI chọn ngày trước bảng đánh giá */}
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
                // Nếu Calendar hỗ trợ prop này, sẽ override style ngày được chọn
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Header Section */}
        <div className="bg-white p-8 mb-4 rounded-xl shadow flex flex-col md:flex-row gap-8 items-stretch min-h-[180px]">
          <div className="flex-shrink-0 flex items-center">
            <img
              src={listing.images?.[0] || "/placeholder.svg"}
              alt={listing.title}
              width={240}
              height={180}
              className="object-cover w-full md:w-60 h-40 rounded-lg"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2 justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-500" />
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs px-3 py-1">
                  {listing.status === "active" && "Hoạt động"}
                  {listing.status === "inactive" && "Không hoạt động"}
                  {listing.status === "draft" && "Bản nháp"}
                  {listing.status === "pending_approval" && "Chờ duyệt"}
                  {listing.status === "verified" && "Đã kiểm duyệt"}  
                </Badge>
                <span className="flex items-center gap-1">
                  {renderStars(statistics?.reviews?.averageRating || 0)}
                  <span className="font-semibold text-lg ml-1">
                    {Number(statistics?.reviews?.averageRating).toFixed(1) ?? '-'}
                  </span>
                  <span className="text-gray-500 text-sm">({statistics?.reviews?.totalReviews ?? 0} đánh giá)</span>
                </span>
              </div>
              <div className="flex items-center text-gray-500 mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {typeof listing.propertyId === "object" && listing.propertyId !== null
                    ? listing.propertyId.name
                    : listing.propertyId}
                </span>
              </div>
              <div className="flex items-center text-gray-500 mb-1">
                <Tag className="w-4 h-4 mr-2" />
                <span className="text-sm">Giá/đêm: </span>
                <span className="font-semibold text-blue-600 ml-1">{listing.price_per_night?.toLocaleString()}₫</span>
              </div>
              {/* Thông tin bổ sung */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Khách tối đa:</span>
                  <span className="font-semibold">{listing.max_guests}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Chính sách huỷ:</span>
                  <span className="font-semibold capitalize">
                    {listing.cancel_policy === "flexible" && "Linh hoạt"}
                    {listing.cancel_policy === "moderate" && "Vừa Phải"}
                    {listing.cancel_policy === "strict" && "Nghiêm ngặt"}
                    {!['flexible', 'moderate', 'strict'].includes(listing.cancel_policy) && listing.cancel_policy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-600">Bình luận:</span>
                  <span className="font-semibold">{listing.reviews_count ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="bg-gray-100 rounded px-2 py-1 text-gray-700 ml-1 flex-1 whitespace-pre-line">{listing.description}</span>
                </div>
              </div>
              {listing.service_ids && listing.service_ids.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">Dịch vụ:</span>
                  <span className="ml-2 text-gray-800">
                    {listing.service_ids.map(id => {
                      const s = services.find(s => s._id === id);
                      return s ? s.name : id;
                    }).join(', ')}
                  </span>
                </div>
              )}
              {listing.safety_features && listing.safety_features.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">Tính năng an toàn:</span>
                  <span className="ml-2 text-gray-800">
                    {listing.safety_features.map(id => {
                      const sf = safetyFeatures.find(sf => sf._id === id);
                      return sf ? sf.name : id;
                    }).join(', ')}
                  </span>
                </div>
              )}
              {listing.house_rules_selected && listing.house_rules_selected.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">Nội quy:</span>
                  <span className="ml-2 text-gray-800">
                    {listing.house_rules_selected.map(id => {
                      const hr = houseRules.find(hr => hr._id === id);
                      return hr ? hr.name : id;
                    }).join(', ')}
                  </span>
                </div>
              )}
              {listing.voucher_ids && listing.voucher_ids.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">Voucher áp dụng:</span>
                  <span className="ml-2 text-gray-800">
                    {listing.voucher_ids.map(id => {
                      const v = vouchers.find(v => v._id === id);
                      return v ? `${v.code} (${v.discount_percent}%)` : id;
                    }).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid thống kê chi tiết */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Tổng đặt phòng</span>
              <span className="text-2xl font-bold">{statistics.businessPerformance.totalBookings}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Users className="w-4 h-4 text-green-400" /> Tỉ lệ lấp đầy</span>
              <span className="text-2xl font-bold">{statistics.businessPerformance.occupancyRate}%</span>
              <Progress value={statistics.businessPerformance.occupancyRate} className="mt-2" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                {isDateRangeSelected
                  ? `Từ ${format(dateRange.from!, "dd/MM/yyyy")} đến ${format(dateRange.to!, "dd/MM/yyyy")}`
                  : `Doanh thu tháng ${currentMonthYear}`}
              </span>
              <span className="text-2xl font-bold">{statistics.businessPerformance.monthlyRevenue?.toLocaleString()}₫</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-red-400" /> Tỉ lệ huỷ</span>
              <span className="text-2xl font-bold">{statistics.businessPerformance.cancellationRate}%</span>
              <Progress value={statistics.businessPerformance.cancellationRate} className="mt-2 bg-red-100" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Khách quay lại</span>
              <span className="text-2xl font-bold">{statistics.businessPerformance.returningGuests}</span>
              {statistics.businessPerformance.returningGuests <= 100 && statistics.businessPerformance.returningGuests >= 0 && (
                <Progress value={statistics.businessPerformance.returningGuests} className="mt-2 bg-blue-100" />
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Điểm trung bình</span>
              <span className="text-2xl font-bold">{statistics.reviews.averageRating}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-purple-400" /> Tổng đánh giá</span>
              <span className="text-2xl font-bold">{statistics.reviews.totalReviews}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2 col-span-2 lg:col-span-1">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Info className="w-4 h-4 text-gray-400" /> Bình luận gần nhất</span>
              <span className="text-base text-gray-700 italic">{statistics.reviews.recentComment}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Lượt xem</span>
              <span className="text-2xl font-bold">{statistics.engagement.viewCount}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Star className="w-4 h-4 text-pink-400" /> Lượt wishlist</span>
              <span className="text-2xl font-bold">{statistics.engagement.wishlistCount}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-400" /> Tổng tiền giảm giá</span>
              <span className="text-2xl font-bold">{statistics.voucherImpact.totalDiscountAmount?.toLocaleString()}₫</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4 text-blue-400" /> Voucher phổ biến nhất</span>
              <span className="text-base text-gray-700">{statistics.voucherImpact.mostPopularVoucher}</span>
            </div>
          </div>
        )}

        {/* Biểu đồ doanh thu */}
        {statistics?.chartData && statistics.chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-semibold">Biểu đồ doanh thu</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={statistics.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}₫`} />
                <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Đánh giá gần đây dùng redux */}
        {reviewsLoading && <div className="p-4 text-center">Đang tải đánh giá...</div>}
        {reviewsError && <div className="p-4 text-center text-red-500">{reviewsError}</div>}
        {Array.isArray(reviews) && reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-semibold">Đánh giá gần đây</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2">Khách hàng</th>
                    <th className="py-2 px-2">Đánh giá</th>
                    <th className="py-2 px-2">Bình luận</th>
                    <th className="py-2 px-2">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="py-2 px-2 font-semibold flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold uppercase">
                          {r.user?.name?.charAt(0) || "?"}
                        </span>
                        {r.user?.name || "Ẩn danh"}
                      </td>
                      <td className="py-2 px-2 flex items-center gap-1">
                        {renderStars(r.rating)}
                        <span className="ml-1 font-semibold">{r.rating}</span>
                      </td>
                      <td className="py-2 px-2 text-gray-700">{r.comment}</td>
                      <td className="py-2 px-2 text-gray-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 