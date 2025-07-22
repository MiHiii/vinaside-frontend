import React, { useEffect, useState, ChangeEvent } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { User, Role } from '../../../types/user';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { uploadUserAvatar } from '@/store/slices/userSlice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useRef } from 'react';
import { rbacApi } from '@/services/rbacApi';

interface Props {
  open: boolean;
  onClose: () => void;
  editUser: User | null;
  roles: Role[];
}

const userSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string()
    .min(10, 'Số điện thoại phải đủ 10 số')
    .max(10, 'Số điện thoại phải đủ 10 số')
    .regex(/^[0-9]{10}$/, 'Số điện thoại chỉ gồm 10 số'),
  customRoles: z.array(z.string()).min(1, 'Chọn ít nhất 1 vai trò'),
  avatar_url: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});
type UserFormValues = z.infer<typeof userSchema>;

const UserFormModal: React.FC<Props> = ({ open, onClose, editUser, roles }) => {
  const { createUser, updateUser } = useUsers();
  const dispatch = useAppDispatch();
  const { uploadAvatarLoading } = useAppSelector(state => state.users);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(editUser?.avatar_url);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { register, handleSubmit, setValue, reset, setError, formState: { errors }, watch } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: editUser?.name || '',
      email: editUser?.email || '',
      phone: editUser?.phone || '',
      customRoles: editUser?.customRoles ? editUser.customRoles.map(r => typeof r === 'string' ? r : r.key) : [],
      avatar_url: editUser?.avatar_url || '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (editUser) {
      reset({
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        customRoles: editUser.customRoles ? editUser.customRoles.map(r => typeof r === 'string' ? r : r.key) : [],
        avatar_url: editUser.avatar_url || '',
      });
      setAvatarPreview(editUser.avatar_url);
    } else {
      reset({ name: '', email: '', phone: '', customRoles: [], avatar_url: '' });
      setAvatarPreview(undefined);
    }
  }, [editUser, open, reset]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const result = await dispatch(uploadUserAvatar(file));
    if (uploadUserAvatar.fulfilled.match(result)) {
      const url = result.payload;
      setValue('avatar_url', url, { shouldValidate: true });
    } else {
      toast.error((result.payload as string) || 'Upload avatar thất bại!');
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    try {
      if (editUser) {
        await updateUser({
          id: editUser._id,
          userData: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            avatar_url: data.avatar_url,
            customRoles: data.customRoles,
          },
        });
        // Gán customRole cho user (tạo bản ghi usercustomroles)
        for (const roleKey of data.customRoles) {
          await rbacApi.assignRoleToUser(editUser._id, { roleKey });
        }
        toast.success('Cập nhật tài khoản thành công!');
      } else {
        const res = await createUser({
          userData: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            avatar_url: data.avatar_url,
            password: data.password!,
            customRoles: data.customRoles,
          },
        }).unwrap();
        const userId = res._id;
        // Gán customRole cho user mới (tạo bản ghi usercustomroles)
        for (const roleKey of data.customRoles) {
          await rbacApi.assignRoleToUser(userId, { roleKey });
        }
        toast.success('Tạo tài khoản thành công!');
      }
      onClose();
    } catch (err) {
      // Nếu lỗi là email đã tồn tại, show dưới trường email
      const msg = typeof err === 'string' ? err : (err as { message?: string })?.message || '';
      if (msg.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: msg });
      } else {
        toast.error(msg || 'Có lỗi xảy ra!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">{editUser ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          <div className="flex flex-col items-center mb-2">
            <div className="relative mb-2">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {watch('name')?.[0]?.toUpperCase() || watch('email')?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute left-0 top-0 w-16 h-16 opacity-0 cursor-pointer"
                title="Chọn ảnh đại diện"
                disabled={uploadAvatarLoading}
              />
            </div>
            <span className="text-xs text-gray-500">Chọn ảnh đại diện</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
            <input {...register('name')} placeholder="Nhập tên" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300 ${errors.name ? 'border-red-500' : ''}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input {...register('email')} placeholder="Nhập email" type="email" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300 ${errors.email ? 'border-red-500' : ''}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
            <input {...register('phone')} placeholder="Nhập số điện thoại" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300 ${errors.phone ? 'border-red-500' : ''}`} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (có thể chọn nhiều) <span className="text-red-500">*</span></label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={`border rounded px-2 py-2 text-sm w-full text-left bg-white ${errors.customRoles ? 'border-red-500' : 'border-gray-300'}`}
                onClick={() => setDropdownOpen(o => !o)}
              >
                {watch('customRoles') && watch('customRoles').length > 0
                  ? roles.filter(opt => watch('customRoles').includes(opt.key)).map(opt => opt.name).join(', ')
                  : 'Chọn vai trò...'}
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-60 overflow-y-auto">
                  {roles.map(opt => (
                    <label key={opt.key} className="flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100">
                      <Checkbox
                        checked={watch('customRoles').includes(opt.key)}
                        onCheckedChange={checked => {
                          const prev = watch('customRoles') || [];
                          if (checked) {
                            setValue('customRoles', [...prev, opt.key], { shouldValidate: true });
                          } else {
                            setValue('customRoles', prev.filter(k => k !== opt.key), { shouldValidate: true });
                          }
                        }}
                      />
                      <span className="ml-2">{opt.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.customRoles && <p className="text-xs text-red-500 mt-1">{errors.customRoles.message}</p>}
          </div>
          {/* Thêm password khi tạo mới */}
          {!editUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                <input type="password" {...register('password')} placeholder="Nhập mật khẩu" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300 ${errors.password ? 'border-red-500' : ''}`} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                <input type="password" {...register('confirmPassword')} placeholder="Nhập lại mật khẩu" className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
            <Button type="submit" disabled={loading || uploadAvatarLoading} className="font-semibold">
              {loading || uploadAvatarLoading ? 'Đang lưu...' : (editUser ? 'Lưu thay đổi' : 'Tạo mới')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal; 