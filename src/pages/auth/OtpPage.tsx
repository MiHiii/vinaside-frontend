import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import OtpForm from "@/components/auth/OtpForm";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { resendOtp, verifyOtp } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OtpPage() {
  const [isResending, setIsResending] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const email = useAppSelector((state) => state.auth.verifyEmail);

  const handleVerifyOtp = async (otp: string) => {
    if (!email) {
      toast("Không tìm thấy email. Vui lòng đăng nhập lại.", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
      return;
    }
    try {
      const response = await dispatch(verifyOtp({ email, otp }));
      if (response.meta.requestStatus === "fulfilled") {
        toast("Xác thực OTP thành công. Vui lòng đăng nhập lại.", {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
        });
        navigate("/login");
      } else {
        toast("Xác thực OTP không thành công. Vui lòng thử lại.", {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
        });
      }
    } catch (error) {
      console.log(error);
      toast("Có lỗi xảy ra. Vui lòng thử lại.", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast("Không tìm thấy email. Vui lòng đăng nhập lại.", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
      return;
    }
    setIsResending(true);
    try {
      const response = await dispatch(resendOtp({ email }));
      if (response.meta.requestStatus === "fulfilled") {
        toast("OTP đã được gửi lại.", {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
        });
      } else {
        toast("Gửi lại OTP thất bại.", {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
        });
      }
    } catch (error) {
      console.log(error);
      toast("Có lỗi khi gửi lại OTP.", {
        description: undefined,
        style: {
          background: "#ccccc",
          color: "#00000",
        },
      });
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
