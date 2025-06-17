import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/useRedux";
import { useThememode } from "@/hooks/useTheme";
import { toggleTheme } from "@/store/slices/themeSlice";

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const mode = useThememode();

  console.log(mode);
  

  return (
    <Button onClick={() => dispatch(toggleTheme())} >
      {mode === "light" ? "🌞" : "🌙"}
    </Button> 
  );
};

export default ThemeToggle;
