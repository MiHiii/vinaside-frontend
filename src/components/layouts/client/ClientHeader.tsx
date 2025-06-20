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
import { useMobile } from "@/hooks/useMobile";
import ClientSearch from "../../common/ClientSearch";
import { Globe, Menu } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { deleteAccount, logout } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

export default function ClientHeader() {
  const isMobile = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  //xóa tài khoản
  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount()).unwrap();
      dispatch(logout());
      navigate("/login");
      toast.success("Tài khoản đã được xóa thành công");
    } catch (error) {
      toast.error(error as string);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 md:px-6">
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
          </div>
          <span className="hidden text-xl font-bold md:inline-block">
            Vinaside
          </span>
        </Link>

        {/* Search - ẩn trên mobile */}
        <div className="hidden flex-1 md:block">
          <ClientSearch />
        </div>

        {/* Menu & Buttons phải */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Nút "Trở thành host" desktop */}
          {!isMobile &&
            (user ? (
              <div className="flex items-center gap-4">
                <Link to={"#"}>
                  <Button
                    variant="ghost"
                    className="rounded-full text-sm font-medium transition hover:bg-gray-100 hover:text-rose-500"
                  >
                    Đón tiếp khách
                  </Button>
                </Link>
                <Link to={"/profilepage"}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white font-bold text-lg">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                </Link>
              </div>
            ) : (
              <Link to={"/overview"}>
                <Button
                  variant="ghost"
                  className="rounded-full text-sm font-medium transition hover:bg-gray-100 hover:text-rose-500"
                >
                  Trở thành host
                </Button>
              </Link>
            ))}

          {/* Nút globe chọn ngôn ngữ */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full md:flex transition hover:bg-gray-100 hover:text-rose-500"
            >
              <Globe className="h-5 w-5" />
              <span className="sr-only">Language</span>
            </Button>
          )}

          {/* Dropdown desktop chỉ còn Menu icon */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex gap-2 rounded-full border-gray-200 px-4 py-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="z-50 mt-2 w-56 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-3 shadow-2xl"
              >
                {!token ? (
                  <>
                    <DropdownMenuItem className="font-medium">
                      <Link to="/register" className="w-full">
                        Sign up
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/login" className="w-full">
                        Log in
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="font-medium">
                      <Link to="/profilepage" className="w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem className="font-medium">
                        <Link to="/admin" className="w-full text-red-600">
                          Vào trang Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Đăng xuất
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
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
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden space-y-2 px-4 pb-4">
          {!token ? (
            <>
              <Link
                to="/register"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profilepage"
                className="block text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Vào trang Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
