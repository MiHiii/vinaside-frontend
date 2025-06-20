import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AuthState, LoginResponse, RegisterResponse } from "@/types/auth";
import { api } from "@/services/api";

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("access_token") || null,
  loading: false,
  error: null,
  verifyStatus: null,
  verifyEmail: null,
};

// Action verifyEmailByToken
export const verifyEmailByToken = createAsyncThunk(
  "auth/verifyEmailByToken",
  async (token: string, thunkAPI) => {
    try {
      const { data } = await api.get(`/auth/verify-email/${token}`);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Xác minh thất bại"
      );
    }
  }
);

// Action register
export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      name,
      password,
      phone,
    }: {
      email: string;
      name: string;
      password: string;
      phone: string;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        name,
        password,
        phone,
      });
      console.log("Registration response:", data);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("Registration error:", axiosErr);
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Action verifyOtp
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/verify-email-otp", { email, otp });
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("OTP verification error:", axiosErr);
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

// Action resendOtp
export const resendOtp = createAsyncThunk(
  "auth/resend-verification",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("Resend OTP fail:", axiosErr);
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Gửi lại OTP thất bại"
      );
    }
  }
);

// Action login
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // Lưu vào localStorage (nếu muốn)
      if (data?.data?.access_token) {
        localStorage.setItem("access_token", data.data.access_token);
      }
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Login failed"
      );
    }
  }
);

// Quên mật khẩu - gửi email khôi phục
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Gửi email khôi phục thất bại"
      );
    }
  }
);

// Đặt lại mật khẩu mới
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Đặt lại mật khẩu thất bại"
      );
    }
  }
);

//profile
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/auth/me"); 
    
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Không lấy được user"
      );
    }
  }
);
// DELETE-ACTION: Xoá tài khoản
  // authSlice.ts
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (_, thunkAPI) => {
    try {
      await api.delete("/auth/delete-account");
      return true;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Xóa tài khoản thất bại"
      );
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("access_token");
      state.token = null;
      state.verifyEmail = null;
      state.verifyStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          // Cập nhật thông tin khi đăng nhập thành công
          state.user = action.payload.data.user || null; // Lưu thông tin user
          state.token = action.payload.data.access_token || null; // Lưu access token
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login error";
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<RegisterResponse>) => {
          console.log("Register payload:", action.payload);
          state.loading = false;
          state.verifyEmail = action.payload.data.email || null;
        }
      )
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Registration error";
      })

      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyOtp.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.verifyEmail = null; // OTP đã xác minh xong
          state.user = action.payload.data.user || null;
          state.token = action.payload.data.access_token || null;
        }
      )
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "OTP verification failed";
      })

      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(verifyEmailByToken.pending, (state) => {
        state.verifyStatus = "loading";
        state.error = null;
      })
      .addCase(verifyEmailByToken.fulfilled, (state) => {
        state.verifyStatus = "succeeded";
      })
      .addCase(verifyEmailByToken.rejected, (state, action) => {
        state.verifyStatus = "failed";
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //profile
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        console.log("User payload:", action.payload);
        state.loading = false;
        state.user = action.payload.data.user || null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        console.log(
          "[fetchCurrentUser] rejected",
          action.error,
          action.payload
        );
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("access_token");
        state.error = action.payload as string;
      })
      // Xoá tài khoản
    .addCase(deleteAccount.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteAccount.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("access_token");
    })
    .addCase(deleteAccount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
     
      
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
