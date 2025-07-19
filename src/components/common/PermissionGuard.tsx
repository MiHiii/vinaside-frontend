import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // true: cần tất cả permissions, false: chỉ cần 1 trong số đó
  role?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

  // Kiểm tra permission cụ thể
  if (permission && !hasPermission(permission)) {
    console.log("PermissionGuard: user KHÔNG có quyền", permission);
    return <>{fallback}</>;
  }
  if (permission) {
    console.log("PermissionGuard: user CÓ quyền", permission);
  }

  // Kiểm tra danh sách permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Kiểm tra role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Component tiện ích cho các trường hợp phổ biến
export const ListingPermissionGuard: React.FC<{ children: React.ReactNode; action?: string }> = ({ 
  children, 
  action = "view" 
}) => {
  return (
    <PermissionGuard permission={`listing.${action}`}>
      {children}
    </PermissionGuard>
  );
};

export const UserPermissionGuard: React.FC<{ children: React.ReactNode; action?: string }> = ({ 
  children, 
  action = "view" 
}) => {
  return (
    <PermissionGuard permission={`user.${action}`}>
      {children}
    </PermissionGuard>
  );
};

export const BookingPermissionGuard: React.FC<{ children: React.ReactNode; action?: string }> = ({ 
  children, 
  action = "view" 
}) => {
  return (
    <PermissionGuard permission={`booking.${action}`}>
      {children}
    </PermissionGuard>
  );
};

export const PaymentPermissionGuard: React.FC<{ children: React.ReactNode; action?: string }> = ({ 
  children, 
  action = "view" 
}) => {
  return (
    <PermissionGuard permission={`payment.${action}`}>
      {children}
    </PermissionGuard>
  );
};

export const AnalyticsPermissionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PermissionGuard permission="analytics.view">
      {children}
    </PermissionGuard>
  );
}; 