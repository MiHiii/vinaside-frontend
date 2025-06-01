import { useEffect } from "react";
import { useThememode } from "@/hooks/useTheme";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const mode = useThememode();

  useEffect(() => {
    const html = document.documentElement;
    console.log("theme effect:", mode);
    if (mode === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [mode]);

  return (
    <>
      
        {children}
    
    </>
  );
};

export default AppWrapper;
