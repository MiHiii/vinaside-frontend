import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({ 
  showLabel = true, 
  className = '' 
}) => {
  const { isAdmin, isStaff, role } = useUserRole();

  if (!role) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-sm text-gray-600">Role:</span>}
      
      {isAdmin && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Admin
        </Badge>
      )}
      
      {isStaff && (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          Staff
        </Badge>
      )}
      
      {!isAdmin && !isStaff && (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {role}
        </Badge>
      )}
    </div>
  );
};

export default RoleIndicator; 