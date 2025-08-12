import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModals } from "@/hooks/useAuthModals";
import RegisterModal from "@/components/auth/RegisterModal";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isRegisterOpen, openRegisterModal, closeRegisterModal } =
    useAuthModals();

  useEffect(() => {
    // Auto open modal when page loads
    openRegisterModal();
  }, [openRegisterModal]);

  const handleClose = () => {
    closeRegisterModal();
    navigate("/"); // Redirect to home when modal closes
  };

  const handleSuccess = () => {
    closeRegisterModal();
    // User will be redirected to OTP page automatically by the modal
  };

  return (
    <RegisterModal
      isOpen={isRegisterOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
      onSwitchToLogin={() => {
        closeRegisterModal();
        navigate("/login");
      }}
    />
  );
}
