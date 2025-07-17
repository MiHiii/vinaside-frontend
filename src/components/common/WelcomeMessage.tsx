import { useAppSelector } from "@/hooks/useRedux";
import { getRoleDisplayName } from "@/utils/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface WelcomeMessageProps {
  showToast?: boolean;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ showToast = false }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    if (user && showToast && !hasShownWelcome) {
      const roleDisplayName = getRoleDisplayName(user.role);
      toast.success(`Chào mừng ${roleDisplayName} ${user.name}!`, {
        duration: 3000,
      });
      setHasShownWelcome(true);
    }
  }, [user, showToast, hasShownWelcome]);

  if (!user) return null;

  const roleDisplayName = getRoleDisplayName(user.role);

  return (
    <div className="text-center py-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Chào mừng {roleDisplayName} {user.name}!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Bạn đã đăng nhập với vai trò {roleDisplayName.toLowerCase()}
      </p>
    </div>
  );
};

export default WelcomeMessage; 