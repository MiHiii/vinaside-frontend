import { useAppSelector } from "@/hooks/useRedux";
import { RootState } from "@/store";
import React, { useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/services/api";

type Props = {
  children: React.ReactNode;
  requiredRole?: string | string[];
};

const ProtectedAdminRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isCheckingAuth } = useAppSelector(
    (state: RootState) => state.auth
  );
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
            // If failed to get user info, clear token and redirect to admin login
            localStorage.removeItem("access_token");
            navigate("/admin/login");
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        localStorage.removeItem("access_token");
        navigate("/admin/login");
      }
    };

    fetchUserInfo();
  }, [accessToken, user, dispatch, navigate]);

  // If checking auth, show loading
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // If no token, redirect to admin login
  if (!accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If has token but no user info yet, show loading
  if (accessToken && !user) {
    return <div>Loading...</div>;
  }

  // If has user info but role is guest, redirect to admin login
  if (user && user.role === "guest") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If has user info but role doesn't match required role
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role || "guest")) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Has both token and user info, and role matches (not guest)
  return <>{children}</>;
};

export default ProtectedAdminRoute; 