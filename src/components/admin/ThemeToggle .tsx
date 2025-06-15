import { toggleTheme } from "@/store/slices/themeSlice";
import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <button
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
      onClick={() => dispatch(toggleTheme())}
    >
      {mode === "dark" ? (
        <Moon size={20} className="text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun size={20} className="text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}
