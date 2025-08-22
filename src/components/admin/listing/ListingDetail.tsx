import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchListingByIdForAdmin,
  selectListing,
  selectListingsLoading,
  selectListingsError,
  fetchListingStatistics,
  selectListingStatistics,
  selectListingStatisticsLoading,
} from "@/store/slices/listingSlice";
import {
  fetchReviewsByRoomId,
  selectReviews,
  selectReviewsLoading,
  selectReviewsError,
} from "@/store/slices/reviewSlice";
import { fetchServices } from "@/store/slices/serviceSlice";
import { fetchSafetyFeatures } from "@/store/slices/safetyFeatureSlice";
import { fetchHouseRules } from "@/store/slices/houseRuleSlice";
import { fetchVouchers } from "@/store/slices/voucherSlice";
import { fetchBookingsByListing } from "@/store/slices/bookingSlice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Users,
  MapPin,
  Tag,
  ShieldCheck,
  Info,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Star,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ListingStatistics from "./ListingStatistics";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const listing = useAppSelector(selectListing);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);
  const statistics = useAppSelector(selectListingStatistics);
  const statisticsLoading = useAppSelector(selectListingStatisticsLoading);
  const reviews = useAppSelector(selectReviews);
  const reviewsLoading = useAppSelector(selectReviewsLoading);
  const reviewsError = useAppSelector(selectReviewsError);
  const navigate = useNavigate();

  // State cho date range
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );
  const [dateRangeType, setDateRangeType] = React.useState<
    "today" | "last_7_days" | "last_15_days" | "last_30_days" | "custom"
  >("custom");
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"statistics" | "info">(
    "info"
  );

  const handleRefresh = () => {
    if (id) {
      dispatch(fetchListingByIdForAdmin(id));
      dispatch(fetchReviewsByRoomId(id));
      // Gọi API không có dateRange khi refresh
      dispatch(fetchListingStatistics({ id }));
    }
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
    dispatch(fetchVouchers({}));
  };

  // State cho image pagination
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Đóng popover khi chọn đủ ngày
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setOpen(false);
    }
  }, [dateRange]);

  const services = useAppSelector((state) => state.service.services);
  const safetyFeatures = useAppSelector(
    (state) => state.safetyFeature.safetyFeatures
  );
  const houseRules = useAppSelector((state) => state.houseRule.houseRules);
  const bookings =
    useAppSelector((state) => state.booking.bookingsByListing) ?? [];

  // Fetch data on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchListingByIdForAdmin(id));
      // Gọi API không có dateRange khi component mount
      dispatch(fetchListingStatistics({ id }));
      dispatch(fetchReviewsByRoomId(id));
    }
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
    dispatch(fetchVouchers({}));
  }, [id, dispatch]);

  // Fetch statistics when date range changes
  const fetchData = React.useCallback(
    (newDateRangeType?: string, customRange?: DateRange) => {
      if (!id) return;

      if (newDateRangeType && newDateRangeType !== "custom") {
        dispatch(
          fetchListingStatistics({
            id,
            dateRange: newDateRangeType as
              | "today"
              | "last_7_days"
              | "last_15_days"
              | "last_30_days",
          })
        );
      } else if (customRange?.from && customRange?.to) {
        dispatch(
          fetchListingStatistics({
            id,
            dateRange: "custom",
            startDate: customRange.from.toISOString().slice(0, 10),
            endDate: customRange.to.toISOString().slice(0, 10),
          })
        );
      } else {
        // Không truyền dateRange nếu không có range
        dispatch(fetchListingStatistics({ id }));
      }
    },
    [id, dispatch]
  );

  // Handle date range change from DateRangePicker
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setDateRangeType("custom");
      fetchData("custom", dateRange);
    }
  }, [dateRange, fetchData]);

  // Fetch bookings when listing is loaded
  useEffect(() => {
    if (listing && listing.propertyId && listing._id) {
      const propertyId =
        typeof listing.propertyId === "object"
          ? listing.propertyId._id
          : listing.propertyId;
      dispatch(fetchBookingsByListing({ propertyId, listingId: listing._id }));
    }
  }, [listing, dispatch]);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!listing)
    return <div className="p-8 text-center">Không tìm thấy listing</div>;

  // Hàm render sao
  const renderStars = (rating: number) => (
    <span className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </span>
  );

  const isDateRangeSelected = dateRange?.from && dateRange?.to;
  const now = new Date();
  const currentMonthYear = `${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${now.getFullYear()}`;

  // Hàm chuyển trạng thái booking sang tiếng Việt
  const getBookingStatusVN = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã huỷ";
      case "completed":
        return "Hoàn thành";
      case "paid":
        return "Đã thanh toán";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  // Hàm lấy class màu theo trạng thái booking
  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "paid":
        return "bg-teal-100 text-teal-800 border border-teal-300";
      case "rejected":
        return "bg-gray-200 text-gray-700 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "statistics" | "info")
          }
          className="w-full"
        >
          <TabsList className="">
            <TabsList className="flex items-center gap-2">
              <TabsTrigger
                value="info"
                className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
              >
                <Info className="w-4 h-4" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Thống kê
              </TabsTrigger>
            </TabsList>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white border-gray-200 hover:bg-gray-100 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          </TabsList>

          {/* Header Section - Only show in info tab */}
          {activeTab === "info" && (
            <Card className="border-0 shadow-md bg-white mt-6">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-stretch min-h-[180px]">
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      src={listing.images?.[0] || "/placeholder.svg"}
                      alt={listing.title}
                      width={240}
                      height={180}
                      className="object-cover w-full md:w-60 h-40 rounded-xl shadow-md"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2 justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <Home className="w-6 h-6 text-blue-500" />
                        {listing.title}
                      </h1>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`text-xs px-3 py-1 ${
                            listing.status === "active"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {listing.status === "active" && "Hoạt động"}
                          {listing.status === "inactive" &&
                            "Sửa chữa - Bảo trì"}
                        </Badge>
                        <span className="flex items-center gap-1">
                          {renderStars(statistics?.averageRating || 0)}
                          <span className="font-semibold text-lg ml-1">
                            {Number(statistics?.averageRating || 0).toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({statistics?.totalReviews ?? 0} đánh giá)
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {typeof listing.propertyId === "object" &&
                          listing.propertyId !== null
                            ? listing.propertyId.name
                            : listing.propertyId}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 mb-1">
                        <Tag className="w-4 h-4 mr-2" />
                        <span className="text-sm">Giá/đêm: </span>
                        <span className="font-semibold text-blue-600 ml-1">
                          {listing.price_per_night?.toLocaleString()}₫
                        </span>
                        {listing.has_weekend_surcharge && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200 font-medium">
                            +{listing.weekend_surcharge_percent || 0}% weekend
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Thông tin bổ sung */}
                    <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Khách tối đa:</span>
                        <span className="font-semibold">
                          {listing.max_guests}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Chính sách huỷ:</span>
                        <span className="font-semibold capitalize">
                          {listing.cancel_policy === "flexible" && "Linh hoạt"}
                          {listing.cancel_policy === "moderate" && "Vừa Phải"}
                          {listing.cancel_policy === "strict" && "Nghiêm ngặt"}
                          {!["flexible", "moderate", "strict"].includes(
                            listing.cancel_policy
                          ) && listing.cancel_policy}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-600">Bình luận:</span>
                        <span className="font-semibold">
                          {listing.reviews_count ?? 0}
                        </span>
                      </div>
                      {listing.has_weekend_surcharge && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-600">Phí cuối tuần:</span>
                          <span className="font-semibold text-yellow-600">
                            +{listing.weekend_surcharge_percent || 0}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 col-span-2">
                        <Info className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Mô tả:</span>
                        <span className="px-2 py-1 text-gray-700 ml-1 flex-1 whitespace-pre-line">
                          {listing.description}
                        </span>
                      </div>
                    </div>

                    {listing.service_ids && listing.service_ids.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-gray-700">
                          Dịch vụ:
                        </span>
                        <span className="ml-2 text-gray-800">
                          {listing.service_ids
                            .map((id) => {
                              const s = services.find((s) => s._id === id);
                              return s ? s.name : id;
                            })
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {listing.safety_features &&
                      listing.safety_features.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-700">
                            Tính năng an toàn:
                          </span>
                          <span className="ml-2 text-gray-800">
                            {listing.safety_features
                              .map((id) => {
                                const sf = safetyFeatures.find(
                                  (sf) => sf._id === id
                                );
                                return sf ? sf.name : id;
                              })
                              .join(", ")}
                          </span>
                        </div>
                      )}

                    {listing.house_rules_selected &&
                      listing.house_rules_selected.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-700">
                            Nội quy:
                          </span>
                          <span className="ml-2 text-gray-800">
                            {listing.house_rules_selected
                              .map((id) => {
                                const hr = houseRules.find(
                                  (hr) => hr._id === id
                                );
                                return hr ? hr.name : id;
                              })
                              .join(", ")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Thông tin */}
          <TabsContent value="info" className="space-y-6">
            {/* Gallery Section - Hiển thị tất cả ảnh của phòng */}
            {listing.images && listing.images.length > 0 && (
              <Card className="border-0 shadow-md bg-white mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xl font-semibold">
                      Thư viện ảnh phòng ({listing.images.length} ảnh)
                    </span>
                  </div>
                  <div className="relative">
                    <div
                      className="flex gap-4 overflow-hidden relative hide-scrollbar"
                      style={{
                        width: "100%",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        transition: "transform 0.5s ease-in-out",
                      }}
                    >
                      {listing.images
                        .slice(currentImageIndex, currentImageIndex + 5)
                        .map((image, index) => (
                          <div
                            key={currentImageIndex + index}
                            className={`relative group flex-shrink-0 transition-all duration-700 ease-out hover:scale-105 ${
                              isTransitioning ? "animate-pulse" : ""
                            }`}
                            style={{
                              width: "calc((100% - 64px) / 5)",
                              transform: isTransitioning
                                ? "scale(0.95)"
                                : "scale(1)",
                              opacity: isTransitioning ? 0.8 : 1,
                            }}
                          >
                            <img
                              src={image}
                              alt={`${listing.title} - Ảnh ${
                                currentImageIndex + index + 1
                              }`}
                              className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer filter hover:brightness-110"
                              onClick={() => {
                                window.open(image, "_blank");
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-blue-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-opacity-90">
                              {currentImageIndex + index + 1}
                            </div>
                            {currentImageIndex + index === 0 && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-700 shadow-md">
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
                              setCurrentImageIndex((prev) =>
                                Math.max(0, prev - 1)
                              );
                              setIsTransitioning(false);
                            }, 300);
                          }}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full p-3 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-125 hover:-translate-x-3 z-10 backdrop-blur-sm"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Mũi tên phải */}
                      {listing.images.length > 5 &&
                        currentImageIndex < listing.images.length - 1 && (
                          <button
                            onClick={() => {
                              setIsTransitioning(true);
                              setTimeout(() => {
                                setCurrentImageIndex((prev) =>
                                  Math.min(listing.images.length - 1, prev + 1)
                                );
                                setIsTransitioning(false);
                              }, 300);
                            }}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full p-3 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-125 hover:translate-x-3 z-10 backdrop-blur-sm"
                          >
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        )}
                    </div>
                  </div>
                  {listing.images.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p>Chưa có ảnh nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {Array.isArray(bookings) && bookings.length > 0 && (
              <Card className="border-0 shadow-md bg-white mb-8 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Danh sách booking phòng
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {bookings.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-300">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Khách hàng
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Check-in
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Check-out
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Số khách
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Tổng tiền
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {bookings.map((b, index) => (
                          <tr
                            key={b._id}
                            className={`border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                              index === bookings.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-blue-700">
                                    {(typeof b.guest_name === "string" &&
                                    b.guest_name
                                      ? b.guest_name
                                      : "Ẩn danh"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    const propertyId =
                                      typeof listing.propertyId === "object" &&
                                      listing.propertyId !== null
                                        ? listing.propertyId._id
                                        : listing.propertyId;
                                    navigate(
                                      `/admin/bookings/${propertyId}/${b._id}`
                                    );
                                  }}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer text-left"
                                >
                                  {typeof b.guest_name === "string" &&
                                  b.guest_name
                                    ? b.guest_name
                                    : "Ẩn danh"}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {b.checkInDate
                                ? new Date(b.checkInDate).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {b.check_out_date
                                ? new Date(b.check_out_date).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {b.guests}
                            </td>
                            <td className="py-3 px-4 font-semibold text-green-600">
                              {b.final_amount?.toLocaleString()}₫
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(
                                  b.status
                                )}`}
                              >
                                {getBookingStatusVN(b.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Đánh giá gần đây dùng redux */}
            {reviewsLoading && (
              <div className="p-4 text-center">Đang tải đánh giá...</div>
            )}
            {reviewsError && (
              <div className="p-4 text-center text-red-500">{reviewsError}</div>
            )}
            {Array.isArray(reviews) && reviews.length > 0 && (
              <Card className="border-0 shadow-md bg-white mb-8">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Đánh giá gần đây
                    <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      {reviews.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-300">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Khách hàng
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Đánh giá
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Bình luận
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Ngày
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {reviews.map((r, index) => (
                          <tr
                            key={r._id}
                            className={`border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                              index === reviews.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-yellow-700 uppercase">
                                    {r.user?.name?.charAt(0) || "?"}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {r.user?.name || "Ẩn danh"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {renderStars(r.rating)}
                                <span className="ml-1 font-semibold text-gray-700">
                                  {r.rating}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p
                                className="text-gray-700 max-w-xs truncate"
                                title={r.comment}
                              >
                                {r.comment}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {r.createdAt
                                ? new Date(r.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bảng bookings của phòng */}
          </TabsContent>

          {/* Tab Thống kê */}
          <TabsContent value="statistics" className="space-y-6">
            <ListingStatistics
              statistics={statistics}
              statisticsLoading={statisticsLoading}
              dateRange={dateRange}
              setDateRange={setDateRange}
              dateRangeType={dateRangeType}
              open={open}
              setOpen={setOpen}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ListingDetail;
