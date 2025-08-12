import { useState, useCallback } from "react";

export const useAuthModals = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  // Register Modal
  const openRegisterModal = useCallback(() => {
    setIsRegisterOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setIsRegisterOpen(false);
  }, []);

  // Forgot Password Modal
  const openForgotPasswordModal = useCallback(() => {
    setIsForgotPasswordOpen(true);
  }, []);

  const closeForgotPasswordModal = useCallback(() => {
    setIsForgotPasswordOpen(false);
  }, []);

  // Reset Password Modal
  const openResetPasswordModal = useCallback(() => {
    setIsResetPasswordOpen(true);
  }, []);

  const closeResetPasswordModal = useCallback(() => {
    setIsResetPasswordOpen(false);
  }, []);

  // OTP Modal
  const openOtpModal = useCallback(() => {
    setIsOtpOpen(true);
  }, []);

  const closeOtpModal = useCallback(() => {
    setIsOtpOpen(false);
  }, []);

  return {
    // Register
    isRegisterOpen,
    openRegisterModal,
    closeRegisterModal,

    // Forgot Password
    isForgotPasswordOpen,
    openForgotPasswordModal,
    closeForgotPasswordModal,

    // Reset Password
    isResetPasswordOpen,
    openResetPasswordModal,
    closeResetPasswordModal,

    // OTP
    isOtpOpen,
    openOtpModal,
    closeOtpModal,
  };
};
