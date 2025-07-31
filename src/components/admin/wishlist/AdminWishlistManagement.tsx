import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useNavigate } from "react-router-dom";

import { 
  fetchAdminWishlists, 
  fetchWishlistStatistics, 
  setCurrentPage,
  clearAdminError,
  selectAdminWishlists,
  selectAdminWishlistLoading,
  selectAdminWishlistError,
  selectWishlistStatistics,
  selectWishlistPagination,
} from "@/store/slices/wishlistSlice";
import { AdminQueryWishlistDto } from "@/services/wishlistApi";

interface WishlistFilters {
  search: string;
  user_id: string;
  room_id: string;
  isDelete: boolean | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  limit: number;
}

export default function AdminWishlistManagement() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Redux selectors
  const wishlists = useAppSelector(selectAdminWishlists);
  const statistics = useAppSelector(selectWishlistStatistics);
  const loading = useAppSelector(selectAdminWishlistLoading);
  const error = useAppSelector(selectAdminWishlistError);
  const { currentPage, totalPages, totalItems } = useAppSelector(selectWishlistPagination);
  
  const [filters, setFilters] = useState<WishlistFilters>({
    search: '',
    user_id: '',
    room_id: '',
    isDelete: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 10
  });

  // Load data
  useEffect(() => {
    loadWishlists();
    loadStatistics();
  }, [currentPage, filters]);

  const loadWishlists = async () => {
    const params: AdminQueryWishlistDto = {
      page: currentPage,
      limit: filters.limit, // Sử dụng limit từ filters
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      // Không gửi isDelete để lấy tất cả wishlist
    };

    if (filters.search) {
      // Frontend search for now
      params.page = 1;
      params.limit = 100;
    }

    await dispatch(fetchAdminWishlists(params));
  };

  const loadStatistics = async () => {
    await dispatch(fetchWishlistStatistics());
  };

  // Debug: Log statistics data
  useEffect(() => {
    if (statistics) {
      console.log('Statistics data:', statistics);
      console.log('Top Rooms:', statistics.topRooms);
      console.log('Top Users:', statistics.topUsers);
      console.log('Last 7 Days:', statistics.last7Days);
    }
  }, [statistics]);

  const handleFilterChange = (key: keyof WishlistFilters, value: string | number | boolean | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset về trang 1 khi thay đổi bất kỳ filter nào
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/admin/listings/${roomId}`);
  };

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearAdminError());
  }, [dispatch]);

  if (loading && wishlists.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Glassmorphism */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-600 bg-clip-text text-transparent dark:from-white dark:via-purple-200 dark:to-pink-200">
                      Quản lý Wishlist
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Quản lý danh sách yêu thích của tất cả người dùng
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards with Enhanced Design */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Tổng Wishlists</CardTitle>
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {totalItems}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tổng số yêu thích</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">7 Ngày Qua</CardTitle>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {statistics.last7Days}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Yêu thích mới</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Statistics with Enhanced Cards */}
        {statistics && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  Top 5 Phòng Yêu Thích
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.topRooms?.slice(0, 5).map((room) => (
                    <div key={room._id} className="group relative p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {/* <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-white">#{index + 1}</span>
                            </div> */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                              <img
                                src={room.roomInfo?.images?.[0] || '/placeholder.svg'}
                                alt={room.roomInfo?.title || 'Phòng không xác định'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-lg">{room.roomInfo?.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{room.count} lượt yêu thích</p>
                            </div>
                          </div>
                        </div>
                        <Heart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu phòng yêu thích</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  Top 5 Người Dùng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.topUsers?.slice(0, 5).map((user) => (
                    <div key={user._id} className="group relative p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {/* <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-white">#{index + 1}</span>
                            </div> */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                {user.userInfo?.name ? (
                                  <span className="text-white font-bold text-sm">
                                    {user.userInfo.name.charAt(0).toUpperCase()}
                                  </span>
                                ) : (
                                  <User className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-lg">{user.userInfo?.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{user.count} yêu thích</p>
                            </div>
                          </div>
                        </div>
                        <User className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu người dùng</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Filters */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" />
                  <Input
                    placeholder="Tìm theo tên user, phòng..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>
              </div>

         

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng</label>
                <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                  <SelectTrigger className="py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 bản ghi</SelectItem>
                    <SelectItem value="20">20 bản ghi</SelectItem>
                    <SelectItem value="50">50 bản ghi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display with Enhanced Design */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-6 text-red-700 dark:text-red-300 text-center shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Enhanced Wishlist List */}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                Danh sách Wishlist
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Heart className="w-4 h-4" />
                  Tất cả
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {wishlists.filter(wishlist => !wishlist.isDelete).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Không có wishlist đang hoạt động
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Chưa có người dùng nào thêm phòng vào yêu thích
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-0">
                      <TableHead className="w-[120px] text-gray-700 dark:text-gray-300 font-semibold">Ảnh Phòng</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Tên Phòng</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Người Dùng</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Thông Tin</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wishlists
                      .filter(wishlist => !wishlist.isDelete) // Chỉ lấy wishlist có isDelete: false
                      .map((wishlist) => (
                      <TableRow key={wishlist._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 border-0">
                        <TableCell>
                          <div 
                            className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            onClick={() => handleRoomClick(wishlist.room_id?._id || '')}
                          >
                            <img
                              src={wishlist.room_id?.images?.[0] || '/placeholder.svg'}
                              alt={wishlist.room_id?.title || 'Phòng không xác định'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <h3 
                              className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 text-lg"
                              onClick={() => handleRoomClick(wishlist.room_id?._id || '')}
                            >
                              {wishlist.room_id?.title || 'Phòng không xác định'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold">{wishlist.room_id?.average_rating || 0}</span>
                              <span className="text-gray-500">({wishlist.room_id?.reviews_count || 0})</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                {wishlist.user_id?.name ? (
                                  <span className="text-white font-bold text-sm">
                                    {wishlist.user_id.name.charAt(0).toUpperCase()}
                                  </span>
                                ) : (
                                  <User className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                {wishlist.user_id?.name || 'Người dùng không xác định'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {wishlist.user_id?.email || 'Email không xác định'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-gray-900 dark:text-white">{wishlist.room_id?.guests || 0} khách</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrency(wishlist.room_id?.price_per_night || 0)}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 px-6 py-3"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Trước
                </Button>
                <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg font-semibold">
                  Trang {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 px-6 py-3"
                >
                  Sau
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 