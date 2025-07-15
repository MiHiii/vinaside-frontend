// import { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAppSelector } from "@/hooks/useRedux";
// import { getDefaultRouteByRole } from "@/utils/navigation";

// /**
//  * Hook để tự động điều hướng user về trang mặc định của role
//  * Sử dụng khi user truy cập vào trang không phù hợp với role
//  */
// export const useAutoRedirect = () => {
//   const { user, isCheckingAuth } = useAppSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     // Chỉ xử lý khi đã xác thực xong và có user
//     if (!isCheckingAuth && user) {
//       const currentPath = location.pathname;
      
//       // Kiểm tra một số trường hợp đặc biệt
//       const isOnAuthPage = currentPath.includes("/login") || 
//                          currentPath.includes("/register") || 
//                          currentPath.includes("/forgot-password");
      
//       const isOnPublicPage = currentPath === "/" || 
//                             currentPath.includes("/room-detail") ||
//                             currentPath.includes("/verify-email");

//       // Nếu đang ở trang auth hoặc public page, không redirect
//       if (!isOnAuthPage && !isOnPublicPage) {
//         // Kiểm tra xem có phải đang ở trang không được phép không
//         const isOnAdminPage = currentPath.startsWith("/admin");
//         const isOnHostPage = currentPath.startsWith("/hosting");
        
//         if ((user.role === "guest" && (isOnAdminPage || isOnHostPage)) ||
//             (user.role === "host" && isOnAdminPage) ||
//             (user.role === "admin" && isOnHostPage)) {
//           const defaultRoute = getDefaultRouteByRole(user.role);
//           navigate(defaultRoute, { replace: true });
//         }
//       }
//     }
//   }, [user, isCheckingAuth, location.pathname, navigate]);
// }; 