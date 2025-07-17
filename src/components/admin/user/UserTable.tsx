import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { useUsers } from '../../../hooks/useUsers';
import { User, Role } from '../../../types/user';
import ChangePasswordModal from './ChangePasswordModal';

interface UserTableProps {
  onEdit: (user: User) => void;
  users: User[];
  roles: Role[];
}

const UserTable: React.FC<UserTableProps> = ({ onEdit, users, roles }) => {
  const { loading, fetchUsers, fetchRoles, deleteUser } = useUsers();
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xoá user này?')) {
      deleteUser(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-center">Avatar</TableHead>
            <TableHead className="text-center">Tên</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">SĐT</TableHead>
            <TableHead className="text-center">Vai trò</TableHead>
            <TableHead className="text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center">Đang tải...</TableCell></TableRow>
          ) : !Array.isArray(users) || users.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center">Không có user nào</TableCell></TableRow>
          ) : (
            users.map(user => {
              const displayRoleName = roles.find(r => r.key === user.role)?.name
                ? roles.find(r => r.key === user.role)!.name.charAt(0).toUpperCase() + roles.find(r => r.key === user.role)!.name.slice(1)
                : (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Chưa gán');
              return (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell className="text-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover mx-auto" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-500 font-bold">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-medium">{user.name}</TableCell>
                  <TableCell className="text-center">{user.email}</TableCell>
                  <TableCell className="text-center">{user.phone}</TableCell>
                  <TableCell className="text-center capitalize">
                    {displayRoleName}
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button size="sm" variant="default" onClick={() => onEdit(user)}>
                      <Pencil className="w-4 h-4" /> Sửa
                    </Button>
                    <Button size="sm" variant="default" onClick={() => handleDelete(user._id)}>
                      <Trash className="w-4 h-4" /> Xóa
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setChangePasswordUser(user)}>
                      Đổi mật khẩu
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {/* Modal đổi mật khẩu */}
      {changePasswordUser && (
        <ChangePasswordModal
          user={changePasswordUser}
          onClose={() => setChangePasswordUser(null)}
        />
      )}
    </div>
  );
};

export default UserTable; 