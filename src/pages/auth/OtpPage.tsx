import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import OtpForm from "@/components/auth/OtpForm";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { resendOtp, verifyOtp } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function OtpPage() {
  const [isResending, setIsResending] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const email = useAppSelector((state) => state.auth.verifyEmail);

  const handleVerifyOtp = async (otp: string) => {
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const response = await dispatch(verifyOtp({ email, otp }));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Xác thực OTP thành công. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        toast.error("Xác thực OTP không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.log(error);
      
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }
    setIsResending(true);
    try {
      const response = await dispatch(resendOtp({ email }));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("OTP đã được gửi lại.");
      } else {
        toast.error("Gửi lại OTP thất bại.");
      }
    } catch (error) {
      console.log(error);
      
      toast.error("Có lỗi khi gửi lại OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <Card
        className="
        w-full max-w-lg p-8 rounded-xl shadow-xl
         text-[hsl(var(--card-foreground))]
        border border-[hsl(var(--border))]
        flex flex-col items-center
      "
      >
        <CardContent className="w-full flex flex-col items-center px-0 py-8 gap-6">
          <h2 className="text-2xl font-bold text-center text-[hsl(var(--card-foreground))] mb-2">
            Xác minh OTP
          </h2>
          <OtpForm
            onSubmitOtp={handleVerifyOtp}
            onResendOtp={handleResend}
            isResending={isResending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
