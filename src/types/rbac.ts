// RBAC Types
export interface CustomRole {
  _id: string;
  key: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  key: string;
  module: string;
  action: string;
  description?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface UserCustomRole {
  _id: string;
  userId: string;
  customRoleId: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface CustomRolePermission {
  _id: string;
  customRoleId: string;
  permissionId: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

// DTOs for API requests
export interface CreateRoleDto {
  key: string;
  name: string;
  description?: string;
}

export interface CreatePermissionDto {
  key: string;
  module: string;
  action: string;
  description?: string;
}

export interface AssignRoleToUserDto {
  roleKey: string;
}

export interface AssignPermissionToRoleDto {
  permissionKey: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  message: string;
}

// Response types
export interface RoleWithPermissions extends CustomRole {
  permissions: string[];
}

export interface UserWithRoles {
  userId: string;
  roles: CustomRole[];
  permissions: string[];
}

export interface PermissionCheckResult {
  userId: string;
  permissionKey: string;
  hasPermission: boolean;
}

// State types
export interface RbacState {
  // Roles
  roles: ApiResponse<CustomRole[]> | null;
  rolesLoading: boolean;
  rolesError: string | null;
  
  // Permissions
  permissions: ApiResponse<Permission[]> | null;
  permissionsLoading: boolean;
  permissionsError: string | null;
  
  // User roles
  userRoles: Record<string, ApiResponse<CustomRole[]>>;
  userRolesLoading: boolean;
  userRolesError: string | null;
  
  // Role permissions
  rolePermissions: Record<string, ApiResponse<string[]>>;
  rolePermissionsLoading: boolean;
  rolePermissionsError: string | null;
  
  // User permissions
  userPermissions: Record<string, ApiResponse<string[]>>;
  userPermissionsLoading: boolean;
  userPermissionsError: string | null;
  
  // Users with role
  usersWithRole: Record<string, ApiResponse<string[]>>;
  usersWithRoleLoading: boolean;
  usersWithRoleError: string | null;
  
  // Permission checks
  permissionChecks: Record<string, boolean>;
  permissionChecksLoading: boolean;
  permissionChecksError: string | null;
} 