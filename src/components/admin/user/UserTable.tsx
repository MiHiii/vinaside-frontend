import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/types/user";
import UserTableRow from "./UserTableRow";

interface Props {
  users?: User[];
  loading?: boolean;
}

const UserTable: React.FC<Props> = ({ users, loading }) => {
  const userList = Array.isArray(users) ? users : [];

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu người dùng...</div>;
  }
  if (userList.length === 0) {
    return <div className="p-4 text-center">Không có người dùng nào.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ảnh</TableHead>
          <TableHead>Họ tên</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Điện thoại</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Xác minh</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.map((user) => (
          <UserTableRow key={user.id} user={user} />
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
