import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  requiredRole?: string | string[];
};

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { user, isCheckingAuth } = useAppSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  // Nếu đang xác thực từ token (ví dụ đang fetchCurrentUser)
  if (isCheckingAuth) {
    return   <div className="flex items-center justify-center h-screen text-lg font-semibold"></div>
  }

  // Nếu xác thực xong nhưng không có user => chuyển hướng đến login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu cần kiểm tra vai trò
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role || "guest")) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
