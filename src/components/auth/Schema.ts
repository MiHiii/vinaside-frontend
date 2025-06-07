import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
    phone: z.string().regex(/^[0-9]{9,11}$/, {
      message: "Số điện thoại không hợp lệ (9-11 chữ số)",
    }),
  })
export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Tối thiểu 6 ký tự" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;



export const otpSchema = z.object({
  otp: z
    .string()
    .min(8, { message: "Mã OTP phải có 8 ký tự" })
    .max(8, { message: "Mã OTP phải đúng 8 ký tự" })
    .refine((val) => /^\d{8}$/.test(val), {
      message: "Mã OTP chỉ được chứa 8 chữ số",
    }),
});

export type OtpSchema = z.infer<typeof otpSchema>;

