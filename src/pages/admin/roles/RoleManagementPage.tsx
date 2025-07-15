import React, { useState, useEffect, useRef } from 'react';
import { useRolesManagement } from '@/hooks/useRbac';
import RoleList from '@/components/admin/rbac/RoleList';
import RoleFormModal, { RoleFormData } from '@/components/admin/rbac/RoleFormModal';
import toast from 'react-hot-toast';

const RoleManagementPage: React.FC = () => {
  const rolesManagement = useRolesManagement();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleFormData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      rolesManagement.fetchRoles();
      hasFetched.current = true;
    }
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  const handleAddRole = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleEditRole = (role: RoleFormData) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleDeleteRole = async (role: RoleFormData) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      setModalLoading(true);
      if (rolesManagement.softDeleteRole) {
        await rolesManagement.softDeleteRole(role.key);
        await rolesManagement.fetchRoles(); // Đảm bảo gọi lại fetchRoles sau khi xóa mềm
        toast.success('Xóa vai trò thành công!');
      }
      setModalLoading(false);
    }
  };

  const handleModalSubmit = async (data: RoleFormData) => {
    setModalLoading(true);
    if (editingRole) {
      if (rolesManagement.updateRole) {
        await rolesManagement.updateRole(data);
        toast.success('Cập nhật vai trò thành công!');
        await rolesManagement.fetchRoles(); // Đảm bảo gọi lại fetchRoles sau khi cập nhật
      }
    } else {
      await rolesManagement.createRole(data);
      toast.success('Thêm vai trò thành công!');
      await rolesManagement.fetchRoles();
    }
    setModalLoading(false);
    setModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý vai trò và quyền hạn</h1>
          <p className="text-gray-600">Tạo và quản lý các vai trò, phân quyền cho từng vai trò</p>
        </div>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
          onClick={handleAddRole}
        >
          + Thêm vai trò
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <RoleList
          roles={rolesManagement.roles}
          loading={rolesManagement.loading}
          error={rolesManagement.error}
          onSelectRole={setSelectedRoleId}
          selectedRoleId={selectedRoleId}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      </div>
      <RoleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingRole}
        loading={modalLoading}
      />
    </div>
  );
};

export default RoleManagementPage; 