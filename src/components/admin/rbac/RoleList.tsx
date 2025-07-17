import React, { useState } from 'react';
import RolePermissionAssignment from './RolePermissionAssignment';

interface Role {
  key: string;
  name: string;
  description?: string;
}

interface Props {
  roles: Role[];
  loading: boolean;
  error: string | null;
  onSelectRole: (roleId: string) => void;
  selectedRoleId: string | null;
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
}

const RoleList: React.FC<Props> = ({
  roles,
  loading,
  error,
  onSelectRole,
  selectedRoleId,
  onEditRole,
  onDeleteRole,
}) => {
  const [openRole, setOpenRole] = useState<string | null>(null);

  if (loading) return <div className="text-center py-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-2">
      {roles.map((role, idx) => (
        <div
          key={role.key}
          className="border border-gray-200 rounded-lg bg-white shadow-sm"
        >
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              setOpenRole(openRole === role.key ? null : role.key);
              onSelectRole(role.key);
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-mono">#{idx + 1}</span>
              <div>
                <div className="font-medium text-gray-900">{role.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  if (onEditRole) onEditRole(role);
                }}
                title="Sửa vai trò"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  if (onDeleteRole) onDeleteRole(role);
                }}
                title="Xóa vai trò"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div className={`transform transition-transform duration-200 ${openRole === role.key ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {openRole === role.key && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              {role.description && (
                <div className="mb-3 text-sm text-gray-600">{role.description}</div>
              )}
              {/* Permission assignment sẽ được render ở đây */}
              {selectedRoleId === role.key && (
                <div className="mt-4">
                  <RolePermissionAssignment roleId={role.key} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoleList;
