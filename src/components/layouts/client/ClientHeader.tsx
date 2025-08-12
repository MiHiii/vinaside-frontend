import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import ClientSearch from "../../common/ClientSearch";
import { Menu, Search } from "lucide-react";
import ThemeToggle from "../../common/ThemeToggle";
import Notification from "../../common/Notification";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
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
import { logout } from "@/store/slices/authSlice";
import { useState } from "react";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useAuthModals } from "@/hooks/useAuthModals";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";

export default function ClientHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Lấy thông tin token và user từ Redux
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Login modal
  const { isOpen, openModal, closeModal } = useLoginModal();

  // Auth modals
  const {
    isRegisterOpen,
    openRegisterModal,
    closeRegisterModal,
    isForgotPasswordOpen,
    openForgotPasswordModal,
    closeForgotPasswordModal,
  } = useAuthModals();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleLoginSuccess = () => {
    closeModal();
    // User sẽ được navigate tự động trong LoginForm
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
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
          <span className="hidden text-xl font-bold text-[hsl(var(--muted-foreground))] md:inline-block">
            Vinaside
          </span>
        </Link>

        {/* Search - desktop: hiện, mobile: ẩn, hiện icon */}
        <div className="flex-1 flex justify-center">
          <div className="hidden md:block">
            <ClientSearch />
          </div>
          <button
            className="block md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Tìm kiếm"
          >
            <Search className="h-6 w-6" />
          </button>
        </div>

        {/* Chuông thông báo, theme, menu - desktop: hiện, mobile: gom vào menu */}
        <div className="hidden md:flex items-center gap-2">
          <Notification />
          <ThemeToggle />
          {/* Dropdown menu như cũ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {user ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:opacity-60 transition">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center rounded-full bg-black text-white text-lg font-bold">
                      {user?.name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
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
                  <DropdownMenuItem
                    onClick={openRegisterModal}
                    className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="w-full flex items-center gap-2">
                      <FaUserPlus className="inline-block" />
                      Đăng ký
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openModal}
                    className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="w-full flex items-center gap-2">
                      <FaSignInAlt className="inline-block" />
                      Đăng nhập
                    </div>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="m-2 font-medium text-dark dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/wishlists"
                      className="w-full flex items-center gap-2"
                    >
                      <FaRegHeart className="inline-block" />
                      Danh sách yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/profilepage"
                      className="w-full flex items-center gap-2"
                    >
                      <FaUser className="inline-block" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Link
                      to="/messages"
                      className="w-full flex items-center gap-2"
                    >
                      <FaRegCommentDots className="inline-block" />
                      Tin nhắn
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-b border-gray-300 dark:border-gray-300"></div>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Link to="" className="w-full flex items-center gap-2">
                      <FaRegAddressCard className="inline-block" />
                      Giới thiệu chủ nhà
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Link to="" className="w-full flex items-center gap-2">
                      <FaRegLifeRing className="inline-block" />
                      Hỗ trợ & đánh giá
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-b border-gray-300 dark:border-gray-300"></div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
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
                </>
              )}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: Notification luôn hiện ngoài, các nút khác vào menu */}
        <div className="flex md:hidden items-center gap-2">
          <Notification />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {user ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:opacity-60 transition">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center rounded-full bg-black text-white text-lg font-bold">
                      {user?.name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>
              ) : (
                <Button variant="outline" className="rounded-full p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-50 mt-2 w-56 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-2 shadow-2xl"
            >
              {/* Bỏ Notification khỏi menu mobile */}
              <DropdownMenuItem asChild>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span>Giao diện</span>
                </div>
              </DropdownMenuItem>
              {/* Các mục menu người dùng như trên, có thể tái sử dụng code */}
              {!token ? (
                <>
                  <DropdownMenuItem
                    onClick={openRegisterModal}
                    className="flex items-center gap-2"
                  >
                    <FaUserPlus /> Đăng ký
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openModal}
                    className="flex items-center gap-2"
                  >
                    <FaSignInAlt /> Đăng nhập
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center gap-2">
                      <FaRegHeart /> Danh sách yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profilepage" className="flex items-center gap-2">
                      <FaUser /> Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center gap-2">
                      <FaRegCommentDots /> Tin nhắn
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="" className="flex items-center gap-2">
                      <FaRegAddressCard /> Giới thiệu chủ nhà
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="" className="flex items-center gap-2">
                      <FaRegLifeRing /> Hỗ trợ & đánh giá
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 text-red-600"
                      >
                        <FaUserShield /> Vào trang Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Modal tìm kiếm trên mobile */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center pt-24">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-auto p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">Tìm kiếm</span>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <ClientSearch />
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={isOpen}
        onClose={closeModal}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={openRegisterModal}
        onSwitchToForgotPassword={openForgotPasswordModal}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeRegisterModal}
        onSwitchToLogin={openModal}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={closeForgotPasswordModal}
        onSwitchToLogin={openModal}
      />
    </header>
  );
}
