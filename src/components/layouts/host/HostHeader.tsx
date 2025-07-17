import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { LogoPerson } from "../LogoPerson";

export function HostHeader() {
  return (
    <header className="w-full border-b border-gray-300 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center h-20 px-4 gap-2">
        {/* Logo bên trái */}
        <NavLink to="/" className="flex items-center text-rose-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-8 w-8"
          >
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
            Vinaside
          </span>
        </NavLink>

        {/* Menu giữa - ẩn trên mobile, hiện trên desktop */}
        <nav className="hidden md:flex flex-1 justify-center ml-32">
          <ul className="flex gap-4 md:gap-8 text-base font-medium text-gray-700">
            <li>
              <NavLink
                to="/hosting"
                end
                className={({ isActive }) =>
                  `whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black after:transition-all ${
                    isActive
                      ? "text-black after:w-full"
                      : "text-gray-700 hover:text-black after:w-0 hover:after:w-full"
                  }`
                }
              >
                Hôm nay
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black after:transition-all ${
                    isActive
                      ? "text-black after:w-full"
                      : "text-gray-700 hover:text-black after:w-0 hover:after:w-full"
                  }`
                }
              >
                Lịch
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hosting/listings"
                className={({ isActive }) =>
                  `whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black after:transition-all ${
                    isActive
                      ? "text-black after:w-full"
                      : "text-gray-700 hover:text-black after:w-0 hover:after:w-full"
                  }`
                }
              >
                Nhà/phòng cho thuê
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black after:transition-all ${
                    isActive
                      ? "text-black after:w-full"
                      : "text-gray-700 hover:text-black after:w-0 hover:after:w-full"
                  }`
                }
              >
                Tin nhắn
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Góc phải */}
        <div className="flex items-center gap-2 min-w-max">
          <NavLink
            to="/chuyen-che-do-du-lich"
            className="hidden lg:block text-gray-700 text-sm font-medium mr-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Chuyển sang chế độ du lịch
          </NavLink>
          <LogoPerson />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100 text-black hover:bg-gray-200 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
