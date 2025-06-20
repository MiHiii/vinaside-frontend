import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchUserById,
  updateUser,
  patchUser,
  toggleUserStatus,
  selectUserDetail,
  selectUsersLoading,
} from "@/store/slices/userSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UpdateUserDto, User } from "@/types/user";
import UserAvatarAndStatus from "@/components/admin/user/UserAvatarAndStatus";
import UserDetailView from "@/components/admin/user/UserDetailView";
import UserEditForm from "@/components/admin/user/UserEditForm";


const getUpdatableFields = (form: Partial<UpdateUserDto>) => {
  const { name, phone, role, language, is_verified, isDeleted } = form;
  return { name, phone, role, language, is_verified, isDeleted };
};

const AdminUserDetail: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserDetail) as User | undefined;
  const loading = useSelector(selectUsersLoading);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<UpdateUserDto>>({});

  useEffect(() => {
    if (userId) dispatch(fetchUserById(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    if (user) {
      const { name, phone, role, language, is_verified, isDeleted } = user;
      setForm({ name, phone, role, language, is_verified, isDeleted });
    }
  }, [user]);

  if (loading || !user) return <div>Đang tải...</div>;

  const handleFullUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData = getUpdatableFields(form);
    dispatch(updateUser({ id: user.id, ...updateData })).then(() => {
      setEditMode(false);
      dispatch(fetchUserById(user.id));
    });
  };

  const handlePatch = (patchData: Partial<UpdateUserDto>) => {
    const data = getUpdatableFields(patchData);
    dispatch(patchUser({ id: user.id, ...data })).then(() =>
      dispatch(fetchUserById(user.id))
    );
  };

  const handleToggleStatus = () => {
    dispatch(toggleUserStatus(user.id)).then(() =>
      dispatch(fetchUserById(user.id))
    );
  };

  return (
    <Card className="max-w-xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Thông tin người dùng</CardTitle>
      </CardHeader>
      <CardContent>
        <UserAvatarAndStatus
          user={user}
          onToggleStatus={handleToggleStatus}
          onPatch={handlePatch}
        />
        {!editMode ? (
          <UserDetailView
            user={user}
            onPatch={handlePatch}
            onEdit={() => setEditMode(true)}
          />
        ) : (
          <UserEditForm
            form={form}
            setForm={setForm}
            onSubmit={handleFullUpdate}
            onCancel={() => setEditMode(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserDetail;
