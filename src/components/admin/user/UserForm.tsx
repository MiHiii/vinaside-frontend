import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserRoleSelect from "./UserRoleSelect";
import UserLanguageSelect from "./UserLanguageSelect";
import { UserLanguage, UserRole } from "@/types/user";
import AvatarUploader from "@/components/admin/user/AvatarUploader ";

export interface UserFormValues {
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: UserRole;
  language: UserLanguage;
}

interface Props {
  form: UserFormValues;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onRoleChange: (role: UserRole) => void;
  onLanguageChange: (lang: UserLanguage) => void;
  avatar: File | null;
  preview: string | null;
  onAvatarChange: (file: File | null) => void;
  disabled?: boolean;
}

const UserForm: React.FC<Props> = ({
  form,
  onChange,
  onRoleChange,
  onLanguageChange,
  preview,
  onAvatarChange,
  disabled,
}) => (
  <div className="space-y-4">
    <div>
      <Label>Họ tên:</Label>
      <Input
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Nhập họ tên"
        required
        disabled={disabled}
      />
    </div>
    <div>
      <Label>Email:</Label>
      <Input
        name="email"
        value={form.email}
        onChange={onChange}
        placeholder="Nhập email"
        type="email"
        required
        disabled={disabled}
      />
    </div>
    <div>
      <Label>Mật khẩu:</Label>
      <Input
        name="password_hash"
        value={form.password_hash}
        onChange={onChange}
        placeholder="Nhập mật khẩu"
        type="password"
        required
        disabled={disabled}
      />
    </div>
    <div>
      <Label>Số điện thoại:</Label>
      <Input
        name="phone"
        value={form.phone}
        onChange={onChange}
        placeholder="Nhập số điện thoại"
        disabled={disabled}
      />
    </div>
    <div>
      <Label>Vai trò:</Label>
      <UserRoleSelect value={form.role} onChange={onRoleChange} />
    </div>
    <div>
      <Label>Ngôn ngữ:</Label>
      <UserLanguageSelect value={form.language} onChange={onLanguageChange} />
    </div>
    <div>
      <Label>Avatar:</Label>
      <AvatarUploader
        previewUrl={preview}
        onChange={onAvatarChange}
        fallback={form.name[0] || "?"}
      />
    </div>
  </div>
);

export default UserForm;
