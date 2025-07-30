import { useAppSelector } from './useRedux';
import { Permission } from '@/types/user';

export const useUserRole = () => {
  const user = useAppSelector((state) => state.auth.user);
  
  const isAdmin = user?.role === 'admin' || 
    (Array.isArray(user?.permissions) && 
     user.permissions.some((p: Permission | string) => 
       typeof p === 'string' ? p === 'admin' : p.key === 'admin'
     ));
  
  const isStaff = user?.role === 'staff' || 
    (Array.isArray(user?.permissions) && 
     user.permissions.some((p: Permission | string) => 
       typeof p === 'string' ? p === 'staff' : p.key === 'staff'
     ));
  
  const hasPermission = (permissionKey: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    if (Array.isArray(user.permissions)) {
      return user.permissions.some((p: Permission | string) => 
        typeof p === 'string' ? p === permissionKey : p.key === permissionKey
      );
    }
    
    return false;
  };
  
  return {
    user,
    isAdmin,
    isStaff,
    hasPermission
  };
}; 