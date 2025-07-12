import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchAmenityById, updateAmenity, selectAmenityDetail, selectAmenitiesLoading, selectAmenitiesError } from '@/store/slices/amenitySlice';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch } from '@/store';
import { api } from '@/services/api';
import { z } from 'zod';

const amenitySchema = z.object({
  name: z.string().min(1, 'Tên tiện ích là bắt buộc'),
  description: z.string().optional(),
  icon_url: z.string().url('Icon phải là một URL hợp lệ'),
  is_active: z.boolean(),
});

type AmenityForm = z.infer<typeof amenitySchema>;

export default function EditAmenities() {
  const dispatch: AppDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const amenity = useAppSelector(selectAmenityDetail);
  const loading = useAppSelector(selectAmenitiesLoading);
  const error = useAppSelector(selectAmenitiesError);

  const [form, setForm] = useState<AmenityForm>({
    name: '',
    description: '',
    icon_url: '',
    is_active: false,
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AmenityForm, string>>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchAmenityById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (amenity) {
      console.log('Loading amenity data:', amenity);
      console.log('is_active value:', amenity.is_active, 'type:', typeof amenity.is_active);
      setForm({
        name: amenity.name || '',
        description: amenity.description || '',
        icon_url: amenity.icon_url || '',
        is_active: amenity.is_active === true,
      });
    }
  }, [amenity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    console.log('handleChange called:', { name, value, type }); // Debug log
    
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const checkbox = e.target as HTMLInputElement;
      console.log('Checkbox changed:', { name, checked: checkbox.checked }); // Debug log
      setForm(f => {
        const newForm = {
          ...f,
          [name]: checkbox.checked,
        };
        console.log('New form state:', newForm); // Debug log
        return newForm;
      });
    } else {
      setForm(f => ({
        ...f,
        [name]: value,
      }));
    }
    setFieldErrors({ ...fieldErrors, [name]: undefined });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, icon_url: res.data.data?.urls?.[0] || '' }));
      setFieldErrors(fe => ({ ...fe, icon_url: undefined }));
    } catch {
      alert('Upload ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    const result = amenitySchema.safeParse(form);
    if (!result.success) {
      const errors: Partial<Record<keyof AmenityForm, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as keyof AmenityForm] = err.message;
      });
      setFieldErrors(errors);
      return;
    }
    if (!id) return;
    try {
      const submitData = {
        ...form,
        is_active: Boolean(form.is_active),
      };
      console.log('Submitting data:', submitData);
      await dispatch(updateAmenity({ id, ...submitData })).unwrap();
      navigate('/admin/amenities');
    } catch (err) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Chỉnh sửa tiện ích</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Tên tiện ích <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`border rounded px-3 py-2 w-full ${fieldErrors.name ? 'border-red-400' : 'border-gray-300'}`}
            required
            disabled={loading}
          />
          {fieldErrors.name && <div className="text-red-500 text-xs mt-1">{fieldErrors.name}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={`border rounded px-3 py-2 w-full min-h-[80px] ${fieldErrors.description ? 'border-red-400' : 'border-gray-300'}`}
            disabled={loading}
          />
          {fieldErrors.description && <div className="text-red-500 text-xs mt-1">{fieldErrors.description}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Icon</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block"
            disabled={uploading || loading}
          />
          {uploading && <div className="text-xs text-blue-500 mt-1">Đang tải ảnh...</div>}
          {form.icon_url && (
            <img src={form.icon_url} alt="icon preview" className="w-16 h-16 mt-2 object-contain border rounded" />
          )}
          {fieldErrors.icon_url && <div className="text-red-500 text-xs mt-1">{fieldErrors.icon_url}</div>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            id="is_active"
            className="accent-green-600 w-4 h-4"
            disabled={loading}
          />
          <label htmlFor="is_active" className="font-semibold select-none">Hoạt động</label>
        </div>
        {(formError || error) && <div className="text-red-500 text-sm">{formError || error}</div>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"
            onClick={() => navigate('/admin/amenities')}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            disabled={loading || uploading}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}
