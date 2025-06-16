// src/components/ProtectedRoute.tsx
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
};

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const user = useAppSelector((state: RootState) => state.auth.user);

  if (!user) {
    // Chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Không đủ quyền
    return <Navigate to="/unauthorized" replace />;
  }

  // Đã đăng nhập & đủ quyền
  return <>{children}</>;
};

export default ProtectedRoute;
