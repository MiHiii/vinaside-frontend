import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import { Permission } from "@/types/user";

export const usePermissions = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);

  // Kiểm tra xem user có permission cụ thể không
  const hasPermission = (permissionKey: string): boolean => {
    if (!user) {
      console.log("No user");
      return false;
    }
    if (user.role === "admin") return true;
    // Log permissions và key cần kiểm tra
    console.log("Checking permission:", permissionKey, "in", user.permissions);

    // Nếu permissions là mảng string
    if (Array.isArray(user.permissions) && typeof user.permissions[0] === "string") {
      const result = (user.permissions as unknown as string[]).includes(permissionKey);
      console.log("Result (string):", result);
      return result;
    }
    // Nếu permissions là mảng object
    if (Array.isArray(user.permissions) && user.permissions[0]?.key) {
      const result = (user.permissions as Permission[]).some(permission => permission.key === permissionKey);
      console.log("Result (object):", result);
      return result;
    }
    // Kiểm tra trong custom roles (nếu có)
    if (user.customRoles) {
      return user.customRoles.some(role => 
        role.permissions?.some((permission: Permission) => permission.key === permissionKey)
      );
    }
    return false;
  };

  // Kiểm tra xem user có bất kỳ permission nào trong danh sách không
  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    return permissionKeys.some(key => hasPermission(key));
  };

  // Kiểm tra xem user có tất cả permissions trong danh sách không
  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    return permissionKeys.every(key => hasPermission(key));
  };

  // Kiểm tra xem user có custom role cụ thể không
  const hasRole = (roleKey: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.customRoles) {
      return user.customRoles.some(role => role.key === roleKey);
    }
    return false;
  };

  // Lấy tất cả permissions của user (trả về mảng string nếu có)
  const getUserPermissions = (): (Permission | string)[] => {
    if (!user) return [];
    const permissions: (Permission | string)[] = [];
    // Thêm permissions từ custom roles
    if (user.customRoles) {
      user.customRoles.forEach(role => {
        if (role.permissions) {
          permissions.push(...role.permissions);
        }
      });
    }
    // Thêm permissions trực tiếp
    if (user.permissions) {
      permissions.push(...user.permissions);
    }
    // Loại bỏ duplicates (theo key nếu là object, theo string nếu là string)
    return permissions.filter((permission, index, self) => {
      if (typeof permission === "string") {
        return self.indexOf(permission) === index;
      } else {
        return (
          self.findIndex(p => typeof p !== "string" && p.key === permission.key) === index
        );
      }
    });
  };

  // Kiểm tra xem user có quyền truy cập module cụ thể không
  const hasModuleAccess = (module: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const permissions = getUserPermissions();
    return permissions.some(permission => {
      if (typeof permission === "string") return false;
      return permission.module === module;
    });
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getUserPermissions,
    hasModuleAccess,
    user,
  };
}; 