import { api } from "./api";
import { CreateRoleDto, CreatePermissionDto, AssignPermissionToRoleDto, AssignRoleToUserDto } from "@/types/rbac";

export interface UserPermissionsResponse {
  success: boolean;
  data: {
    data: string[];
  };
}

export interface AssignRoleRequest {
  roleKey: string;
}

export const rbacApi = {
  // Lấy permissions của user hiện tại hoặc user khác
  getUserPermissions: async (userId?: string): Promise<UserPermissionsResponse> => {
    if (!userId || userId === "me") {
      // Gọi endpoint dành cho user hiện tại, không cần quyền đặc biệt
      const response = await api.get("/auth/me/permissions");
      return response.data;
    }
    // Nếu truyền userId khác, gọi endpoint cũ (chỉ admin hoặc user có quyền đặc biệt mới dùng)
    const response = await api.get(`/rbac/users/${userId}/permissions`);
    return response.data;
  },

  // Lấy custom roles của user
  getUserRoles: async (userId: string) => {
    const response = await api.get(`/rbac/users/${userId}/roles`);
    return response.data;
  },

  // Lấy permissions của một role
  getRolePermissions: async (roleKey: string) => {
    const response = await api.get(`/rbac/roles/${roleKey}/permissions`);
    return response.data;
  },

  // Gán role cho user
  assignRoleToUser: async (userId: string, assignRoleDto: AssignRoleToUserDto) => {
    const response = await api.post(`/rbac/users/${userId}/roles`, assignRoleDto);
    return response.data;
  },

  // Xóa role khỏi user
  removeRoleFromUser: async (userId: string, roleKey: string) => {
    const response = await api.delete(`/rbac/users/${userId}/roles/${roleKey}`);
    return response.data;
  },

  // Lấy danh sách tất cả roles
  getAllRoles: async () => {
    const response = await api.get("/rbac/roles");
    return response.data;
  },

  // Lấy danh sách tất cả permissions
  getAllPermissions: async () => {
    const response = await api.get("/rbac/permissions");
    return response.data;
  },

  // Kiểm tra permission cụ thể
  checkPermission: async (userId: string, permissionKey: string) => {
    const response = await api.get(`/rbac/users/${userId}/permissions/${permissionKey}/check`);
    return response.data;
  },

  // Lấy users có role cụ thể
  getUsersByRole: async (roleKey: string) => {
    const response = await api.get(`/rbac/roles/${roleKey}/users`);
    return response.data;
  },

  // Tạo role mới
  createRole: async (roleData: CreateRoleDto) => {
    const response = await api.post("/rbac/roles", roleData);
    return response.data;
  },

  // Tạo permission mới
  createPermission: async (permissionData: CreatePermissionDto) => {
    const response = await api.post("/rbac/permissions", permissionData);
    return response.data;
  },

  // Gán permission cho role
  assignPermissionToRole: async (roleKey: string, assignPermissionDto: AssignPermissionToRoleDto) => {
    const response = await api.post(`/rbac/roles/${roleKey}/permissions`, assignPermissionDto);
    return response.data;
  },

  // Xóa permission khỏi role
  removePermissionFromRole: async (roleKey: string, permissionKey: string) => {
    const response = await api.delete(`/rbac/roles/${roleKey}/permissions/${permissionKey}`);
    return response.data;
  },

  // Lấy users có role cụ thể (theo key)
  getUsersWithRole: async (roleKey: string) => {
    const response = await api.get(`/rbac/roles/${roleKey}/users`);
    return response.data;
  },

  // Xóa role
  deleteRole: async (roleKey: string) => {
    const response = await api.delete(`/rbac/roles/${roleKey}`);
    return response.data;
  },

  // Xóa mềm role
  softDeleteRole: async (roleKey: string) => {
    const response = await api.delete(`/rbac/roles/${roleKey}`);
    return response.data;
  },

  // Cập nhật role
  updateRole: async (roleData: CreateRoleDto) => {
    const response = await api.patch(`/rbac/roles/${roleData.key}`, roleData);
    return response.data;
  },

  // Kiểm tra permission cụ thể của user
  checkUserPermission: async (userId: string, permissionKey: string) => {
    const response = await api.get(`/rbac/users/${userId}/permissions/${permissionKey}/check`);
    return response.data;
  },
};