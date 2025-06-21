import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UpdateUserDto, UserRole, User } from "@/types/user";

interface Props {
  form: Partial<UpdateUserDto>;
  setForm: React.Dispatch<React.SetStateAction<Partial<UpdateUserDto>>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const UserEditForm: React.FC<Props> = ({
  form,
  setForm,
  onSubmit,
  onCancel,
}) => (
  <form className="space-y-3" onSubmit={onSubmit}>
    <div>
      <label>Họ tên</label>
      <Input
        value={form.name || ""}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
    </div>
    <div>
      <label>Số điện thoại</label>
      <Input
        value={form.phone || ""}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
      />
    </div>
    <div>
      <label>Vai trò</label>
      <Select
        value={form.role || "guest"}
        onValueChange={(role) =>
          setForm((f) => ({ ...f, role: role as UserRole }))
        }
      >
        <SelectTrigger className="w-32 bg-amber-400">
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
      <label>Ngôn ngữ</label>
      <Input
        value={form.language || ""}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            language: e.target.value as User["language"],
          }))
        }
      />
    </div>
    <Button variant="default" type="submit">
      Lưu thay đổi
    </Button>
    <Button type="button" variant="outline" onClick={onCancel}>
      Huỷ
    </Button>
  </form>
);

export default UserEditForm;
