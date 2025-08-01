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
import { fetchBookingsByListing } from '@/store/slices/bookingSlice';
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
  
  // State cho image pagination
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Đóng popover khi chọn đủ ngày
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setOpen(false);
    }
  }, [dateRange]);

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
  // const vouchers = useAppSelector((state) => state.voucher.vouchers);
  const bookings = useAppSelector(state => state.booking.bookingsByListing) ?? [];

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

  useEffect(() => {
    if (listing && listing.propertyId && listing._id) {
      const propertyId = typeof listing.propertyId === 'object' ? listing.propertyId._id : listing.propertyId;
      dispatch(fetchBookingsByListing({ propertyId, listingId: listing._id }));
    }
  }, [listing, dispatch]);

  useEffect(() => {
    if (id) {
      fetch(`/api/v1/listings/${id}/view`, { method: "GET" });
    }
  }, [id]);

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

  // Hàm chuyển trạng thái booking sang tiếng Việt
  const getBookingStatusVN = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã huỷ';
      case 'completed': return 'Hoàn thành';
      case 'paid': return 'Đã thanh toán';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  // Hàm lấy class màu theo trạng thái booking
  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'paid': return 'bg-teal-100 text-teal-800 border border-teal-300';
      case 'rejected': return 'bg-gray-200 text-gray-700 border border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen  p-4 md:p-6 lg:p-8">
      <div className=" space-y-8">
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
                className={"w-[280px] justify-start text-left font-normal border-none"}
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
              {dateRange?.from || dateRange?.to ? (
                <div className="flex justify-end px-4 pb-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                    Xóa ngày
                  </Button>
                </div>
              ) : null}
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
                  <span className="  px-2 py-1 text-gray-700 ml-1 flex-1 whitespace-pre-line">{listing.description}</span>
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
            
            </div>
          </div>
        </div>

        {/* Gallery Section - Hiển thị tất cả ảnh của phòng */}
        {listing.images && listing.images.length > 0 && (
          <div className=" p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xl font-semibold">Thư viện ảnh phòng ({listing.images.length} ảnh)</span>
            </div>
            <div className="relative">
              <div 
                className="flex gap-4 overflow-hidden relative hide-scrollbar" 
                style={{ 
                  width: '100%', 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                {listing.images.slice(currentImageIndex, currentImageIndex + 5).map((image, index) => (
                  <div 
                    key={currentImageIndex + index} 
                    className={`relative group flex-shrink-0 transition-all duration-700 ease-out hover:scale-105 ${
                      isTransitioning ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      width: 'calc((100% - 64px) / 5)',
                      transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                      opacity: isTransitioning ? 0.8 : 1
                    }}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - Ảnh ${currentImageIndex + index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer filter hover:brightness-110"
                      onClick={() => {
                        // Có thể thêm modal để xem ảnh full size
                        window.open(image, '_blank');
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-blue-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-opacity-90">
                      {currentImageIndex + index + 1}
                    </div>
                    {currentImageIndex + index === 0 && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                        Ảnh chính
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mũi tên trái */}
                {listing.images.length > 5 && currentImageIndex > 0 && (
                  <button
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentImageIndex(prev => Math.max(0, prev - 1));
                        setIsTransitioning(false);
                      }, 300);
                    }}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full p-3 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-125 hover:-translate-x-3 z-10 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Mũi tên phải */}
                {listing.images.length > 5 && currentImageIndex < listing.images.length - 1 && (
                  <button
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentImageIndex(prev => Math.min(listing.images.length - 1, prev + 1));
                        setIsTransitioning(false);
                      }, 300);
                    }}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full p-3 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-125 hover:translate-x-3 z-10 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  </button>
                )}
              </div>
              
              {/* Counter ở dưới */}
              {/* {listing.images.length > 5 && (
                <div className="flex justify-center mt-4">
                  <span className="text-sm text-gray-700 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-gray-200 transition-all duration-300 hover:bg-opacity-100 hover:shadow-xl">
                    {currentImageIndex + 1} / {listing.images.length}
                  </span>
                </div>
              )} */}
            </div>
            {listing.images.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Chưa có ảnh nào</p>
              </div>
            )}
          </div>
        )}

        {/* Grid thống kê chi tiết */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Tổng đặt phòng</span>
              <span className="text-2xl font-bold">{statistics.businessPerformance.totalBookings}</span>
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
              <span className="text-sm text-gray-500 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Điểm trung bình</span>
              <span className="text-2xl font-bold">{statistics.reviews.averageRating}</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-purple-400" /> Tổng đánh giá</span>
              <span className="text-2xl font-bold">{statistics.reviews.totalReviews}</span>
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

        {/* Bảng bookings của phòng */}
        {Array.isArray(bookings) && bookings.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-semibold">Danh sách booking của phòng này</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2">Khách hàng</th>
                    <th className="py-2 px-2">Check-in</th>
                    <th className="py-2 px-2">Check-out</th>
                    <th className="py-2 px-2">Số khách</th>
                    <th className="py-2 px-2">Tổng tiền</th>
                    <th className="py-2 px-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b last:border-0">
                      <td className="py-2 px-2 font-semibold">{typeof b.guest_name === 'string' && b.guest_name ? b.guest_name : 'Ẩn danh'}</td>
                      <td className="py-2 px-2">{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="py-2 px-2">{b.check_out_date ? new Date(b.check_out_date).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="py-2 px-2">{b.guests}</td>
                      <td className="py-2 px-2">{b.final_amount?.toLocaleString()}₫</td>
                      <td className="py-2 px-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBookingStatusColor(b.status)}`}>
                          {getBookingStatusVN(b.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Biểu đồ doanh thu (đặt ở cuối) */}
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
      </div>
    </div>
  );
} 