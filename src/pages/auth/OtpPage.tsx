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

  const email = useAppSelector((state) => state.auth.user?.email);
  const handleVerifyOtp = async (otp: string) => {
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const response = await dispatch(verifyOtp({ email, otp }));
      if (response.meta.requestStatus === "fulfilled") {
        console.log("OTP xác thực thành công");
        toast.success("Xác thực OTP thành công vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        toast.error("Xác thực OTP không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
    }
  };
  const handleResend = async () => {
    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng đăng nhập lại.");
      return;
    }

    setIsResending(true);
    try {
      await dispatch(resendOtp({ email }));
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      toast.error("Gửi lại OTP không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="py-8 space-y-6">
          <h2 className="text-xl font-semibold text-center">Xác minh OTP</h2>
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
