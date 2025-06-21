import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

interface Props {
  user: User;
  onToggleStatus: () => void;
  onPatch: (patch: Partial<User>) => void;
}

const UserAvatarAndStatus: React.FC<Props> = ({
  user,
  onToggleStatus,
  onPatch,
}) => (
  <div className="flex items-center gap-4 mb-4">
    {user.avatar_url ? (
      <img
        src={user.avatar_url}
        alt={user.name}
        className="w-16 h-16 rounded-full border"
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
        {(user.name && user.name[0]) || "?"}
      </div>
    )}
    <div>
      <div>
        <b>Trạng thái: </b>
        <span className={user.isDeleted ? "text-red-600" : "text-green-600"}>
          {user.isDeleted ? "Đã khoá" : "Hoạt động"}
        </span>
        <Button
          variant={user.isDeleted ? "default" : "destructive"}
          size="sm"
          className="ml-2 text-amber-500"
          onClick={onToggleStatus}
        >
          {user.isDeleted ? "Mở khoá" : "Khoá tài khoản"}
        </Button>
      </div>
      <div>
        <b>Xác minh:</b>{" "}
        <span className={user.is_verified ? "text-green-600" : "text-red-600"}>
          {user.is_verified ? "Đã xác minh" : "Chưa xác minh"}
        </span>
        <Button
          size="sm"
          className="ml-2"
          variant="outline"
          onClick={() => onPatch({ is_verified: !user.is_verified })}
        >
          {user.is_verified ? "Huỷ xác minh" : "Xác minh"}
        </Button>
      </div>
    </div>
  </div>
);

export default UserAvatarAndStatus;
