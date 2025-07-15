import { UserRole } from "@/types/user";

/**
 * Xác định route mặc định dựa trên role của user
 */
export const getDefaultRouteByRole = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "staff":
      return "/hosting";
    case "guest":
    default:
      return "/";
  }
};

/**
 * Kiểm tra xem user có quyền truy cập vào route không
 */
export const canAccessRoute = (userRole: UserRole, requiredRoles?: string | string[]): boolean => {
  if (!requiredRoles) return true;
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
};

/**
 * Lấy tên hiển thị của role
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "Quản trị viên";
    case "staff":
      return "Chủ nhà";
    case "guest":
      return "Khách hàng";
    default:
      return "Người dùng";
  }
}; 