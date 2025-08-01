import React, { useEffect, useState, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchAdminListings,
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
import { useUserRole } from "@/hooks/useUserRole";
import { propertyStaffAssignmentApi } from '@/services/propertyStaffAssignmentApi';
import { api } from '@/services/api';
import { PermissionGuard } from "@/components/common/PermissionGuard";

interface ListingFilters {
  search: string;
  status: string;
  propertyId: string;
  page: number;
  limit: number;
}

interface AssignmentData {
  _id: string;
  propertyId: {
    _id: string;
    name: string;
    type: string;
  };
  staffId: string;
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
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
  const { isAdmin, isStaff } = useUserRole();
  const allListings = useAppSelector(selectListings);
  const loading = useAppSelector(selectListingsLoading);
  const error = useAppSelector(selectListingsError);
  const total = useAppSelector(selectListingsTotal);
  const properties = useAppSelector(selectProperties);
  
  // State cho staff properties
  const [staffProperties, setStaffProperties] = useState<{ _id: string; name: string; type?: string }[]>([]);
  const [staffPropertyIds, setStaffPropertyIds] = useState<string[]>([]);
  const [staffPropertiesLoaded, setStaffPropertiesLoaded] = useState(false);
  
  // Track lần fetch đầu tiên
  const hasInitialFetch = useRef(false);
  
  console.log('🔄 Listings component re-render:', { isAdmin, isStaff, staffPropertiesLoaded });
  
  // Sử dụng properties cho dropdown
  const displayProperties = isStaff ? staffProperties : properties;
  
  // Filter listings cho staff
  const listings = isStaff && staffPropertyIds.length > 0 
    ? allListings.filter(listing => {
        const propertyId = typeof listing.propertyId === 'object' && listing.propertyId !== null 
          ? listing.propertyId._id 
          : listing.propertyId;
        return staffPropertyIds.includes(propertyId);
      })
    : allListings;

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

  // Lấy properties được assign cho staff
  useEffect(() => {
    let mounted = true;
    const loadStaffProperties = async () => {
      if (isStaff && !staffPropertiesLoaded && mounted) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const userId = user._id;
          
          if (userId) {
            const myAssignments = await propertyStaffAssignmentApi.getPropertiesByStaff(userId);
            const staffAssignments = myAssignments.data?.data || myAssignments.data || [];
            
            // Lấy property IDs được assign cho staff
            const propertyIds = staffAssignments.map((assignment: AssignmentData) => assignment.propertyId._id);
            setStaffPropertyIds(propertyIds);
            
            // Lấy thông tin chi tiết properties
            const staffProperties = await Promise.all(
              staffAssignments.map(async (assignment: AssignmentData) => {
                try {
                  const propertyResponse = await api.get(`/properties/${assignment.propertyId._id}`);
                  const propertyData = propertyResponse.data;
                  
                  if (propertyData.success && propertyData.data) {
                    return propertyData.data;
                  } else {
                    return assignment.propertyId;
                  }
                } catch (error) {
                  console.error('Error fetching property details:', error);
                  return assignment.propertyId;
                }
              })
            );
            
            setStaffProperties(staffProperties);
          }
        } catch (error) {
          console.error('Error loading staff properties:', error);
        } finally {
          if (mounted) {
            setStaffPropertiesLoaded(true);
          }
        }
      }
    };
    
    loadStaffProperties();
    return () => {
      mounted = false;
    };
  }, [isStaff]);

  // Memoize filters để tránh re-render không cần thiết
  const memoizedFilters = useMemo(() => filters, [
    filters.search, filters.status, filters.propertyId, filters.page, filters.limit
  ]);

  // Fetch listings cho admin
  useEffect(() => {
    if (isAdmin) {
      console.log('📞 Calling fetchAdminListings');
      const params: Partial<typeof memoizedFilters> = { ...memoizedFilters };
      if (!params.propertyId) {
        delete params.propertyId;
      }
      if (!params.status) {
        delete params.status;
      }
      
      dispatch(fetchAdminListings({
        ...params,
        search: params.search ? params.search.trim() : "",
      }));
    }
  }, [memoizedFilters, dispatch, isAdmin]);

  // Fetch listings cho staff - chỉ khi properties đã load xong
  useEffect(() => {
    if (isStaff && staffPropertiesLoaded && !hasInitialFetch.current) {
      console.log('📞 Calling fetchListings for staff (initial)');
      const params: Partial<typeof memoizedFilters> = { ...memoizedFilters };
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
      hasInitialFetch.current = true;
    }
  }, [memoizedFilters, dispatch, isStaff]);

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
      const fetchAction = isAdmin ? fetchAdminListings : fetchListings;
      dispatch(fetchAction({
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý phòng</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý tất cả phòng và bất động sản</p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission="listing.create">
          <Link to="/admin/listings/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Listing
            </Button>
          </Link>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters + Tổng số listings */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Filter className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bộ lọc
          </h2>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Search Input */}
          <div className='relative'>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ top: '-45px' }}>
              <Search className='h-4 w-4 text-gray-400' />
            </div>
            <Input
              placeholder='Tìm kiếm theo tiêu đề...'
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className='pl-10 w-full h-10 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
            />
          </div>
          
          {/* Property filter */}
          <div className="relative">
            <select
              value={filters.propertyId}
              onChange={e => handleFilterChange("propertyId", e.target.value)}
              className='w-full h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white'>
              <option value="">Tất cả properties</option>
                             {displayProperties.map((p) => (
                 <option key={p._id} value={p._id}>{p.name}</option>
               ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ top: '-45px' }}>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Items per page dropdown */}
          <div className="relative">
            <select
              value={filters.limit}
              onChange={e => handleFilterChange("limit", Number(e.target.value))}
              className='w-full h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-900 dark:text-white'>
              <option value={10}>10 items/page</option>
              <option value={20}>20 items/page</option>
              <option value={50}>50 items/page</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ top: '-45px' }}>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Total count card */}
          <div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1'>{total}</div>
            <div className='text-sm text-blue-700 dark:text-blue-300 font-medium'>Tổng số phòng</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Danh sách phòng
            </h2>
          </div>
        </div>
          
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600'></div>
          </div>
        ) : error ? (
          <div className='text-center py-12 text-red-500'>
            <div className="text-lg font-medium mb-2">Có lỗi xảy ra</div>
            <div className="text-sm text-gray-600">{error}</div>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table className="border-none">
              <TableHeader>
                <TableRow className="border-none bg-gray-50 dark:bg-gray-700">
                  <TableHead className="border-none text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 text-sm uppercase tracking-wide">Ảnh</TableHead>
                  <TableHead className="border-none text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 text-sm uppercase tracking-wide">Tiêu đề</TableHead>
                  <TableHead className="border-none text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 text-sm uppercase tracking-wide text-right">Giá/đêm</TableHead>
                  <TableHead className="border-none text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 text-sm uppercase tracking-wide text-center">Khách tối đa</TableHead>
                  <TableHead className="border-none text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 text-sm uppercase tracking-wide">Property</TableHead>
                  <TableHead className='text-right border-none text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 text-sm uppercase tracking-wide'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing, index) => (
                  <TableRow 
                    key={listing._id} 
                    className={`border-none hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <TableCell className="border-none py-4 px-6">
                      <Link to={`/admin/listings/${listing._id}`} title='Xem chi tiết'>
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }}
                            className='cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm'
                          />
                        ) : (
                          <div className="w-14 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <span className='text-gray-400 dark:text-gray-500 text-xs'>No image</span>
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className='font-medium border-none py-4 px-6'>
                      <Link to={`/admin/listings/${listing._id}`} title='Xem chi tiết'>
                        <div className='max-w-xs truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-semibold text-gray-800 dark:text-gray-200' title={listing.title}>
                          {listing.title}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right border-none py-4 px-6">
                      <div className='font-semibold text-pink-600 dark:text-pink-400'>
                        {formatPrice(listing.price_per_night)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center border-none py-4 px-6">
                      <div className='text-gray-700 dark:text-gray-300 font-medium'>
                        {listing.max_guests}
                      </div>
                    </TableCell>
                    <TableCell className="border-none py-4 px-6">
                      <div className='max-w-xs truncate text-gray-600 dark:text-gray-300 text-sm' title={typeof listing.propertyId === 'object' && listing.propertyId !== null ? listing.propertyId.name : listing.propertyId || ''}>
                        {typeof listing.propertyId === 'object' && listing.propertyId !== null
                          ? <span className="text-green-700 dark:text-green-400 font-medium">{listing.propertyId.name}</span>
                          : listing.propertyId || ''}
                      </div>
                    </TableCell>
                    <TableCell className='text-right border-none py-4 px-6'>
                      <div className='flex items-center justify-end gap-2'>
                        <PermissionGuard permission="listing.view">
                        <Link to={`/admin/listings/${listing._id}`} title='Xem chi tiết'>
                          <Button variant='ghost' size='icon' className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg h-8 w-8">
                            <Eye className='h-4 w-4' />
                          </Button>
                        </Link>
                        </PermissionGuard>
                        <PermissionGuard permission="listing.edit">
                        <Link to={`/admin/listings/edit/${listing._id}`} title='Chỉnh sửa'>
                          <Button variant='ghost' size='icon' className="hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg h-8 w-8">
                            <Edit className='h-4 w-4' />
                          </Button>
                        </Link>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {listings.length === 0 && (
              <div className='text-center py-12'>
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Không có listings nào</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hãy thêm listing đầu tiên để bắt đầu</div>
                <Link to='/admin/listings/create'>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                    <Plus className='w-4 h-4 mr-2' />
                    Thêm Listing Đầu Tiên
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > filters.limit && (
        <div className='flex justify-center items-center space-x-4  dark:bg-gray-800  p-4   dark:border-gray-700'>
          <Button
            variant='outline'
            onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className='flex items-center justify-center h-10 px-4 rounded-lg border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200'>
            <ChevronLeft className='w-5 h-5' />
          </Button>
          <div className='flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
              Trang {filters.page} / {Math.ceil(total / filters.limit)}
            </span>
          </div>
          <Button
            variant='outline'
            onClick={() => handleFilterChange("page", filters.page + 1)}
            disabled={filters.page >= Math.ceil(total / filters.limit)}
            className='flex items-center justify-center h-10 px-4 rounded-lg border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200'>
            <ChevronRight className='w-5 h-5' />
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