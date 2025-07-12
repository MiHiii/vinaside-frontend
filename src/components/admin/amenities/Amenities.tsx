import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchAmenities, selectAmenities, selectAmenitiesLoading, selectAmenitiesError, deleteAmenity } from '@/store/slices/amenitySlice';
import {  Edit, Trash2, ImageOff, Filter, Search, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Amenity } from '@/types/amenity';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Ẩn' },
];

// Helper function to determine actual status
const getActualStatus = (amenity: Amenity) => {
  // Nếu is_active === true thì hiển thị "Hoạt động"
  // Nếu is_active === false hoặc null/undefined thì hiển thị "Ẩn"
  return amenity.is_active === true;
};

export default function Amenities() {
  const dispatch = useAppDispatch();
  const amenities = useAppSelector(selectAmenities);
  const loading = useAppSelector(selectAmenitiesLoading);
  const error = useAppSelector(selectAmenitiesError);
  const [filters, setFilters] = useState({
    search: '',
    is_active: '',
    limit: 10,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmPromise = new Promise<boolean>((resolve) => {
      toast(
        (t) => (
          <span>
            <div>Bạn có chắc chắn muốn xóa tiện ích này?</div>
            <div className="flex gap-2 mt-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Xóa
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Hủy
              </button>
            </div>
          </span>
        ),
        { duration: 10000 }
      );
    });
    const confirmed = await confirmPromise;
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await dispatch(deleteAmenity(id)).unwrap();
      // Convert is_active to boolean or undefined
      const query: Record<string, string | number | boolean> = { ...filters };
      if (query.is_active === 'true') query.is_active = true;
      else if (query.is_active === 'false') query.is_active = false;
      else delete query.is_active;
      dispatch(fetchAmenities(query));
      toast.success('Đã xóa tiện ích thành công!');
    } catch {
      toast.error('Xóa tiện ích thất bại!');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const params: Record<string, string | number> = { ...filters };
    if (!params.is_active) delete params.is_active;
    if (!params.search) delete params.search;
    dispatch(fetchAmenities(params)).then((result) => {
      // Debug: Log the actual data from API
      console.log('API Response:', result);
      if (result.payload && typeof result.payload === 'object' && 'amenities' in result.payload) {
        const payload = result.payload as { amenities: Amenity[]; total: number };
        console.log('Amenities data:', payload.amenities);
        payload.amenities.forEach((amenity: Amenity, index: number) => {
          console.log(`Amenity ${index}:`, {
            name: amenity.name,
            is_active: amenity.is_active,
            type: typeof amenity.is_active
          });
        });
      }
    });
  }, [dispatch, filters]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách tiện ích</h1>
        <Link to="/admin/amenities/create">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            Thêm tiện ích
          </button>
        </Link>
      </div>
      {/* Bộ lọc */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pl-10 border border-gray-300 rounded-md px-3 py-2 w-full"
              />
            </div>
            <select
              value={filters.is_active}
              onChange={e => setFilters(f => ({ ...f, is_active: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.limit}
              onChange={e => setFilters(f => ({ ...f, limit: Number(e.target.value) }))}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              <option value={10}>10 items/page</option>
              <option value={20}>20 items/page</option>
              <option value={50}>50 items/page</option>
            </select>
          </div>
        </CardContent>
      </Card>
      <div className="bg-white rounded-xl shadow p-4">
        {loading && <div>Đang tải...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 border">Icon</th>
                <th className="px-3 py-2 border">Tên</th>
                <th className="px-3 py-2 border">Mô tả</th>
                <th className="px-3 py-2 border">Trạng thái</th>
                <th className="px-3 py-2 border">Ngày tạo</th>
                <th className="px-3 py-2 border">Cập nhật</th>
                <th className="px-3 py-2 border text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && amenities.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">Không có tiện ích nào.</td>
                </tr>
              )}
              {amenities.filter(Boolean).map(a => (
                <tr key={a._id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-2 border text-center">
                    {a?.icon_url ? (
                      <img src={a.icon_url} alt={a.name} className="w-8 h-8 object-contain mx-auto" />
                    ) : (
                      <ImageOff className="w-6 h-6 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2 border font-semibold">{a?.name}</td>
                  <td className="px-3 py-2 border text-gray-600 max-w-xs truncate" title={a?.description}>{a?.description}</td>
                  <td className="px-3 py-2 border text-center">
                    {getActualStatus(a) ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">Hoạt động</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">Ẩn</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border text-gray-500">
                    {a?.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-3 py-2 border text-gray-500">
                    {a?.updated_at ? new Date(a.updated_at).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* <button title="Chi tiết" className="p-1 hover:bg-gray-200 rounded">
                        <Eye className="w-4 h-4 text-blue-600" />                     </button> */}
                      <Link
                        to={`/admin/amenities/edit/${a._id}`}
                        title="Sửa"
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit className="w-4 h-4 text-yellow-600" />
                      </Link>
                      <button title="Xóa" className="p-1 hover:bg-gray-200 rounded" onClick={() => handleDelete(a._id)} disabled={deletingId === a._id}>
                        {deletingId === a._id ? (
                          <span className="text-xs text-gray-400">Đang xóa...</span>
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
