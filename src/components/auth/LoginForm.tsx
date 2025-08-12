import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "./Schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import EmailField from "./fields/EmailField";
import PasswordField from "./fields/PasswordField";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { login } from "@/store/slices/authSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getDefaultRouteByRole, getRoleDisplayName } from "@/utils/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn } from "lucide-react";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginForm({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginModalProps) {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      console.log("Token đã cập nhật từ Redux:", token, user);
    }
  }, [token, user]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const actionResult = await dispatch(login(data));
      const result = unwrapResult(actionResult);

      // Lấy thông tin user từ response
      const userData = result.data.user;

      // Hiển thị thông báo thành công với role
      const roleDisplayName = getRoleDisplayName(userData.role);
      toast(
        `Đăng nhập thành công! Chào mừng ${roleDisplayName} ${userData.name}`,
        {
          description: undefined,
          style: {
            background: "#ccccc",
            color: "#00000",
          },
          className: "text-base py-5 px-7 min-w-[320px]",
          descriptionClassName: "text-black text-sm",
        }
      );

      // Xác định route để chuyển hướng
      const targetRoute = getDefaultRouteByRole(userData.role);

      // Kiểm tra nếu có redirect URL từ state (ví dụ: từ ProtectedRoute)
      const from = location.state?.from?.pathname;
      const finalRoute = from && from !== "/login" ? from : targetRoute;

      // Close modal first, then navigate
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      navigate(finalRoute, { replace: true });
    } catch (error) {
      toast.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.",
        {
          duration: 4000,
          className: "text-base py-4 px-6",
        }
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants - simplified for TypeScript compatibility
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -30,
      rotateX: 10,
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md mx-4 z-10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            style={{ perspective: 1000 }}
          >
            <Card className="w-full p-0 rounded-3xl shadow-2xl bg-[hsl(var(--card))] backdrop-blur-lg border border-[hsl(var(--border))] overflow-hidden">
              {/* Header with close button */}
              <motion.div
                className="relative p-6 pb-4 bg-[hsl(var(--muted))]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[hsl(var(--accent))] transition-colors duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </motion.button>

                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="p-3 bg-rose-500 rounded-2xl shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  >
                    <LogIn className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                      Đăng nhập
                    </CardTitle>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      Chào mừng bạn quay trở lại!
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Form Content */}
              <CardContent className="p-6 pt-4">
                <FormProvider {...methods}>
                  <motion.form
                    onSubmit={methods.handleSubmit(onSubmit)}
                    className="space-y-5"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <EmailField />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <PasswordField />
                    </motion.div>

                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onSwitchToForgotPassword) {
                            onSwitchToForgotPassword();
                          }
                        }}
                        className="text-sm text-gray-500 hover:text-gray-600 hover:underline transition-colors duration-200"
                      >
                        Quên mật khẩu?
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <motion.div
                        variants={buttonVariants}
                        initial="idle"
                        whileHover="hover"
                        whileTap="tap"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isLoading ? (
                              <>
                                <motion.div
                                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                                <span>Đang đăng nhập...</span>
                              </>
                            ) : (
                              <>
                                <LogIn className="w-5 h-5" />
                                <span>Đăng nhập</span>
                              </>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="text-center pt-4 border-t border-[hsl(var(--border))]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Chưa có tài khoản?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onSwitchToRegister) {
                              onSwitchToRegister();
                            }
                          }}
                          className="text-rose-500 hover:text-rose-600 font-semibold hover:underline transition-colors duration-200"
                        >
                          Đăng ký ngay
                        </button>
                      </p>
                    </motion.div>
                  </motion.form>
                </FormProvider>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
