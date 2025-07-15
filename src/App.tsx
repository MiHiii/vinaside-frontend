import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchCurrentUser, logout } from "@/store/slices/authSlice";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./routes";
import { RootState } from "./store";

function App() {
  const dispatch = useAppDispatch();

  const token = useAppSelector((state: RootState) => state.auth.token);
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
    return <div>Đang xác thực tài khoản...</div>;
  }
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
