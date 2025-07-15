import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  selectUsersLoading,

} from "@/store/slices/userSlice";
import { AppDispatch } from "@/store";
import { UserLanguage, UserRole } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/admin/user/UserForm";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from "@/utils/uploadAvatar ";

const CreateUserPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectUsersLoading);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password_hash: "",
    phone: "",
    role: "guest" as UserRole,
    language: "vi" as UserLanguage,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Các hàm handle logic
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };
  const handleRoleChange = (role: UserRole) => setForm((f) => ({ ...f, role }));
  const handleLanguageChange = (lang: UserLanguage) =>
    setForm((f) => ({ ...f, language: lang }));
  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản
    if (!form.name || form.name.trim().length < 2) {
      toast.error("Tên phải có ít nhất 2 ký tự!");
      return;
    }
    if (!form.email) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    if (!form.password_hash || form.password_hash.length < 4) {
      toast.error("Mật khẩu phải có ít nhất 4 ký tự!");
      return;
    }

    let avatar_url = "";
    if (avatar && token) {
      try {
        toast.loading("Đang upload avatar...", { id: "upload-avatar" });
        avatar_url = await uploadAvatar(avatar, token);
        toast.dismiss("upload-avatar");
      } catch {
        toast.dismiss("upload-avatar");
        toast.error("Upload ảnh thất bại!");
        return;
      }
    }

    // Gửi user lên server
    const result = await dispatch(
      createUser({
        ...form,
        avatar_url,
      })
    );

    if (createUser.fulfilled.match(result)) {
      toast.success("Tạo người dùng thành công!");
      setForm({
        name: "",
        email: "",
        password_hash: "",
        phone: "",
        role: "guest",
        language: "vi",
      });
      setAvatar(null);
      setPreview(null);
      // Chuyển hướng sau 1s
      setTimeout(() => navigate("/admin/user"), 1200);
    }
  };

  return (
    <Card className="max-w-lg mx-auto my-8">
      <CardHeader>
        <CardTitle>Thêm người dùng mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <UserForm
            form={form}
            onChange={handleChange}
            onRoleChange={handleRoleChange}
            onLanguageChange={handleLanguageChange}
            avatar={avatar}
            preview={preview}
            onAvatarChange={handleAvatarChange}
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo mới"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserPage;
