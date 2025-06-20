// src/components/ProtectedRoute.tsx
import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/services/api";

type Props = {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
};

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (accessToken && !user) {
          const response = await api.get("/auth/me");
          if (response.data.success) {
            // Dispatch action to update user info in Redux store
            dispatch({ type: "auth/setUser", payload: response.data.data });
          } else {
            // If failed to get user info, clear token and redirect to login
            localStorage.removeItem("access_token");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [accessToken, user, dispatch, navigate]);

  // If no token, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // If has token but no user info yet, show loading
  if (accessToken && !user) {
    return <div>Loading...</div>;
  }

  // If has user info but role doesn't match
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Has both token and user info, and role matches
  return <>{children}</>;
};

export default ProtectedRoute;
