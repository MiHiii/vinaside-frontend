import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchRoles,
  createRole,
  deleteRole,
  updateRole,
  softDeleteRole,
  fetchRolePermissions,
  fetchUsersWithRole,
  fetchPermissions,
  createPermission,
  assignPermissionToRole,
  removePermissionFromRole,
  fetchUserRoles,
  fetchUserPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  checkUserPermission,
  clearRolesError,
  clearPermissionsError,
  clearUserRolesError,
  clearRolePermissionsError,
  clearUserPermissionsError,
  clearUsersWithRoleError,
  clearPermissionChecksError,
  clearUserRoles,
  clearUserPermissions,
  clearRolePermissions,
  clearUsersWithRole,
  clearPermissionCheck,
} from '../store/slices/rbacSlice';
import {
  CreateRoleDto,
  CreatePermissionDto,
  AssignRoleToUserDto,
  AssignPermissionToRoleDto,
} from '../types/rbac';

// ========== SELECTORS ==========

// Roles selectors
export const useRoles = () => useSelector((state: RootState) => state.rbac.roles?.data || []);
export const useRolesLoading = () => useSelector((state: RootState) => state.rbac.rolesLoading);
export const useRolesError = () => useSelector((state: RootState) => state.rbac.rolesError);

// Permissions selectors
export const usePermissions = () => useSelector((state: RootState) => state.rbac.permissions?.data || []);
export const usePermissionsLoading = () => useSelector((state: RootState) => state.rbac.permissionsLoading);
export const usePermissionsError = () => useSelector((state: RootState) => state.rbac.permissionsError);

// User roles selectors
export const useUserRoles = (userId: string) => 
  useSelector((state: RootState) => state.rbac.userRoles[userId]?.data || []);
export const useUserRolesLoading = () => useSelector((state: RootState) => state.rbac.userRolesLoading);
export const useUserRolesError = () => useSelector((state: RootState) => state.rbac.userRolesError);

// Role permissions selectors
export const useRolePermissions = (roleId: string) => 
  useSelector((state: RootState) => state.rbac.rolePermissions[roleId]?.data || []);
export const useRolePermissionsLoading = () => useSelector((state: RootState) => state.rbac.rolePermissionsLoading);
export const useRolePermissionsError = () => useSelector((state: RootState) => state.rbac.rolePermissionsError);

// User permissions selectors
export const useUserPermissions = (userId: string) => 
  useSelector((state: RootState) => state.rbac.userPermissions[userId]?.data || []);
export const useUserPermissionsLoading = () => useSelector((state: RootState) => state.rbac.userPermissionsLoading);
export const useUserPermissionsError = () => useSelector((state: RootState) => state.rbac.userPermissionsError);

// Users with role selectors
export const useUsersWithRole = (roleKey: string) => 
  useSelector((state: RootState) => state.rbac.usersWithRole[roleKey]?.data || []);
export const useUsersWithRoleLoading = () => useSelector((state: RootState) => state.rbac.usersWithRoleLoading);
export const useUsersWithRoleError = () => useSelector((state: RootState) => state.rbac.usersWithRoleError);

// Permission checks selectors
export const usePermissionCheck = (userId: string, permissionKey: string) => {
  const key = `${userId}-${permissionKey}`;
  return useSelector((state: RootState) => state.rbac.permissionChecks[key] || false);
};
export const usePermissionChecksLoading = () => useSelector((state: RootState) => state.rbac.permissionChecksLoading);
export const usePermissionChecksError = () => useSelector((state: RootState) => state.rbac.permissionChecksError);

// ========== CUSTOM HOOKS ==========

// Roles management hook
export const useRolesManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useRoles();
  const loading = useRolesLoading();
  const error = useRolesError();

  return {
    roles,
    loading,
    error,
    fetchRoles: () => dispatch(fetchRoles()),
    createRole: (roleData: CreateRoleDto) => dispatch(createRole(roleData)),
    deleteRole: (roleKey: string) => dispatch(deleteRole(roleKey)),
    updateRole: (roleData: CreateRoleDto) => dispatch(updateRole(roleData)),
    softDeleteRole: (roleKey: string) => dispatch(softDeleteRole(roleKey)),
    clearError: () => dispatch(clearRolesError()),
  };
};

// Permissions management hook
export const usePermissionsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = usePermissions();
  const loading = usePermissionsLoading();
  const error = usePermissionsError();

  return {
    permissions,
    loading,
    error,
    fetchPermissions: () => dispatch(fetchPermissions()),
    createPermission: (permissionData: CreatePermissionDto) => dispatch(createPermission(permissionData)),
    clearError: () => dispatch(clearPermissionsError()),
  };
};

// Role permissions management hook
export const useRolePermissionsManagement = (roleId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = useRolePermissions(roleId);
  const loading = useRolePermissionsLoading();
  const error = useRolePermissionsError();

  return {
    permissions,
    loading,
    error,
    fetchRolePermissions: () => dispatch(fetchRolePermissions(roleId)),
    assignPermissionToRole: (assignPermissionDto: AssignPermissionToRoleDto) => 
      dispatch(assignPermissionToRole({ roleKey: roleId, assignPermissionDto })),
    removePermissionFromRole: (permissionKey: string) => 
      dispatch(removePermissionFromRole({ roleKey: roleId, permissionKey })),
    clearError: () => dispatch(clearRolePermissionsError()),
    clearData: () => dispatch(clearRolePermissions(roleId)),
  };
};

// User roles management hook
export const useUserRolesManagement = (userId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useUserRoles(userId);
  const loading = useUserRolesLoading();
  const error = useUserRolesError();

  return {
    roles,
    loading,
    error,
    fetchUserRoles: () => dispatch(fetchUserRoles(userId)),
    assignRoleToUser: (assignRoleDto: AssignRoleToUserDto) => 
      dispatch(assignRoleToUser({ userId, assignRoleDto })),
    removeRoleFromUser: (roleKey: string) => 
      dispatch(removeRoleFromUser({ userId, roleKey })),
    clearError: () => dispatch(clearUserRolesError()),
    clearData: () => dispatch(clearUserRoles(userId)),
  };
};

// User permissions management hook
export const useUserPermissionsManagement = (userId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = useUserPermissions(userId);
  const loading = useUserPermissionsLoading();
  const error = useUserPermissionsError();

  return {
    permissions,
    loading,
    error,
    fetchUserPermissions: () => dispatch(fetchUserPermissions(userId)),
    clearError: () => dispatch(clearUserPermissionsError()),
    clearData: () => dispatch(clearUserPermissions(userId)),
  };
};

// Users with role management hook
export const useUsersWithRoleManagement = (roleKey: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useUsersWithRole(roleKey);
  const loading = useUsersWithRoleLoading();
  const error = useUsersWithRoleError();

  return {
    users,
    loading,
    error,
    fetchUsersWithRole: () => dispatch(fetchUsersWithRole(roleKey)),
    clearError: () => dispatch(clearUsersWithRoleError()),
    clearData: () => dispatch(clearUsersWithRole(roleKey)),
  };
};

// Permission check hook
export const usePermissionCheckManagement = (userId: string, permissionKey: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermissionCheck(userId, permissionKey);
  const loading = usePermissionChecksLoading();
  const error = usePermissionChecksError();
  const key = `${userId}-${permissionKey}`;

  return {
    hasPermission,
    loading,
    error,
    checkPermission: () => dispatch(checkUserPermission({ userId, permissionKey })),
    clearError: () => dispatch(clearPermissionChecksError()),
    clearData: () => dispatch(clearPermissionCheck(key)),
  };
};

// ========== UTILITY HOOKS ==========

// Hook to check if user has any of the specified permissions
export const useUserHasAnyPermission = (userId: string, permissionKeys: string[]) => {
  const userPermissions = useUserPermissions(userId);
  return permissionKeys.some(key => userPermissions.includes(key));
};

// Hook to check if user has all of the specified permissions
export const useUserHasAllPermissions = (userId: string, permissionKeys: string[]) => {
  const userPermissions = useUserPermissions(userId);
  return permissionKeys.every(key => userPermissions.includes(key));
};

// Hook to get roles by key
export const useRoleByKey = (roleKey: string) => {
  const roles = useRoles();
  return roles.find(role => role.key === roleKey);
};

// Hook to get permission by key
export const usePermissionByKey = (permissionKey: string) => {
  const permissions = usePermissions();
  return permissions.find(permission => permission.key === permissionKey);
};

// Hook to get permissions by module
export const usePermissionsByModule = (module: string) => {
  const permissions = usePermissions();
  return permissions.filter(permission => permission.module === module);
}; 