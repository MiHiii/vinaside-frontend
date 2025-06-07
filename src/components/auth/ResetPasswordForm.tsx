import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordSchema } from "./Schema";
import PasswordField from "./fields/PasswordField";
import ConfirmPasswordField from "./fields/ConfirmPasswordField";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/useRedux";
import { resetPassword } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import {  useSearchParams } from "react-router-dom";

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
  const dispatch = useAppDispatch() 
  const onSubmit = async (data: ResetPasswordSchema) => {
 
    try {
      if (!token) {
        toast.error("Token không tồn tại hoặc không hợp lệ");
        return;
      }
      await dispatch(resetPassword({token , newPassword : data.password})).unwrap(); // unwrap giúp bắt lỗi chính xác
      toast.success("Mật khẩu đã được đặt lại thành công!");
      // Optional: điều hướng người dùng về trang đăng nhập nếu muốn
    } catch (error) {
      toast.error((error as string) || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="max-w-md mx-auto mt-20 p-8 border border-black rounded-lg shadow-sm space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4">Đặt lại mật khẩu</h2>

        <PasswordField />
        <ConfirmPasswordField />

        <Button type="submit" className="w-full bg-black text-white">
          Đặt lại mật khẩu
        </Button>
      </form>
    </FormProvider>
  );
}
