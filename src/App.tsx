import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./routes";

function App() {
  const dispatch = useAppDispatch();

  // Tự động fetch user khi có token trong localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
