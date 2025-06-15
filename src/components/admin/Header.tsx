import { LayoutPanelLeft, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle ";

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ collapsed, onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-6  dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      {/* Menu */}
      <nav className="flex items-center space-x-4 sm:space-x-6">
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
            collapsed
              ? "bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600"
              : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          } hover:bg-gray-200 dark:hover:bg-slate-700`}
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <LayoutPanelLeft
            size={15}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
        <button className="font-semibold text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          Overview
        </button>
        <button className="text-gray-500 hover:text-black dark:hover:text-white transition-colors hidden sm:inline">
          Customers
        </button>
        <button className="text-gray-500 hover:text-black dark:hover:text-white transition-colors hidden sm:inline">
          Products
        </button>
        <button className="text-gray-500 hover:text-black dark:hover:text-white transition-colors hidden sm:inline">
          Settings
        </button>
      </nav>

      {/* Search + actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-4 pr-12 py-2 w-40 sm:w-56 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-b"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 rounded border">
            ⌘K
          </span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Chuông thông báo */}
        <button className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm flex items-center justify-center font-semibold text-white cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all">
          SN
        </div>
      </div>
    </header>
  );
}
