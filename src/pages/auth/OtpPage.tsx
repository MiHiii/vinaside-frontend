import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { resendOtp, verifyOtp } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthModals } from "@/hooks/useAuthModals";
import OtpModal from "@/components/auth/OtpModal";

export default function OtpPage() {
  const [isResending, setIsResending] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isOtpOpen, openOtpModal, closeOtpModal } = useAuthModals();

  const email = useAppSelector((state) => state.auth.verifyEmail);

  useEffect(() => {
    // Auto open modal when page loads
    openOtpModal();
  }, [openOtpModal]);

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
      toast.error("Không tìm thấy email. Vui lòng đăng nhập lại.", {
        duration: 4000,
        className: "text-base py-4 px-6",
      });
      return;
    }
    setIsResending(true);
    try {
      const response = await dispatch(resendOtp({ email }));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("OTP đã được gửi lại.", {
          duration: 4000,
          className: "text-base py-4 px-6",
        });
      } else {
        toast.error("Gửi lại OTP thất bại.", {
          duration: 4000,
          className: "text-base py-4 px-6",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi gửi lại OTP.", {
        duration: 4000,
        className: "text-base py-4 px-6",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    closeOtpModal();
    navigate("/"); // Redirect to home when modal closes
  };

  return (
    <OtpModal
      isOpen={isOtpOpen}
      onClose={handleClose}
      onSubmitOtp={handleVerifyOtp}
      onResendOtp={handleResend}
      isResending={isResending}
      onSwitchToLogin={() => {
        closeOtpModal();
        navigate("/login");
      }}
    />
  );
}
