import { useEffect, useState, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';
import ServiceTable from '@/components/admin/service/ServiceTable';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ServiceFormModal from '@/components/admin/service/ServiceFormModal';
import ServiceDetailModal from '@/components/admin/service/ServiceDetailModal';
import { CreateServiceDto } from '@/types/services';
import { PermissionGuard } from '@/components/common/PermissionGuard';

const ServiceListPage = () => {
  const {
    services,
    loading,
    error,
    getServices,
    getServiceDetail,
    addService,
    editService,
    deleteService,
    restore,
    toggleStatus,
    toggleQuantity,
    clearError,
    serviceDetail,
    clearDetail,
  } = useServices();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);

  useEffect(() => {
    getServices();
  }, [getServices]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (editId) getServiceDetail(editId);
    else clearDetail();
  }, [editId, getServiceDetail, clearDetail]);

  useEffect(() => {
    if (showDetailId) getServiceDetail(showDetailId);
    else clearDetail();
  }, [showDetailId, getServiceDetail, clearDetail]);

  const filteredServices = useMemo(() => {
    return (services || []).filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'all' ? true : status === 'active' ? s.is_active : !s.is_active;
      return matchSearch && matchStatus;
    });
  }, [services, search, status]);

  const total = (services || []).length;
  const active = (services || []).filter((s) => s.is_active).length;
  const inactive = (services || []).filter((s) => !s.is_active).length;

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?');
    if (!confirm) return;
    const result = await deleteService(id);
    if (result.meta && result.meta.requestStatus === 'fulfilled') {
      toast.success('Xóa dịch vụ thành công!');
    }
  };

  const handleRestore = async (id: string) => {
    const result = await restore(id);
    if (result.meta && result.meta.requestStatus === 'fulfilled') {
      toast.success('Khôi phục dịch vụ thành công!');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus(id);
      toast.success('Cập nhật trạng thái thành công');
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleToggleQuantity = async (id: string) => {
    try {
      console.log('handleToggleQuantity - Starting toggle for service ID:', id);
      const result = await toggleQuantity(id);
      console.log('handleToggleQuantity - Result:', result);

      if (result.meta && result.meta.requestStatus === 'fulfilled') {
        toast.success('Cập nhật cho phép số lượng thành công');
      } else if (result.meta && result.meta.requestStatus === 'rejected') {
        console.error('handleToggleQuantity - Request rejected:', result.payload);
        toast.error((result.payload as string) || 'Có lỗi xảy ra khi cập nhật cho phép số lượng');
      }
    } catch (error) {
      console.error('handleToggleQuantity - Error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật cho phép số lượng');
    }
  };

  const handleFormSubmit = async (data: CreateServiceDto) => {
    if (editId) {
      const result = await editService(editId, data);
      if (result.meta && result.meta.requestStatus === 'fulfilled') {
        toast.success('Cập nhật dịch vụ thành công!');
        setShowForm(false);
        setEditId(null);
      }
    } else {
      const result = await addService(data);
      if (result.meta && result.meta.requestStatus === 'fulfilled') {
        toast.success('Tạo dịch vụ thành công!');
        setShowForm(false);
        setEditId(null);
      }
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Quản lý dịch vụ</h2>
        <PermissionGuard permission='service.create'>
          <Button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}>
            Tạo dịch vụ mới
          </Button>
        </PermissionGuard>
      </div>
      {/* Bộ lọc */}
      <div className='bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row gap-4 md:gap-7 items-center w-full'>
        <span className='font-medium flex items-center gap-2 text-gray-700 w-full md:w-auto mb-2 md:mb-0'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z'
            />
          </svg>
          Bộ lọc
        </span>
        <input
          placeholder='Tìm kiếm theo tên...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border rounded px-3 py-2 w-full md:w-80'
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='border rounded px-3 py-2 w-full md:w-80'>
          <option value='all'>Tất cả trạng thái</option>
          <option value='active'>Đang hoạt động</option>
          <option value='inactive'>Không hoạt động</option>
        </select>
        <button
          type='button'
          onClick={() => {
            setSearch('');
            setStatus('all');
          }}
          className='border rounded px-3 py-2 w-full md:w-80'>
          Làm mới
        </button>
      </div>
      {/* Card thống kê */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 w-full'>
        <div className='bg-white rounded shadow p-4 text-center'>
          <div className='text-lg font-bold'>{total}</div>
          <div className='text-gray-500 text-sm'>Tổng số dịch vụ</div>
        </div>
        <div className='bg-white rounded shadow p-4 text-center'>
          <div className='text-lg font-bold text-green-600'>{active}</div>
          <div className='text-gray-500 text-sm'>Đang hoạt động</div>
        </div>
        <div className='bg-white rounded shadow p-4 text-center'>
          <div className='text-lg font-bold text-yellow-600'>{inactive}</div>
          <div className='text-gray-500 text-sm'>Không hoạt động</div>
        </div>
      </div>
      {/* Bảng dịch vụ */}
      <h3 className='font-semibold mb-2'>Danh sách dịch vụ</h3>
      <div className='overflow-x-auto'>
        <ServiceTable
          services={filteredServices}
          onEdit={(id) => {
            setEditId(id);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleStatus={handleToggleStatus}
          onToggleQuantity={handleToggleQuantity}
          onShowDetail={setShowDetailId}
        />
      </div>
      {showForm && (
        <ServiceFormModal
          initialValues={editId ? serviceDetail || undefined : undefined}
          loading={loading}
          isEdit={!!editId}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditId(null);
          }}
        />
      )}
      {showDetailId && serviceDetail && (
        <ServiceDetailModal service={serviceDetail} onClose={() => setShowDetailId(null)} />
      )}
    </div>
  );
};

export default ServiceListPage;
