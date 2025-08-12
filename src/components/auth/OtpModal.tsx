import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import OtpInput from "./fields/OtpField";
import { otpSchema, OtpSchema } from "./Schema";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, RotateCcw, X } from "lucide-react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOtp: (otp: string) => void;
  onResendOtp: () => void;
  isResending: boolean;
  onSwitchToLogin?: () => void;
}

export default function OtpModal({
  isOpen,
  onClose,
  onSubmitOtp,
  onResendOtp,
  isResending,
  onSwitchToLogin,
}: OtpModalProps) {
  const form = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = (data: OtpSchema) => {
    onSubmitOtp(data.otp);
  };

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
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                      Xác thực OTP
                    </CardTitle>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      Nhập mã xác thực từ email
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Form Content */}
              <CardContent className="p-6 pt-4">
                <FormProvider {...form}>
                  <motion.form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <OtpInput />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Shield className="w-5 h-5" />
                          <span>Xác nhận</span>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] py-3 rounded-xl transition-colors duration-200"
                        onClick={onResendOtp}
                        disabled={isResending}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isResending ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </motion.div>
                              <span>Đang gửi lại...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              <span>Gửi lại mã</span>
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>

                    {onSwitchToLogin && (
                      <motion.div
                        className="text-center pt-4 border-t border-[hsl(var(--border))]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Có vấn đề?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSwitchToLogin();
                            }}
                            className="text-rose-500 hover:text-rose-600 font-semibold hover:underline transition-colors duration-200"
                          >
                            Đăng nhập lại
                          </button>
                        </p>
                      </motion.div>
                    )}
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
