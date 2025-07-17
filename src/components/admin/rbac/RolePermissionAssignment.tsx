import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePermissionsManagement, useRolePermissionsManagement } from '@/hooks/useRbac';
import { Permission } from '@/types/rbac';
import PermissionTree from './PermissionTree';

interface Props {
  roleId: string;
}

const RolePermissionAssignment: React.FC<Props> = ({ roleId }) => {
  const permissionsManagement = usePermissionsManagement();
  const rolePermissionsManagement = useRolePermissionsManagement(roleId);
  const lastRoleId = useRef<string | null>(null);
  const hasFetchedPermissions = useRef(false);
  
  // Local state để quản lý permissions đã gán (optimistic updates)
  const [localAssignedPermissions, setLocalAssignedPermissions] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Chỉ fetch permissions một lần khi component mount
    if (!hasFetchedPermissions.current) {
      permissionsManagement.fetchPermissions();
      hasFetchedPermissions.current = true;
    }
    
    // Fetch role permissions khi roleId thay đổi
    if (lastRoleId.current !== roleId) {
      rolePermissionsManagement.fetchRolePermissions();
      lastRoleId.current = roleId;
    }
  }, [roleId]); // Chỉ phụ thuộc vào roleId

  // Cập nhật local state khi role permissions thay đổi
  useEffect(() => {
    if (rolePermissionsManagement.permissions.length > 0) {
      setLocalAssignedPermissions(rolePermissionsManagement.permissions);
    }
  }, [rolePermissionsManagement.permissions]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(async (key: string, checked: boolean) => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Optimistic update - cập nhật UI ngay lập tức
    setLocalAssignedPermissions(prev => {
      if (checked) {
        return prev.includes(key) ? prev : [...prev, key];
      } else {
        return prev.filter(p => p !== key);
      }
    });

    // Debounce API call
    debounceTimerRef.current = setTimeout(async () => {
      setIsUpdating(true);
      
      try {
        if (checked) {
          await rolePermissionsManagement.assignPermissionToRole({ permissionKey: key });
        } else {
          await rolePermissionsManagement.removePermissionFromRole(key);
        }
        setSuccessMessage(`Đã ${checked ? 'gán' : 'bỏ gán'} quyền hạn thành công!`);
      } catch (error) {
        // Nếu có lỗi, revert lại state
        setLocalAssignedPermissions(prev => {
          if (checked) {
            return prev.filter(p => p !== key);
          } else {
            return [...prev, key];
          }
        });
        setError(`Không thể ${checked ? 'gán' : 'bỏ gán'} quyền hạn. Vui lòng thử lại.`);
        console.error('Error updating permission:', error);
      } finally {
        setIsUpdating(false);
      }
    }, 300); // 300ms debounce
  }, [rolePermissionsManagement]);

  const handleCheckAllModule = useCallback(async (module: string, checked: boolean) => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    let targetPermissions: Permission[] = [];
    
    // Kiểm tra xem có phải sub-module không (có dấu chấm)
    if (module.includes('.')) {
      const [mainModule] = module.split('.');
      targetPermissions = permissionsManagement.permissions.filter(p => 
        p.module === module || (p.module === mainModule && !p.module.includes('.'))
      );
    } else {
      // Main module - lấy tất cả permissions của module này
      targetPermissions = permissionsManagement.permissions.filter(p => 
        p.module === module || p.module.startsWith(module + '.')
      );
    }
    
    // Optimistic update
    setLocalAssignedPermissions(prev => {
      if (checked) {
        const newPermissions = [...prev];
        targetPermissions.forEach(p => {
          if (!newPermissions.includes(p.key)) {
            newPermissions.push(p.key);
          }
        });
        return newPermissions;
      } else {
        return prev.filter(p => !targetPermissions.some(tp => tp.key === p));
      }
    });

    // Debounce API call
    debounceTimerRef.current = setTimeout(async () => {
      setIsUpdating(true);
      
      try {
        // Thực hiện các thao tác gán/bỏ gán
        const promises = targetPermissions.map(p => {
          if (checked) {
            if (!localAssignedPermissions.includes(p.key)) {
              return rolePermissionsManagement.assignPermissionToRole({ permissionKey: p.key });
            }
          } else {
            if (localAssignedPermissions.includes(p.key)) {
              return rolePermissionsManagement.removePermissionFromRole(p.key);
            }
          }
          return Promise.resolve();
        });
        
        await Promise.all(promises);
        setSuccessMessage(`Đã ${checked ? 'gán' : 'bỏ gán'} quyền hạn cho module thành công!`);
      } catch (error) {
        // Nếu có lỗi, revert lại state
        setLocalAssignedPermissions(rolePermissionsManagement.permissions);
        setError(`Không thể ${checked ? 'gán' : 'bỏ gán'} quyền hạn cho module. Vui lòng thử lại.`);
        console.error('Error updating module permissions:', error);
      } finally {
        setIsUpdating(false);
      }
    }, 300); // 300ms debounce
  }, [permissionsManagement.permissions, rolePermissionsManagement, localAssignedPermissions]);

  if (permissionsManagement.loading || rolePermissionsManagement.loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="mt-2 text-sm text-gray-600">Đang tải quyền hạn...</div>
      </div>
    );
  }

  if (permissionsManagement.error || rolePermissionsManagement.error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">
          {permissionsManagement.error || rolePermissionsManagement.error}
        </div>
        <button 
          onClick={() => {
            permissionsManagement.fetchPermissions();
            rolePermissionsManagement.fetchRolePermissions();
          }}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Phân quyền cho vai trò</h4>
        <div className="flex items-center gap-2">
          {isUpdating && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          <div className="text-sm text-gray-500">
            {localAssignedPermissions.length} / {permissionsManagement.permissions.length} quyền đã chọn
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {permissionsManagement.permissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có quyền hạn nào được định nghĩa
        </div>
      ) : (
        <PermissionTree
          permissions={permissionsManagement.permissions}
          assigned={localAssignedPermissions}
          onChange={handleChange}
          onCheckAllModule={handleCheckAllModule}
        />
      )}
    </div>
  );
};

export default RolePermissionAssignment;
