import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateServiceDto } from '@/types/services';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadIcon, resetUpload } from '@/store/slices/uploadSlice';
import { RootState, AppDispatch } from '@/store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const serviceSchema = z.object({
  name: z.string().nonempty('Tên dịch vụ không được để trống').max(100, 'Tên dịch vụ không được vượt quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
  unit: z.string().nonempty('Đơn vị không được để trống'),
  default_price: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  icon_url: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
  allow_quantity: z.boolean().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface Props {
  initialValues?: Partial<CreateServiceDto>;
  loading?: boolean;
  onSubmit: (data: CreateServiceDto) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const defaultValues: CreateServiceDto = {
  name: '',
  description: '',
  unit: '',
  default_price: 0,
  icon_url: '',
  is_active: true,
  allow_quantity: false,
};

const ServiceFormModal = ({ initialValues, loading, onSubmit, onClose, isEdit }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const uploadState = useSelector((state: RootState) => state.upload);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialValues || defaultValues,
  });

  React.useEffect(() => {
    reset(initialValues || defaultValues);
    if (!initialValues || !initialValues.icon_url) {
      dispatch(resetUpload());
      setValue('icon_url', '');
    }
  }, [initialValues, reset, dispatch, setValue]);

  React.useEffect(() => {
    if (uploadState.url) {
      setValue('icon_url', uploadState.url);
    }
  }, [uploadState.url, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(uploadIcon(file));
    }
  };

  const iconUrl = watch('icon_url');

  const handleFormSubmit = (data: ServiceFormValues) => {
    onSubmit({
      ...data,
      default_price: Number(data.default_price),
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fadeIn'>
        <div className='flex items-center justify-between border-b px-6 py-4'>
          <h3 className='text-xl font-bold text-gray-800'>{isEdit ? 'Sửa dịch vụ' : 'Tạo dịch vụ mới'}</h3>
          <button onClick={onClose} className='p-1 rounded hover:bg-gray-100 transition'>
            <X className='w-5 h-5' />
          </button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='px-6 py-6 space-y-5'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tên dịch vụ <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('name')}
              placeholder='Nhập tên dịch vụ'
              className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className='text-xs text-red-500 mt-1'>{errors.name.message}</p>}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Mô tả</label>
            <textarea
              {...register('description')}
              placeholder='Mô tả dịch vụ (không bắt buộc)'
              className='border rounded-md px-3 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300'
            />
            {errors.description && <p className='text-xs text-red-500 mt-1'>{errors.description.message}</p>}
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Đơn vị <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('unit')}
                placeholder='Đơn vị (VD: /ngày, /lần)'
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.unit ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.unit && <p className='text-xs text-red-500 mt-1'>{errors.unit.message}</p>}
            </div>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Giá <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                {...register('default_price')}
                placeholder='Giá'
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.default_price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.default_price && <p className='text-xs text-red-500 mt-1'>{errors.default_price.message}</p>}
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Icon</label>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                className='px-3 py-1.5 border border-gray-300 bg-white text-gray-800 rounded hover:border-blue-400 transition'
                onClick={() => fileInputRef.current?.click()}>
                Chọn icon...
              </button>
              <input type='file' accept='image/*' ref={fileInputRef} onChange={handleFileChange} className='hidden' />
              {iconUrl ? (
                <img src={iconUrl} alt='icon' style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} />
              ) : (
                <span className='text-gray-400 text-lg'>Không có tệp nào được chọn</span>
              )}
            </div>
            {uploadState.loading && <span className='text-xs text-blue-500 ml-2'>Đang upload...</span>}
            {uploadState.error && <span className='text-xs text-red-500 ml-2'>{uploadState.error}</span>}
          </div>
          <div className='flex items-center gap-2'>
            <input
              id='active'
              type='checkbox'
              {...register('is_active')}
              defaultChecked
              className='accent-primary w-5 h-5'
            />
            <label htmlFor='active' className='font-medium select-none'>
              Đang hoạt động
            </label>
          </div>
          <div className='flex items-center gap-2'>
            <Switch
              id='allow_quantity'
              checked={watch('allow_quantity')}
              onCheckedChange={(checked) => setValue('allow_quantity', checked)}
            />
            <Label htmlFor='allow_quantity' className='font-medium select-none'>
              Cho phép số lượng
            </Label>
          </div>
          <p className='text-sm text-gray-500 ml-6'>
            Khi bật: Khách hàng có thể chọn nhiều lần dịch vụ này. Khi tắt: Chỉ có thể chọn 1 lần.
          </p>
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='secondary' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit' disabled={loading} className='font-semibold'>
              {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
