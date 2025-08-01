import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchAdminBookings, fetchStaffBookings } from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import BookingFilter from "./BookingFilter";
import BookingActions from "./BookingActions";
import type { Booking } from "@/types/booking.interface";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPaymentStatusVN, getStatusVN } from "@/helper/status";
import { Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { propertyStaffAssignmentApi } from "@/services/propertyStaffAssignmentApi";
import { 
  Calendar, 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

type BookingWithDeleted = Booking & {
  isDeleted?: boolean;
  deleted?: boolean;
  payment_status?: string;
  paymentStatus?: string;
  refund_amount?: number;
  nights?: number;
  payment_method?: string;
  propertyId?:
    | {
        name?: string;
        _id?: string;
      }
    | string;
};

const BookingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isStaff, user } = useUserRole();
  const { adminBookings, staffBookings, loading, error } = useSelector(
    (state: RootState) => state.booking
  );
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  // Debug staff assignments
  useEffect(() => {
    if (isStaff && user?._id) {
      console.log('🔍 Checking staff assignments for user:', user._id);
      console.log('🔍 User object:', user);
      
      propertyStaffAssignmentApi.getPropertiesByStaff(user._id)
        .then(response => {
          console.log('🔍 Staff assignments response:', response);
          const properties = response.data?.data || response.data || [];
          console.log('🔍 Staff properties:', properties);
          
          // Log chi tiết từng property
          properties.forEach((prop: Record<string, unknown>, index: number) => {
            console.log(`🔍 Property ${index + 1}:`, {
              id: (prop._id as string) || (prop.propertyId as Record<string, unknown>)?.id as string,
              name: (prop.name as string) || (prop.propertyId as Record<string, unknown>)?.name as string,
              type: (prop.type as string) || (prop.propertyId as Record<string, unknown>)?.type as string
            });
          });

          // Log tất cả property IDs để so sánh với backend
          const propertyIds = properties.map((prop: Record<string, unknown>) => 
            (prop._id as string) || (prop.propertyId as Record<string, unknown>)?.id as string
          );
          console.log('🔍 All property IDs for staff:', propertyIds);
        })
        .catch(error => {
          console.error('🔍 Error fetching staff assignments:', error);
        });
    }
  }, [isStaff, user?._id]);

  // Fetch bookings for admin (all bookings)
  useEffect(() => {
    if (!isStaff) {
      console.log('🔍 Fetching admin bookings');
      dispatch(fetchAdminBookings({ ...filters, page }));
    }
  }, [dispatch, filters, page, isStaff]);

  // Fetch bookings for staff
  useEffect(() => {
    if (isStaff) {
      console.log('🔍 Fetching staff bookings with filters:', { ...filters, page, limit: 50 });
      dispatch(fetchStaffBookings({ 
        ...filters,
        page, 
        limit: 50
      }));
    }
  }, [isStaff, dispatch, filters, page]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleActionSuccess = () => {
    if (isStaff) {
      dispatch(fetchStaffBookings({ ...filters, page }));
    } else {
      dispatch(fetchAdminBookings({ ...filters, page }));
    }
  };

  // Thêm icon VNPAY SVG inline
  const VNPayIcon = () => (
    <svg
      width="24"
      height="12"
      viewBox="0 0 48 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline align-middle mr-1"
    >
      <rect width="48" height="24" rx="4" fill="#0060AF" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fill="white"
        fontWeight="bold"
      >
        VNPAY
      </text>
    </svg>
  );

  // Hiển thị tất cả booking trong cùng một bảng
  const allBookings = isStaff 
    ? (Array.isArray(staffBookings) ? staffBookings : [])
    : (Array.isArray(adminBookings) ? adminBookings : []);

  console.log('🔍 Debug BookingList:', {
    isStaff,
    staffBookingsLength: staffBookings?.length || 0,
    adminBookingsLength: adminBookings?.length || 0,
    allBookingsLength: allBookings?.length || 0,
    staffBookings: staffBookings?.slice(0, 2)?.map(b => ({
      id: b._id,
      guestName: b.guest_name,
      propertyName: typeof b.propertyId === 'object' ? (b.propertyId as { name?: string })?.name : b.propertyId,
      status: b.status
    }))
  });

  // Tính toán stats
  const totalBookings = allBookings.length;
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-red-700">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isStaff ? 'Quản lý Booking của tôi' : 'Quản lý Booking'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isStaff ? 'Theo dõi và quản lý các booking được assign' : 'Quản lý tất cả booking trong hệ thống'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium">
                {totalBookings} Booking
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Bookings Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalBookings}</div>
                <div className="text-xs text-gray-500">Tổng cộng</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã xác nhận</span>
                <span className="text-sm font-semibold text-green-600">{confirmedBookings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-gray-900">Tổng Booking</div>
          </div>

          {/* Confirmed Bookings Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
                <div className="text-xs text-gray-500">
                  {totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tỷ lệ</span>
                <span className="text-sm font-semibold text-green-600">
                  {totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-gray-900">Đã xác nhận</div>
          </div>

          {/* Pending Bookings Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{pendingBookings}</div>
                <div className="text-xs text-gray-500">
                  {totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tỷ lệ</span>
                <span className="text-sm font-semibold text-orange-600">
                  {totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-gray-900">Chờ xác nhận</div>
          </div>

          {/* Cancelled Bookings Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{cancelledBookings}</div>
                <div className="text-xs text-gray-500">
                  {totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tỷ lệ</span>
                <span className="text-sm font-semibold text-red-600">
                  {totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-gray-900">Đã hủy</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
          <BookingFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Table Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Danh sách Booking</h2>
              <Badge variant="secondary" className="ml-auto">
                {allBookings.length} kết quả
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="border-none">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-none">
                  <TableHead className="text-center font-semibold text-gray-700 py-4">STT</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Khách hàng</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Phòng</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">HomeStay</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Ngày vào</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Ngày ra</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Khách</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Trạng thái</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Thanh toán</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Phương thức</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Tổng tiền</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 py-4">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBookings.length > 0 ? (
                  allBookings.map((b: BookingWithDeleted, idx) => {
                    // Lấy thông tin khách
                    const guestId = (b as { guestId?: { name?: string } }).guestId;
                    let guestName = "";
                    let guestEmail = "";
                    if (typeof guestId === "object" && guestId !== null) {
                      guestName = guestId.name || "";
                      guestEmail =
                        "email" in guestId && typeof guestId.email === "string"
                          ? guestId.email
                          : "";
                    } else if (typeof b.guest_name === "string") {
                      guestName = b.guest_name;
                    }
                    
                    // Lấy thông tin phòng
                    let roomName = "";
                    if (typeof b.listingId === "object" && b.listingId !== null) {
                      roomName = b.listingId.title || "";
                    } else if (typeof b.listingId === "string") {
                      roomName = b.listingId;
                    }
                    
                    // Lấy thông tin property
                    let propertyName = "";
                    let propertyId = "";
                    if (typeof b.propertyId === "object" && b.propertyId !== null) {
                      propertyName = (b.propertyId as { name?: string }).name || "";
                      propertyId = (b.propertyId as { _id?: string })._id || "";
                    } else if (typeof b.propertyId === "string") {
                      propertyName = b.propertyId;
                      propertyId = b.propertyId;
                    }

                    const bookingStatus = getStatusVN(b.status);
                    const paymentStatus = getPaymentStatusVN(
                      b.payment_status ||
                        (b as { paymentStatus?: string }).paymentStatus ||
                        ""
                    );

                    // Thêm màu nền cho booking đã hủy
                    const rowClassName = b.status === "cancelled"
                      ? "hover:bg-red-50/50 bg-red-50/30 border-none"
                      : "hover:bg-blue-50/50 border-none";

                    return (
                      <TableRow key={b._id} className={rowClassName}>
                        <TableCell className="text-center py-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto">
                            {idx + 1}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 group-hover:border-blue-300 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {guestName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {guestEmail}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-green-300 transition-all duration-300">
                              <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                {roomName}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-purple-300 transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                  {propertyName}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-blue-300 transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  {new Date(b.checkInDate).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-orange-300 transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-gray-900">
                                  {new Date(b.check_out_date).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-indigo-300 transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium text-gray-900">
                                  {b.guests}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-green-300 transition-all duration-300">
                              <Badge className={`${bookingStatus.color} font-medium`}>
                                {bookingStatus.label}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-yellow-300 transition-all duration-300">
                              <Badge className={`${paymentStatus.color} font-medium`}>
                                {paymentStatus.label}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-cyan-300 transition-all duration-300">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-cyan-600" />
                                {b.payment_method === "vnpay" && <VNPayIcon />}
                                <span className="font-medium text-gray-900">
                                  {(b.payment_method as string)?.toUpperCase() || "N/A"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link
                            to={`/admin/bookings/${propertyId}/${b._id}`}
                            className="block group"
                          >
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 group-hover:border-pink-300 transition-all duration-300">
                              <div className="font-bold text-pink-600 text-lg">
                                {(b.final_amount || 0).toLocaleString()}₫
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                            <BookingActions
                              booking={b}
                              propertyId={propertyId}
                              onSuccess={handleActionSuccess}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-16">
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Calendar className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Không có booking nào
                        </h3>
                        <p className="text-gray-600">
                          Chưa có booking nào được tạo trong hệ thống
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
