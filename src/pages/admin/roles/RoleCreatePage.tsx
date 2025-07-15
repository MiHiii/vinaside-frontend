import React, { useState } from 'react';
import { useRolesManagement } from '@/hooks/useRbac';
import { CreateRoleDto } from '@/types/rbac';

const RoleCreatePage: React.FC = () => {
  const rolesManagement = useRolesManagement();
  const [form, setForm] = useState<CreateRoleDto>({ key: '', name: '', description: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await rolesManagement.createRole(form);
    setSuccess(true);
    setForm({ key: '', name: '', description: '' });
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Thêm mới vai trò</h2>
      {success && <div className="mb-4 text-green-600">Tạo vai trò thành công!</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Mã vai trò *</label>
          <input
            className="w-full border rounded p-2"
            name="key"
            value={form.key}
            onChange={handleChange}
            required
            placeholder="admin, manager..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Tên vai trò *</label>
          <input
            className="w-full border rounded p-2"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Quản trị viên, Quản lý..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Mô tả</label>
          <textarea
            className="w-full border rounded p-2"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả vai trò..."
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Thêm mới
        </button>
      </form>
    </div>
  );
};

export default RoleCreatePage; 