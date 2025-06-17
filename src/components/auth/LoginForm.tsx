import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "./Schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import EmailField from "./fields/EmailField";
import PasswordField from "./fields/PasswordField";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { useEffect } from "react";
export default function LoginForm() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (token && user) {
      console.log("Token đã cập nhật từ Redux:", token, user);
    }
  }, [token, user]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const methods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      const actionResult = await dispatch(login(data));
      unwrapResult(actionResult);

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      toast.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
      console.error("Login error:", error);
    }
  };


  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <Card
        className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-lg
         text-[hsl(var(--card-foreground))]
          border border-[hsl(var(--border))]
          flex flex-col items-center justify-center min-h-[60vh]
        "
      >
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <EmailField />
              <PasswordField />
              <p>
                Quên mật khẩu?{" "}
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:underline"
                >
                  Nhấn vào đây
                </Link>
              </p>
              <Button
                type="submit"
                className="
        w-full mt-4 py-3 rounded-xl
    bg-[hsl(var(--background))]
    text-[hsl(var(--foreground))]
    dark:bg-[hsl(var(--foreground))]
    dark:text-[hsl(var(--background))]
    font-semibold text-base shadow-md 
    transition
  "
              >
                Đăng nhập
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
