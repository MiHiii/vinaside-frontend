import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@/components/auth/Schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import EmailField from "@/components/auth/fields/EmailField";
import PasswordField from "@/components/auth/fields/PasswordField";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { useEffect } from "react";
import { getDefaultRouteByRole, getRoleDisplayName } from "@/utils/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      console.log("Token đã cập nhật từ Redux:", token, user);
    }
  }, [token, user]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const actionResult = await dispatch(login(data));
      const result = unwrapResult(actionResult);

      // Lấy thông tin user từ response
      const userData = result.data.user;

      // Hiển thị thông báo thành công với role
      const roleDisplayName = getRoleDisplayName(userData.role);
      toast(
        `Đăng nhập thành công! Chào mừng ${roleDisplayName} ${userData.name}`,
        {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
          className: "text-base py-5 px-7 min-w-[320px]",
          descriptionClassName: "text-black text-sm",
        }
      );

      // Xác định route để chuyển hướng
      const targetRoute = getDefaultRouteByRole(userData.role);

      // Kiểm tra nếu có redirect URL từ state (ví dụ: từ ProtectedRoute)
      const from = location.state?.from?.pathname;
      const finalRoute = from && from !== "/login" ? from : targetRoute;

      navigate(finalRoute, { replace: true });
    } catch (error) {
      toast.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.",
        {
          duration: 4000,
          className: "text-base py-4 px-6",
        }
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-0 rounded-3xl shadow-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-[hsl(var(--muted))]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-rose-500 rounded-2xl shadow-lg">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Đăng nhập
              </CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Chào mừng bạn quay trở lại!
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <CardContent className="p-6 pt-4">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div>
                <EmailField />
              </div>

              <div>
                <PasswordField />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-gray-500 hover:text-gray-600 hover:underline transition-colors duration-200"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang đăng nhập...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Đăng nhập</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-[hsl(var(--border))]">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-rose-500 hover:text-rose-600 font-semibold hover:underline transition-colors duration-200"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
