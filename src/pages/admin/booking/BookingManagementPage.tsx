import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppDispatch } from "@/hooks/useRedux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminBookings,
  fetchBookingStatisticsOverview,
} from "@/store/slices/bookingSlice";
import BookingStatistics from "@/components/admin/booking/BookingStatistics";
import BookingList from "@/components/admin/booking/BookingList";
import BookingDetail from "@/components/admin/booking/BookingDetail";
import BookingFilter from "@/components/admin/booking/BookingFilter";
import StaffBookingModal from "@/components/admin/booking/StaffBookingModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Eye,
  BarChart3,
  Plus,
} from "lucide-react";
import { BookingStatus, PaymentStatus } from "@/types/enum";

const BookingManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { adminBookings, adminTotal, loading, statisticsOverview } =
    useSelector((state: RootState) => state.booking);
  const [selectedBooking, setSelectedBooking] = useState<{
    propertyId: string;
    id: string;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [showStaffBookingModal, setShowStaffBookingModal] = useState(false);

  // Fetch statistics on component mount
  useEffect(() => {
    dispatch(fetchBookingStatisticsOverview());
  }, [dispatch]);

  // Use statistics from API or fallback to calculated values
  const totalBookings =
    statisticsOverview?.total || adminTotal || adminBookings?.length || 0;
  const pendingBookings =
    adminBookings?.filter((b) => b.status === BookingStatus.PENDING).length ||
    0;
  const confirmedBookings =
    adminBookings?.filter((b) => b.status === BookingStatus.CONFIRMED).length ||
    0;
  const cancelledBookings =
    adminBookings?.filter((b) => b.status === BookingStatus.CANCELLED).length ||
    0;
  const refundingBookings =
    adminBookings?.filter(
      (b) =>
        b.status === BookingStatus.CANCELLED &&
        b.payment_status === PaymentStatus.REFUNDING
    ).length || 0;

  const totalRevenue =
    statisticsOverview?.revenue ||
    adminBookings?.reduce((sum, booking) => {
      if (
        booking.status === BookingStatus.COMPLETED ||
        booking.status === BookingStatus.CONFIRMED
      ) {
        return sum + (booking.final_amount || 0);
      }
      return sum;
    }, 0) ||
    0;

  const handleBackToList = () => {
    setSelectedBooking(null);
    setViewMode("list");
  };

  const handleStaffBookingSuccess = () => {
    // Refresh booking list and statistics after successful creation
    dispatch(fetchBookingStatisticsOverview());
    dispatch(fetchAdminBookings({}));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      {/* Header (đồng bộ chiều rộng với nội dung) */}
      <div className="">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  Quản lý Booking
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/bookings/calendar")}
                className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-100 cursor-pointer rounded-md"
              >
                <Calendar className="w-4 h-4" />
                Lịch booking
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  dispatch(fetchBookingStatisticsOverview());
                  dispatch(fetchAdminBookings({}));
                }}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-100 cursor-pointer rounded-md"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>

              <Button
                onClick={() => setShowStaffBookingModal(true)}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tạo Booking (Staff)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wrapper (đồng bộ chiều rộng, tránh max-w khác nhau) */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Tổng booking
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Chờ xác nhận
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {pendingBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-500">Đã xác nhận</p>
                <p className="text-lg font-semibold text-gray-900">
                  {confirmedBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-500">Đã hủy</p>
                <p className="text-lg font-semibold text-gray-900">
                  {cancelledBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Đang hoàn tiền
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {refundingBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-0">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <BookingFilter
              onFilterChange={(filters) => {
                console.log("Filters changed:", filters);
                // TODO: Implement filter logic
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {viewMode === "detail" && selectedBooking ? (
            <div className="relative">
              <div className="absolute top-4 left-4 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToList}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </div>
              <div className="min-w-0">
                <BookingDetail
                  propertyId={selectedBooking.propertyId}
                  bookingId={selectedBooking.id}
                  onBack={handleBackToList}
                />
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              {/* <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Danh sách Booking
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Xuất báo cáo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Thống kê
                    </Button>
                  </div>
                </div>
              </div> */}
              {/* Giữ scroll ngang bên trong list nếu table rộng, tránh scroll ngang toàn trang */}
              <div className="overflow-x-auto">
                <BookingList />
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        {/* <div className="mt-6 min-w-0">
          <BookingStatistics />
        </div> */}
      </div>

      <StaffBookingModal
        isOpen={showStaffBookingModal}
        onClose={() => setShowStaffBookingModal(false)}
        onSuccess={handleStaffBookingSuccess}
      />
    </div>
  );
};

export default BookingManagementPage;
