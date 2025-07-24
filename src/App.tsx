import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchCurrentUser, logout } from "@/store/slices/authSlice";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { router } from "./routes";
import { RootState } from "./store";

function App() {
  const dispatch = useAppDispatch();
  const isCheckingAuth = useAppSelector(
    (state: RootState) => state.auth.isCheckingAuth
  );

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
          <div className="text-lg font-semibold text-[hsl(var(--muted-foreground))]">
            Đang xác thực tài khoản...
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <SonnerToaster />
    </>
  );
}

export default App;
