import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthModals } from "@/hooks/useAuthModals";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const {
    isResetPasswordOpen,
    openResetPasswordModal,
    closeResetPasswordModal,
  } = useAuthModals();

  useEffect(() => {
    // Auto open modal when page loads
    openResetPasswordModal();
  }, [openResetPasswordModal]);

  const handleClose = () => {
    closeResetPasswordModal();
    navigate("/"); // Redirect to home when modal closes
  };

  const handleSuccess = () => {
    closeResetPasswordModal();
    navigate("/login"); // Go to login after successful reset
  };

  return (
    <ResetPasswordModal
      isOpen={isResetPasswordOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
      token={token || undefined}
      onSwitchToLogin={() => {
        closeResetPasswordModal();
        navigate("/login");
      }}
    />
  );
};

export default ResetPasswordPage;
