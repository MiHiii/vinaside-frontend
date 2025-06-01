import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { AuthState, AuthResponse } from "@/types/auth";

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      name,
      password,
      phone,
      confirmPassword,
    }: {
      email: string;
      name: string;
      password: string;
      phone: string;
      confirmPassword: string;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await axios.post("/auth/register", {
        email,
        name,
        password,
        phone,
        confirmPassword,
      });
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

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const { data } = await axios.post("/auth/verify-otp", { email, otp });

      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("Otp fail:", axiosErr);
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const response = await axios.post("/auth/resend-otp", { email });
      return response.data; // Nếu gửi thành công, trả về dữ liệu phản hồi (có thể là thông báo hoặc thông tin liên quan)
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("Resend OTP fail:", axiosErr);
      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Gửi lại OTP thất bại"
      );
    }
  }
);


export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const { data } = await axios.post("/auth/login", { email, password } , {withCredentials: true});
      return data;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("Registration error:", axiosErr);

      return thunkAPI.rejectWithValue(
        axiosErr.response?.data?.message || "Login failed"
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
      state.token = null;
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
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.accessToken; 
          
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
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
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
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
        }
      )
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset error trước khi gửi yêu cầu
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        console.log("OTP đã được gửi lại:", action.payload);
        // Cập nhật bất kỳ trạng thái nào nếu cần (ví dụ: thông báo thành công, thời gian gửi lại, v.v.)
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Lưu thông báo lỗi khi gửi OTP thất bại
      });
      
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
