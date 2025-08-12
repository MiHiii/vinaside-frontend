import React from "react";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "./Schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import NameField from "./fields/NameField";
import EmailField from "./fields/EmailField";
import PasswordField from "./fields/PasswordField";
import PhoneField from "./fields/PhoneField";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { register } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}: RegisterModalProps) {
  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, verifyEmail } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);
    try {
      const result = await dispatch(register(data));
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
          {
            duration: 4000,
            className: "text-base py-4 px-6",
          }
        );
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Đăng ký thất bại. Vui lòng thử lại.", {
          duration: 4000,
          className: "text-base py-4 px-6",
        });
      }
    } catch {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.", {
        duration: 4000,
        className: "text-base py-4 px-6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (verifyEmail) {
      methods.reset({
        name: "",
        email: "",
        password: "",
        phone: "",
      });
      onClose();
      navigate("/verify-otp");
    }
  }, [verifyEmail, methods, navigate, onClose]);

  // Animation variants
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
            <Card className="w-full rounded-3xl shadow-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
              {/* Header */}
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
                    <UserPlus className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                      Đăng ký
                    </CardTitle>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      Tạo tài khoản mới
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <NameField />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <EmailField />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <PhoneField />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <PasswordField />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading || loading}
                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isLoading || loading ? (
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
                              <span>Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-5 h-5" />
                              <span>Đăng ký</span>
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div
                      className="text-center pt-4 border-t border-[hsl(var(--border))]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Đã có tài khoản?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onSwitchToLogin) {
                              onSwitchToLogin();
                            }
                          }}
                          className="text-rose-500 hover:text-rose-600 font-semibold hover:underline transition-colors duration-200"
                        >
                          Đăng nhập ngay
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
