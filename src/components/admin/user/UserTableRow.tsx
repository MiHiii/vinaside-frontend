import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/hooks/useRedux";
import { deleteUser } from "@/store/slices/userSlice";
import { getErrorMessage } from "@/helper/message";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  user: User;
}

const UserTableRow: React.FC<Props> = ({ user }) => {
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(user._id)).unwrap();
      toast.success("Xóa người dùng thành công!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <tr>
      <td>
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            {user.name[0]}
          </div>
        )}
      </td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.phone}</td>
      <td>
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
          {user.role}
        </span>
      </td>
      <td>
        {user.is_verified ? (
          <span className="text-green-600">Đã xác minh</span>
        ) : (
          <span className="text-red-600">Chưa xác minh</span>
        )}
      </td>
      <td>
        {user.isDeleted ? (
          <span className="text-red-600">Đã khóa</span>
        ) : (
          <span className="text-green-600">Hoạt động</span>
        )}
      </td>
      <td>
        <Link to={`/admin/user/${user._id}`}>
          <Button variant="outline" size="sm">
            Xem
          </Button>
        </Link>
        {/* Sử dụng AlertDialog để xác nhận xóa */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2" type="button">
              Xóa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Bạn có chắc chắn muốn xóa người dùng này?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Thao tác này sẽ không thể hoàn tác. Bạn muốn tiếp tục xóa người
                dùng <b>{user.name}</b>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
};

export default UserTableRow;
