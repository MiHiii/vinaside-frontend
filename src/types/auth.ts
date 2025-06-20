
import { User } from "./user";

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  verifyStatus: "idle" | "loading" | "succeeded" | "failed" | null;
  verifyEmail: string | null;
  isCheckingAuth: boolean;
}

// Khi đăng ký hoặc verify OTP, backend thường trả về như sau:
export interface RegisterResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    email: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    access_token: string;
    user: User;
  };
}


