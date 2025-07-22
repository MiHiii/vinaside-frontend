import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Key } from "lucide-react";

export const UserPermissionsInfo = () => {
  const { user, getUserPermissions, hasRole } = usePermissions();

  if (!user) return null;

  const permissions = getUserPermissions();

  return (
    <div className="space-y-4">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tên:</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">System Role:</span>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Custom Roles */}
      {user.customRoles && user.customRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Custom Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.customRoles.map((role) =>
                typeof role === "object" && role !== null && "name" in role ? (
                  <Badge key={role._id} variant="outline" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {role.name}
                  </Badge>
                ) : (
                  <Badge key={role as string} variant="outline" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {role}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions */}
      {permissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions ({permissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {permissions.map((permission) =>
                typeof permission === "string" ? (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ) : (
                  <Badge key={permission._id} variant="secondary" className="text-xs">
                    {permission.key}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Permission Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Permission Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Listing View</div>
              <Badge variant={hasRole("reviewer") ? "default" : "secondary"}>
                {hasRole("reviewer") ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">User Management</div>
              <Badge variant={hasRole("moderator") ? "default" : "secondary"}>
                {hasRole("moderator") ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Analytics</div>
              <Badge variant={hasRole("analyst") ? "default" : "secondary"}>
                {hasRole("analyst") ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Content Manager</div>
              <Badge variant={hasRole("content_manager") ? "default" : "secondary"}>
                {hasRole("content_manager") ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 