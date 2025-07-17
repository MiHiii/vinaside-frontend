import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import UserTable from '../../../components/admin/user/UserTable';
import UserFormModal from '../../../components/admin/user/UserFormModal';
import { useUsers } from '../../../hooks/useUsers';
import { User } from '../../../types/user';
import { Button } from '@/components/ui/button';
import AdminPagination from '../../../components/admin/Pagination';

const AdminUserPage = () => {
  const { users, roles, fetchUsers, pagination } = useUsers();
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  // Bộ lọc
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  React.useEffect(() => {
    fetchUsers({ page, limit });
  }, [page]);

  // Tạo danh sách tất cả role có thể lọc (từ roles và từ users)
  const allRoleOptions = React.useMemo(() => {
    const roleKeysFromRoles = roles.map(r => r.key);
    // Lấy các role có trong user nhưng không có trong roles
    const extraRoles = users
      .map(u => u.role)
      .filter(
        (role): role is string => !!role && !roleKeysFromRoles.includes(role)
      );
    // Trả về mảng [{key, name}] cho roles, và {key, name: key} cho extraRoles
    const roleOptions = [
      ...roles.map(r => ({ key: r.key, name: r.name })),
      ...Array.from(new Set(extraRoles)).map(key => ({ key, name: key })),
    ];
    return roleOptions;
  }, [roles, users]);

  // Nếu filter ở FE, chỉ filter users đã fetch
  // Ở đây giữ nguyên filter FE như cũ

  const handleAdd = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setOpenModal(true);
  };

  const handleRefresh = () => {
    fetchUsers({ page, limit });
    setName('');
    setEmail('');
    setPhone('');
    setRoleFilter('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý tài khoản</h2>
        <Button onClick={handleAdd}>Tạo tài khoản mới</Button>
      </div>
      {/* Bộ lọc */}
      <div className="bg-white border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-700">Bộ lọc</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm theo tên..."
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tìm theo email..."
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tìm theo SĐT..."
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <select
            className="border rounded px-2 py-2 text-sm w-full capitalize"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            {allRoleOptions.map(r => (
              <option key={r.key} value={r.key} className="capitalize">{r.name.charAt(0).toUpperCase() + r.name.slice(1)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            className="border rounded px-3 py-2 text-sm w-full bg-gray-50 hover:bg-gray-100"
          >
            Làm mới
          </button>
        </div>
      </div>
      {/* Thông báo tổng số tài khoản */}
      <div className="mb-4 text-base font-medium text-gray-700">Tổng số tài khoản: {pagination.totalItems}</div>
      <UserTable onEdit={handleEdit} users={users} roles={roles} />
      <AdminPagination
        currentPage={pagination.currentPage}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={setPage}
      />
      {openModal && (
        <UserFormModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          editUser={editUser}
          roles={roles}
        />
      )}
    </div>
  );
};

export default AdminUserPage; 