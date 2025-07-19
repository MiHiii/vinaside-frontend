import { api } from "./api";

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
  assignRoleToUser: async (userId: string, roleKey: string) => {
    const response = await api.post(`/rbac/users/${userId}/roles`, { roleKey });
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
};