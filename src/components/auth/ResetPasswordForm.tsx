import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordSchema } from "./Schema";
import PasswordField from "./fields/PasswordField";
import ConfirmPasswordField from "./fields/ConfirmPasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useAppDispatch } from "@/hooks/useRedux";
import { resetPassword } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

export default function ResetPasswordForm() {
  const methods = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useAppDispatch();

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      if (!token) {
        toast("Token không tồn tại hoặc không hợp lệ", {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
          className: "text-base py-5 px-7 min-w-[320px]",
          descriptionClassName: "text-black text-sm",
        });
        return;
      }
      await dispatch(
        resetPassword({ token, newPassword: data.password })
      ).unwrap();
      toast("Mật khẩu đã được đặt lại thành công!", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
        className: "text-base py-5 px-7 min-w-[320px]",
        descriptionClassName: "text-black text-sm",
      });
      // Optional: điều hướng về trang đăng nhập nếu muốn
    } catch {
      toast("Đặt lại mật khẩu thất bại", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
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
        <CardHeader className="w-full">
          <CardTitle className="text-2xl font-bold mb-2">
            Đặt lại mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <PasswordField />
              <ConfirmPasswordField />
              {/* Có thể thêm chỗ hiển thị lỗi custom nếu muốn */}
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
                Đặt lại mật khẩu
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
