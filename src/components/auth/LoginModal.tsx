import React from "react";
import LoginForm from "./LoginForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginModalProps) {
  return (
    <LoginForm
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      onSwitchToRegister={onSwitchToRegister}
      onSwitchToForgotPassword={onSwitchToForgotPassword}
    />
  );
}
