import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialMode =
  (localStorage.getItem("theme") as "light" | "dark") || "light";

const initialState = {
  mode: initialMode,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      state.mode = newMode;
      localStorage.setItem("theme", newMode); // ✅ Lưu lại
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.mode = action.payload;
      localStorage.setItem("theme", action.payload); // ✅ Lưu lại
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
