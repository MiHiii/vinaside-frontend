import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchListings,
  deleteListing,
  selectListings,
  selectListingsLoading,
  selectListingsError,
  selectListingsTotal,
  // Listing,
} from "@/store/slices/listingSlice";
import { Listing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Search, 
  Edit, 
  Eye, 
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { fetchProperties, selectProperties } from "@/store/slices/propertySlice";
import { fetchAmenities } from "@/store/slices/amenitySlice";
import { fetchServices } from '@/store/slices/serviceSlice';
import { fetchSafetyFeatures } from '@/store/slices/safetyFeatureSlice';
import { fetchHouseRules } from '@/store/slices/houseRuleSlice';
import { fetchVouchers } from '@/store/slices/voucherSlice';

interface ListingFilters {
  search: string;
  status: string;
  propertyId: string;
  page: number;
  limit: number;
}

// Simple price formatter
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default function Listings() {
  const dispatch = useAppDispatch();
  const listings = useAppSelector(selectListings);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);
  const total = useAppSelector(selectListingsTotal);
  const properties = useAppSelector(selectProperties);
  const services = useAppSelector((state) => state.service.services) ?? [];
  console.log('services in Listings:', services, Array.isArray(services));

  const [filters, setFilters] = useState<ListingFilters>({
    search: "",
    status: "",
    propertyId: "",
    page: 1,
    limit: 10,
  });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ limit: 100 }));
    }
    dispatch(fetchAmenities({ limit: 100 }));
    dispatch(fetchServices({}));
    dispatch(fetchSafetyFeatures({}));
    dispatch(fetchHouseRules({}));
    dispatch(fetchVouchers({}));
  }, [dispatch, properties]);

  useEffect(() => {
    // Chỉ truyền propertyId nếu có giá trị
    const params: Partial<typeof filters> = { ...filters };
    if (!params.propertyId) {
      delete params.propertyId;
    }
    if (!params.status) {
      delete params.status;
    }
    dispatch(fetchListings({
      ...params,
      search: params.search ? params.search.trim() : "",
    }));
  }, [filters, dispatch]);

  const handleFilterChange = (field: keyof ListingFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === "page" ? Number(value) : 1,
    }));
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteListing(id));
    if (deleteListing.fulfilled.match(result)) {
      toast.success("Xóa listing thành công!");
      setDeleteDialogOpen(false);
      setSelectedListing(null);
      const params: Partial<typeof filters> = { ...filters };
      if (!params.propertyId) delete params.propertyId;
      if (!params.status) delete params.status;
      dispatch(fetchListings({
        ...params,
        search: params.search ? params.search.trim() : "",
      }));
    } else {
      toast.error(result.payload || "Xóa listing thất bại!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Listings</h1>
          <p className="text-gray-600">Quản lý tất cả phòng và bất động sản</p>
        </div>
        <div className="flex gap-2">
          {/* <Link to="/admin/listings/deleted">
            <Button variant="outline">
              Danh sách đã xóa
            </Button>
          </Link> */}
          <Link to="/admin/listings/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề..."
                value={filters.search}
                onChange={e => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filters.propertyId}
              onChange={e => handleFilterChange("propertyId", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              <option value="">Tất cả</option>
              <option value="">-- Chọn bất động sản --</option>
              {properties.map((p) => (
                <option key={p._id || p.id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <select
              value={filters.limit}
              onChange={e => handleFilterChange("limit", Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={10}>10 items/page</option>
              <option value={20}>20 items/page</option>
              <option value={50}>50 items/page</option>
            </select>
            {/* Tổng số listings */}
            <div>
              <Card className="w-full max-w-xs">
                <CardContent className="p-2">
                  <div className="text-xl font-bold">{total}</div>
                  <div className="text-xs text-gray-600">Tổng số listings</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow >
                    <TableHead className="text-xs font-bold uppercase text-gray-600">Ảnh</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-gray-600">Tiêu đề</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-gray-600 text-right">Giá/đêm</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-gray-600 text-center">Khách tối đa</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-gray-600">Property</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-gray-600 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map(listing => (
                    <TableRow key={listing._id} className="hover:bg-gray-50 transition">
                      <TableCell>
                        {listing.images && listing.images.length > 0 ? (
                          <Link to={`/admin/listings/${listing._id}`} title="Xem chi tiết">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-32 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                            />
                          </Link>
                        ) : (
                          <span className="text-gray-400">Không có ảnh</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/listings/${listing._id}`} title="Xem chi tiết">
                          <span className="font-semibold text-blue-700 hover:underline">{listing.title}</span>
                        </Link>
                        {/* Bỏ tên property ở đây */}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-pink-600">
                        {formatPrice(listing.price_per_night)}
                      </TableCell>
                      <TableCell className="text-center">{listing.max_guests}</TableCell>
                      <TableCell>
                        {typeof listing.propertyId === 'object' && listing.propertyId !== null
                          ? <span className="text-green-700 font-medium">{listing.propertyId.name}</span>
                          : listing.propertyId || ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/listings/${listing._id}`} title="Xem chi tiết">
                            <Button variant="ghost" size="icon" className="hover:bg-blue-100">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Link to={`/admin/listings/edit/${listing._id}`} title="Chỉnh sửa">
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-100">
                              <Edit className="h-4 w-4 text-yellow-600" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {listings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có listings nào
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > filters.limit && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className="flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm">
            Trang {filters.page} / {Math.ceil(total / filters.limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => handleFilterChange("page", filters.page + 1)}
            disabled={filters.page >= Math.ceil(total / filters.limit)}
            className="flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white border shadow-lg rounded-lg p-8">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa listing "{selectedListing?.title}"? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => selectedListing?._id && handleDelete(selectedListing._id)}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 