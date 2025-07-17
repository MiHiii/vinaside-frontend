import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/useRedux";
import { useThememode } from "@/hooks/useTheme";
import { toggleTheme } from "@/store/slices/themeSlice";

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const mode = useThememode();

  console.log(mode);

  return (
    <Button
      onClick={() => dispatch(toggleTheme())}
      className="rounded-full p-4 cursor-pointer dark:hover:bg-slate-800 hover:opacity-70 transition"
    >
      {mode === "light" ? "🌞" : "🌙"}
    </Button>
  );
};

export default ThemeToggle;
