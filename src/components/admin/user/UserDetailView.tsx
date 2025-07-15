import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { User, UserRole } from "@/types/user";

interface Props {
  user: User;
  onPatch: (patch: Partial<User>) => void;
  onEdit: () => void;
}

const UserDetailView: React.FC<Props> = ({ user, onPatch, onEdit }) => (
  <div className="space-y-3">
    <div>
      <b>Họ tên:</b> {user.name}
    </div>
    <div>
      <b>Email:</b> {user.email}
    </div>
    <div>
      <b>Số điện thoại:</b> {user.phone}
    </div>
    <div>
      <b>Vai trò:</b>
      <Select
        value={user.role}
        onValueChange={(role) => onPatch({ role: role as UserRole })}
      >
        <SelectTrigger className="w-24 ml-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-amber-950">
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="host">Host</SelectItem>
          <SelectItem value="guest">Guest</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <b>Ngôn ngữ:</b> {user.language}
    </div>
    <div>
      <b>Ngày tạo:</b> {user.createdAt}
    </div>
    <Button variant="default" className="mt-2" onClick={onEdit}>
      Sửa toàn bộ
    </Button>
  </div>
);

export default UserDetailView;
