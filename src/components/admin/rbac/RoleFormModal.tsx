import React, { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export interface RoleFormData {
  key: string;
  name: string;
  description?: string;
}

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
  initialData?: RoleFormData | null;
  loading?: boolean;
}

const roleSchema = z.object({
  key: z.string()
    .nonempty('Mã vai trò là bắt buộc')
    .max(32, 'Mã vai trò tối đa 32 ký tự')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Mã vai trò không chứa dấu cách hoặc ký tự đặc biệt'),
  name: z.string()
    .nonempty('Tên vai trò là bắt buộc')
    .max(100, 'Tên vai trò tối đa 100 ký tự'),
  description: z.string().max(255, 'Mô tả tối đa 255 ký tự').optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const RoleFormModal: React.FC<RoleFormModalProps> = ({ open, onClose, onSubmit, initialData, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData || { key: '', name: '', description: '' },
    // mode mặc định là 'onSubmit', không cần chỉ định
  });

  useEffect(() => {
    reset(initialData || { key: '', name: '', description: '' });
  }, [initialData, open, reset]);

  if (!open) return null;

  const onFormSubmit = (data: RoleFormValues) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Chỉnh sửa vai trò' : 'Thêm mới vai trò'}</h2>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Mã vai trò <span className="text-red-500">*</span></label>
            <input
              className="w-full border rounded p-2"
              {...register('key')}
              placeholder="admin, manager..."
              disabled={!!initialData}
            />
            {errors.key && <p className="text-xs text-red-500 mt-1">{errors.key.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Tên vai trò <span className="text-red-500">*</span></label>
            <input
              className="w-full border rounded p-2"
              {...register('name')}
              placeholder="Quản trị viên, Quản lý..."
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Mô tả</label>
            <textarea
              className="w-full border rounded p-2"
              {...register('description')}
              placeholder="Mô tả vai trò..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (initialData ? 'Lưu thay đổi' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal; 