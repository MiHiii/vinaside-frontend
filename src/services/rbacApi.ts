import { api } from './api';
import {
  CustomRole,
  Permission,
  CreateRoleDto,
  CreatePermissionDto,
  AssignRoleToUserDto,
  AssignPermissionToRoleDto,
  PermissionCheckResult,
  ApiResponse,
} from '../types/rbac';

// RBAC API Service
export const rbacApi = {
  // ========== ROLES ==========
  
  // Get all custom roles
  getAllRoles: async (): Promise<ApiResponse<CustomRole[]>> => {
    const response = await api.get('/rbac/roles');
    return response.data;
  },

  // Create new custom role
  createRole: async (roleData: CreateRoleDto): Promise<CustomRole> => {
    const response = await api.post('/rbac/roles', roleData);
    return response.data;
  },

  // Get role permissions
  getRolePermissions: async (roleId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get(`/rbac/roles/${roleId}/permissions`);
    return response.data;
  },

  // Get users with specific role
  getUsersWithRole: async (roleKey: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get(`/rbac/roles/${roleKey}/users`);
    return response.data;
  },

  // ========== PERMISSIONS ==========
  
  // Get all permissions
  getAllPermissions: async (): Promise<ApiResponse<Permission[]>> => {
    const response = await api.get('/rbac/permissions');
    return response.data;
  },

  // Create new permission
  createPermission: async (permissionData: CreatePermissionDto): Promise<Permission> => {
    const response = await api.post('/rbac/permissions', permissionData);
    return response.data;
  },

  // ========== ROLE-PERMISSION ASSIGNMENTS ==========
  
  // Assign permission to role
  assignPermissionToRole: async (
    roleKey: string,
    assignPermissionDto: AssignPermissionToRoleDto
  ): Promise<void> => {
    await api.post(`/rbac/roles/${roleKey}/permissions`, assignPermissionDto);
  },

  // Remove permission from role
  removePermissionFromRole: async (
    roleKey: string,
    permissionKey: string
  ): Promise<void> => {
    await api.delete(`/rbac/roles/${roleKey}/permissions/${permissionKey}`);
  },

  // ========== USER-ROLE ASSIGNMENTS ==========
  
  // Get user roles
  getUserRoles: async (userId: string): Promise<ApiResponse<CustomRole[]>> => {
    const response = await api.get(`/rbac/users/${userId}/roles`);
    return response.data;
  },

  // Get user permissions
  getUserPermissions: async (userId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get(`/rbac/users/${userId}/permissions`);
    return response.data;
  },

  // Assign role to user
  assignRoleToUser: async (
    userId: string,
    assignRoleDto: AssignRoleToUserDto
  ): Promise<void> => {
    await api.post(`/rbac/users/${userId}/roles`, assignRoleDto);
  },

  // Remove role from user
  removeRoleFromUser: async (
    userId: string,
    roleKey: string
  ): Promise<void> => {
    await api.delete(`/rbac/users/${userId}/roles/${roleKey}`);
  },

  // ========== PERMISSION CHECKS ==========
  
  // Check if user has specific permission
  checkUserPermission: async (
    userId: string,
    permissionKey: string
  ): Promise<PermissionCheckResult> => {
    const response = await api.get(`/rbac/check-permission/${userId}/${permissionKey}`);
    return response.data;
  },

  // Delete custom role
  deleteRole: async (roleKey: string): Promise<void> => {
    await api.delete(`/rbac/roles/${roleKey}`);
  },

  // Update custom role
  updateRole: async (roleData: CreateRoleDto): Promise<CustomRole> => {
    const response = await api.patch(`/rbac/roles/${roleData.key}`, roleData);
    return response.data;
  },

  // Soft delete custom role
  softDeleteRole: async (roleKey: string): Promise<void> => {
    await api.delete(`/rbac/roles/${roleKey}`);
  },
};