import { LayoutPanelLeft, Menu } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import Notification from "../common/Notification";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { FaRegCommentDots, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { logout as logoutAction } from "../../store/slices/authSlice";

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-6  border-gray-200 dark:border-slate-700 bg-gray-50">
      {/* Menu */}
      <nav className="flex items-center space-x-4 sm:space-x-6">
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
            collapsed
              ? "bg-gray-200 border-gray-300"
              : "bg-gray-100  border-gray-200"
          } hover:bg-gray-200`}
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <LayoutPanelLeft
            size={15}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </nav>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {/* Chuông thông báo */}
        <Notification isAdmin />
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
            <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
              <Link
                to="/admin/profilepage"
                className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
              >
                <FaUser className="inline-block" />
                Thông tin cá nhân
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="m-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
              <Link
                to="/admin/messages"
                className="w-full text-gray-700 dark:text-gray-200 flex items-center gap-2"
              >
                <FaRegCommentDots className="inline-block" />
                Tin nhắn
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
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
