import React, { useState } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { createAmenity } from '@/store/slices/amenitySlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/store';
import { api } from '@/services/api';

export default function CreateAmenities() {
  const dispatch: AppDispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon_url: '',
    is_active: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
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
    } catch {
      alert('Upload ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Tên tiện ích là bắt buộc');
      return;
    }
    setLoading(true);
    try {
      // Tạm thời bỏ is_active vì backend DTO không có field này
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { is_active, ...submitData } = form;
      console.log('Creating amenity with data:', submitData);
      console.log('Note: is_active field removed because backend DTO does not support it');
      await dispatch(createAmenity(submitData)).unwrap();
      navigate('/admin/amenities');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Thêm tiện ích mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Tên tiện ích <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 w-full min-h-[80px]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Icon</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block"
            disabled={uploading}
          />
          {uploading && <div className="text-xs text-blue-500 mt-1">Đang tải ảnh...</div>}
          {form.icon_url && (
            <img src={form.icon_url} alt="icon preview" className="w-16 h-16 mt-2 object-contain border rounded" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            id="is_active"
            className="accent-green-600 w-4 h-4"
          />
          <label htmlFor="is_active" className="font-semibold select-none">Hoạt động</label>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
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
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}
