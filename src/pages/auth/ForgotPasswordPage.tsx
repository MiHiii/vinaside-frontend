import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModals } from "@/hooks/useAuthModals";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const {
    isForgotPasswordOpen,
    openForgotPasswordModal,
    closeForgotPasswordModal,
  } = useAuthModals();

  useEffect(() => {
    // Auto open modal when page loads
    openForgotPasswordModal();
  }, [openForgotPasswordModal]);

  const handleClose = () => {
    closeForgotPasswordModal();
    navigate("/"); // Redirect to home when modal closes
  };

  const handleSuccess = () => {
    closeForgotPasswordModal();
    navigate("/"); // Stay on home after success
  };

  return (
    <ForgotPasswordModal
      isOpen={isForgotPasswordOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
      onSwitchToLogin={() => {
        closeForgotPasswordModal();
        navigate("/login");
      }}
    />
  );
};

export default ForgotPasswordPage;
