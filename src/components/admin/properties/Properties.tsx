import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchProperties,
  selectProperties,
  selectPropertiesLoading,
  selectPropertiesError,
  selectPropertiesTotal,
  getStaffByProperty,
  // createProperty
} from '@/store/slices/propertySlice';
import { selectStaffList } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Eye, Plus, Filter, ChevronLeft, ChevronRight, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PropertiesFilters {
  search: string;
  type: string;
  status: string;
  page: number;
  limit: number;
}

interface StaffData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AssignmentData {
  _id: string;
  propertyId: string;
  staffId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role?: string;
  };
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

export default function AdminProperties() {
  const dispatch = useAppDispatch();
  const properties = useAppSelector(selectProperties);
  console.log('Properties to render:', properties);
  const loading = useAppSelector(selectPropertiesLoading);
  const error = useAppSelector(selectPropertiesError);
  const total = useAppSelector(selectPropertiesTotal);

  console.log('Properties state:', { properties, loading, error, total });

  const [filters, setFilters] = useState<PropertiesFilters>({
    search: '',
    type: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const staffList = useAppSelector(selectStaffList);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [currentModalStaff, setCurrentModalStaff] = useState<StaffData[]>([]);
  
  // State để lưu trữ số nhân viên và danh sách staff cho từng property
  const [propertyStaffCounts, setPropertyStaffCounts] = useState<Record<string, number>>({});
  const [propertyStaffData, setPropertyStaffData] = useState<Record<string, AssignmentData[]>>({});
  const [loadingStaffCounts, setLoadingStaffCounts] = useState<Record<string, boolean>>({});
  
  // Ref để track các property đã load để tránh gọi API trùng lặp
  const loadedPropertiesRef = useRef<Set<string>>(new Set());

  const handleShowStaff = (propertyId: string) => {
    // Sử dụng dữ liệu staff đã load từ API mới
    const staffData = propertyStaffData[propertyId] || [];
    if (staffData.length === 0) {
      toast.error("Không có nhân viên nào được gán cho tòa nhà này");
      return;
    }
    
    // Lấy danh sách staff từ dữ liệu đã load
    // API trả về mảng các assignment, mỗi assignment có staffId object
    const staffList = staffData.map((assignment: AssignmentData) => ({
      _id: assignment.staffId._id,
      name: assignment.staffId.name,
      email: assignment.staffId.email,
      phone: assignment.staffId.phone,
      role: 'Staff' // Mặc định role
    }));
    
    // Cập nhật state local để hiển thị trong modal
    setCurrentModalStaff(staffList);
    setStaffModalOpen(true);
  };

  // Hàm lấy số nhân viên cho một property
  const loadStaffCountForProperty = useCallback(async (propertyId: string) => {
    // Kiểm tra xem đã load property này chưa
    if (loadedPropertiesRef.current.has(propertyId)) return;
    
    // Đánh dấu đã load
    loadedPropertiesRef.current.add(propertyId);
    
    setLoadingStaffCounts(prev => ({ ...prev, [propertyId]: true }));
    try {
      const result = await dispatch(getStaffByProperty(propertyId));
      if (getStaffByProperty.fulfilled.match(result)) {
        const staffData = result.payload?.data || [];
        const staffCount = staffData.length;
        setPropertyStaffCounts(prev => ({ ...prev, [propertyId]: staffCount }));
        setPropertyStaffData(prev => ({ ...prev, [propertyId]: staffData }));
      }
    } catch (error) {
      console.error('Error loading staff count for property:', propertyId, error);
    } finally {
      setLoadingStaffCounts(prev => ({ ...prev, [propertyId]: false }));
    }
  }, [dispatch]);

  const loadProperties = useCallback(async () => {
    try {
      console.log('Current filters state:', filters); // Log state hiện tại của filters
      const result = await dispatch(
        fetchProperties({
          ...filters,
          search: filters.search.trim(), // Đảm bảo cắt khoảng trắng
        }),
      );
      console.log('API call result:', result); // Log kết quả API
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Lỗi tải danh sách properties!');
    }
  }, [filters, dispatch]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]); // Chạy khi loadProperties thay đổi

  // Load số nhân viên cho từng property khi properties thay đổi
  useEffect(() => {
    // Reset dữ liệu cũ và ref khi properties thay đổi
    setPropertyStaffCounts({});
    setLoadingStaffCounts({});
    loadedPropertiesRef.current.clear();
    
    if (properties.length > 0) {
      properties.forEach(property => {
        if (property._id) {
          loadStaffCountForProperty(property._id);
        }
      });
    }
  }, [properties, loadStaffCountForProperty]);

  const handleFilterChange = (field: keyof PropertiesFilters, value: string | number) => {
    console.log(`Filter changed: ${field} = ${value}`); // Log khi filter thay đổi
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? Number(value) : 1, // Ép kiểu về number
    }));
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý Properties</h1>
          <p className='text-gray-600'>Quản lý tất cả properties và bất động sản</p>
        </div>
        <div className='flex gap-2'>
     
          <Link to='/admin/properties/create'>
            <Button>
              <Plus className='w-4 h-4 mr-2' />
              Thêm Property
            </Button>
          </Link>
    
        </div>
      </div>

      {/* Filters + Tổng số properties */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='w-5 h-5' />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='relative w-full'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Tìm kiếm theo tên...'
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className='pl-10 w-full'
              />
            </div>
            <div>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                className='border border-gray-300 rounded-md px-3 py-2 w-full'>
                <option value={10}>10 items/page</option>
                <option value={20}>20 items/page</option>
                <option value={50}>50 items/page</option>
              </select>
            </div>
            <div className='flex flex-col items-center justify-center border border-gray-300 bg-white rounded-md px-4 py-0 w-full min-h-[36px]'>
              <div className='text-2xl font-bold'>{total}</div>
              <div className='text-sm text-gray-600'>Tổng số properties</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-none bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">Danh sách HomeStay</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : error ? (
            <div className='text-center py-12 text-red-500'>{error}</div>
          ) : (
            <div className='overflow-x-auto'>
              <Table className="border-none">
                <TableHeader>
                  <TableRow className="border-none bg-gray-50 hover:bg-gray-50">
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6">Ảnh</TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6">Tên</TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6">Địa chỉ</TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6">Staff</TableHead>
                    <TableHead className="border-none text-gray-700 font-semibold py-4 px-6">Ngày tạo</TableHead>
                    <TableHead className='text-right border-none text-gray-700 font-semibold py-4 px-6'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property, index) => (
                    <TableRow 
                      key={property._id} 
                      className={`border-none hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <TableCell className="border-none py-4 px-6">
                        <Link to={`/admin/properties/${property._id}`} title='Xem chi tiết'>
                          {property.thumbnail ? (
                            <img
                              src={property.thumbnail}
                              alt={property.name}
                              style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }}
                              className='cursor-pointer hover:opacity-80 transition-opacity duration-200 shadow-sm'
                            />
                          ) : property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.name}
                              style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }}
                              className='cursor-pointer hover:opacity-80 transition-opacity duration-200 shadow-sm'
                            />
                          ) : (
                            <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className='text-gray-400 text-xs'>No image</span>
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className='font-medium border-none py-4 px-6'>
                        <Link to={`/admin/properties/${property._id}`} title='Xem chi tiết'>
                          <div className='max-w-xs truncate cursor-pointer hover:text-blue-600 transition-colors duration-200 font-semibold text-gray-800' title={property.name}>
                            {property.name}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="border-none py-4 px-6">
                        <div className='max-w-xs truncate text-gray-600' title={property.location?.address}>
                          {property.location?.address}
                        </div>
                      </TableCell>
                      <TableCell className="border-none py-4 px-6">
                        <div className='flex items-center gap-2'>
                          <button
                            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 hover:bg-blue-100 border-none rounded-lg px-3 py-1.5 transition-all duration-200'
                            type='button'
                            onClick={() => handleShowStaff(property._id || '')}
                            disabled={loadingStaffCounts[property._id || ''] || (propertyStaffCounts[property._id || ''] || 0) === 0}
                            title={property.staffIds && property.staffIds.length > 0 && staffList.length > 0
                              ? staffList
                                  .filter(s => property.staffIds.includes(s._id))
                                  .map(s => s.name || s.email || s._id)
                                  .join(', ')
                              : ''}
                          >
                            <UsersIcon className='w-4 h-4 text-blue-500' />
                            <span className='inline-block min-w-[24px] text-center font-semibold text-sm bg-blue-600 text-white rounded-full px-2 py-0.5'>
                              {loadingStaffCounts[property._id || ''] ? (
                                <div className='animate-spin rounded-full h-3 w-3 border-b border-white'></div>
                              ) : (
                                propertyStaffCounts[property._id || ''] || 0
                              )}
                            </span>
                            <span className='ml-1 text-xs text-blue-700 font-medium'>staff</span>
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="border-none py-4 px-6">
                        <div className='text-sm text-gray-500 font-medium'>
                          {property.createdAt ? new Date(property.createdAt).toLocaleDateString('vi-VN') : ''}
                        </div>
                      </TableCell>
                      <TableCell className='text-right border-none py-4 px-6'>
                        <div className='flex items-center justify-end gap-1'>
                          <Link to={`/admin/properties/${property._id}`} title='Xem chi tiết'>
                            <Button variant='ghost' size='icon' className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                              <Eye className='h-4 w-4' />
                            </Button>
                          </Link>
                          <Link to={`/admin/properties/edit/${property._id}`} title='Chỉnh sửa'>
                            <Button variant='ghost' size='icon' className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200">
                              <Edit className='h-4 w-4' />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {properties.length === 0 && (
                <div className='text-center py-12 text-gray-500'>
                  <div className="text-lg font-medium">Không có properties nào</div>
                  <div className="text-sm text-gray-400 mt-1">Hãy thêm property đầu tiên</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > filters.limit && (
        <div className='flex justify-center items-center space-x-2'>
          <Button
            variant='outline'
            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className='flex items-center justify-center'>
            <ChevronLeft className='w-5 h-5' />
          </Button>
          <span className='text-sm'>
            Trang {filters.page} / {Math.ceil(total / filters.limit)}
          </span>
          <Button
            variant='outline'
            onClick={() => handleFilterChange('page', filters.page + 1)}
            disabled={filters.page >= Math.ceil(total / filters.limit)}
            className='flex items-center justify-center'>
            <ChevronRight className='w-5 h-5' />
          </Button>
        </div>
      )}

      {/* Modal hiển thị staff */}
      <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
        <DialogContent className='bg-white rounded-2xl shadow-xl max-w-lg w-full p-8'>
          <DialogHeader>
            <DialogTitle>Danh sách nhân viên</DialogTitle>
          </DialogHeader>
          {currentModalStaff.length === 0 ? (
            <div className='text-center py-4 text-gray-500'>Chưa có nhân viên nào</div>
          ) : (
            <div className='space-y-4'>
              {currentModalStaff.map((staff, idx) => (
                <div key={staff._id || idx} className='border-b pb-2 mb-2'>
                  <div className='font-semibold text-base'>{staff.name || staff.email || staff._id}</div>
                  <div className='text-sm text-gray-600'>Email: {staff.email || '-'}</div>
                  <div className='text-sm text-gray-600'>SĐT: {staff.phone || '-'}</div>
                  <div className='text-sm text-gray-600'>Role: {staff.role || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
