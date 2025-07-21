import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { 
  fetchAdminReviews, 
  fetchReviewStatistics,
  deleteReview,
  clearError,
  searchReviews
} from '@/store/slices/reviewSlice';
import type { Review } from '@/types/review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, Search, Trash2, MessageSquare, Users, Star as StarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReviewManagement() {
  const dispatch = useAppDispatch();
  const { reviews, statistics, loading, error, totalPages, currentPage, totalItems } = useAppSelector(state => state.reviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAdminReviews({ page, limit: 10 }));
    dispatch(fetchReviewStatistics());
  }, [dispatch, page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchReviews({ search: searchTerm.trim() }));
    } else {
      dispatch(fetchAdminReviews({ page: 1, limit: 10 }));
    }
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteReview(id)).unwrap();
      toast.success('Xóa đánh giá thành công');
      dispatch(fetchAdminReviews({ page, limit: 10 }));
    } catch {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  const stats = statistics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm đánh giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đánh giá</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá gần đây</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalReviews || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trang hiện tại</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPage}/{totalPages || 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đánh giá ({totalItems} đánh giá)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có đánh giá nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Người đánh giá</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Phòng</th>
                    <th className="px-4 py-2 border">Điểm</th>
                    <th className="px-4 py-2 border">Nội dung</th>
                    <th className="px-4 py-2 border">Ngày tạo</th>
                    <th className="px-4 py-2 border">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.filter(review => review.user).map((review) => (
                    <tr key={review._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 border font-semibold text-gray-900">{review.user?.name || "Ẩn danh"}</td>
                      <td className="px-4 py-2 border">{review.user?.email || "Không rõ email"}</td>
                      <td className="px-4 py-2 border">{review.room?.title || "khong ro"}</td>
                      <td className="px-4 py-2 border text-center">
                        <span className="inline-flex items-center gap-1">
                          {review.rating}
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                        </span>
                      </td>
                      <td className="px-4 py-2 border">{review.comment}</td>
                      <td className="px-4 py-2 border">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-2 border text-center">
                        <AlertDialog >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => selectedReview && handleDelete(selectedReview._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="flex items-center px-4">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 