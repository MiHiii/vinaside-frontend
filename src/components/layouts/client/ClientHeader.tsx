import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import ClientSearch from "../../common/ClientSearch";
import { Menu } from "lucide-react";
import ThemeToggle from "../../common/ThemeToggle";
import Notification from "../../common/Notification";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { deleteAccount, logout } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import {
  FaRegHeart,
  FaUser,
  FaRegCommentDots,
  FaRegAddressCard,
  FaRegLifeRing,
  FaSignOutAlt,
  FaUserShield,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

export default function ClientHeader() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Lấy thông tin token và user từ Redux
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  // //xóa tài khoản
  // const handleDeleteAccount = async () => {
  //   try {
  //     await dispatch(deleteAccount()).unwrap();
  //     dispatch(logout());
  //     navigate("/login");
  //     toast.success("Tài khoản đã được xóa thành công");
  //   } catch (error) {
  //     toast.error(error as string);
  //   }
  // };

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm">
      <div className="mx-auto flex container items-center justify-between px-4 py-4 md:px-6">
        {/* Logo SÁT TRÁI ngoài cùng */}
        <Link to="/" className="flex items-center gap-2 mr-6">
          <div className="text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            {/* <img src="/logochu.png" alt="Vinaside Logo" className="h-20 w-20" /> */}
          </div>
          <span className="hidden text-xl font-bold md:inline-block">
            Vinaside
          </span>
        </Link>

        {/* Search - hiển thị trên tất cả thiết bị */}
        <div className="flex-1">
          <ClientSearch />
        </div>

        {/* Chuông thông báo */}
        <Notification />

        {/* Menu & Buttons phải */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Dropdown hiển thị trên tất cả thiết bị */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {user ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:opacity-60 transition">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center rounded-full bg-black text-white text-lg font-bold">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="flex gap-2 rounded-full border-gray-200 px-4 py-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-50 mt-2 w-62 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-2 shadow-2xl"
            >
              {!token ? (
                <>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/register"
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaUserPlus className="inline-block" />
                      Đăng ký
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/login"
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaSignInAlt className="inline-block" />
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/"
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaRegHeart className="inline-block" />
                      Danh sách yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/profilepage"
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaUser className="inline-block" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/messages"
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaRegCommentDots className="inline-block" />
                      Tin nhắn
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-b border-gray-300 dark:border-gray-800"></div>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to=""
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaRegAddressCard className="inline-block" />
                      Giới thiệu chủ nhà
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to=""
                      className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FaRegLifeRing className="inline-block" />
                      Hỗ trợ & đánh giá
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-b border-gray-300 dark:border-gray-800"></div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-gray-700 dark:text-gray-200 flex items-center gap-2"
                  >
                    <FaSignOutAlt className="inline-block" />
                    Đăng xuất
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="m-2 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                      <Link
                        to="/admin"
                        className="w-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
                      >
                        <FaUserShield className="inline-block" />
                        Vào trang Admin
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* <DropdownMenuItem
                    onClick={() => setShowDeleteModal(true)}
                    className="font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Xóa tài khoản
                  </DropdownMenuItem>

                  {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">
                          Xác nhận xóa tài khoản
                        </h3>
                        <p className="mb-4">
                          Bạn có chắc chắn muốn xóa tài khoản? Hành động này
                          không thể hoàn tác.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteModal(false)}
                            className="bg-gray-300 px-4 py-2 rounded-lg"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                          >
                            Xóa tài khoản
                          </button>
                        </div>
                      </div>
                    </div>
                  )} */}
                </>
              )}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
