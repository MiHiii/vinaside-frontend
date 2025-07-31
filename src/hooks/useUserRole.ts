import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useUserRole = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isGuest = user?.role === 'guest';
  
  const hasPermission = (permission: string) => {
    if (isAdmin) return true; // Admin có tất cả quyền
    return user?.permissions?.some((p: { key: string }) => p.key === permission) || false;
  };
  
  const canAccessProperty = () => {
    if (isAdmin) return true; // Admin có thể truy cập tất cả
    if (isStaff) {
      // Staff chỉ có thể truy cập properties được assign
      // BE sẽ tự động filter, FE chỉ cần kiểm tra role
      return true; // BE đã handle filtering
    }
    return false;
  };
  
  return {
    user,
    isAdmin,
    isStaff,
    isGuest,
    hasPermission,
    canAccessProperty,
    role: user?.role
  };
}; 