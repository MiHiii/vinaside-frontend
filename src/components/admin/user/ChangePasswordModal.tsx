import React from "react";
import { User } from "../../../types/user";

interface Props {
  user: User;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn p-6">
        <h3 className="text-xl font-bold mb-4">Đổi mật khẩu cho: {user.email}</h3>
        <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 