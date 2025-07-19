import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/components/auth/Schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import EmailField from "@/components/auth/fields/EmailField";
import { Link } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useRedux";
import { forgotPassword } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

export default function AdminForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const methods = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await dispatch(forgotPassword(data));
      
      toast.success("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.", {
        duration: 5000,
      });
    } catch (error) {
      toast.error(
        "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
      console.error("Forgot password error:", error);
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
          <CardTitle className="text-center">Quên mật khẩu</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <EmailField />
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
                Gửi email đặt lại mật khẩu
              </Button>
              <div className="text-center mt-4">
                <Link
                  to="/admin/login"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  ← Quay lại trang đăng nhập Admin
                </Link>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
} 