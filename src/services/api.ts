import axios, { AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const skipRefresh = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-email",
  "/auth/verify-email-otp",
  "/auth/reset-password",
];

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

type FailedRequest = {
  resolve: (value?: string | PromiseLike<string | null> | null) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  console.log(
    "[processQueue] Số request chờ xử lý sau refresh:",
    failedQueue.length,
    error ? "(FAILED)" : "(SUCCESS)"
  );
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const shouldRefreshToken = (originalRequest: AxiosRequestConfig) => {
  const url = originalRequest.url;
  if (!url) return false;
  if (skipRefresh.some((endpoint) => url.endsWith(endpoint))) return false;
  return !!originalRequest.headers?.["Authorization"];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("[axios] Đính kèm token:", token, "URL:", config.url);
      
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith("/auth/refresh-token") &&
      shouldRefreshToken(originalRequest)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        console.log(
          "[Interceptor] Đã có 1 phiên refresh đang chạy, đẩy request vào queue.",
          failedQueue.length + 1
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log(
              "[Interceptor] Lấy token mới từ queue, retry request:",
              token
            );
            if (token)
              originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      console.log("[Interceptor] BẮT ĐẦU refresh token...");

      try {
        const refreshResponse = await api.post(
          "/auth/refresh-token",
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data?.data?.access_token;
        if (!newToken) throw new Error("Không có access token mới!");

        localStorage.setItem("access_token", newToken);
        console.log("[Interceptor] REFRESH thành công! Token mới:", newToken);
        processQueue(null, newToken);

        // Retry request cũ
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        console.log("[Interceptor] Retry lại request cũ sau refresh token.");
        return api(originalRequest);
      } catch (refreshError) {
        console.log("[Interceptor] REFRESH thất bại! Đăng xuất...");
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log("[Interceptor] KẾT THÚC refresh token.");
      }
    }

    // Nếu đã thử refresh rồi mà vẫn lỗi 401, auto logout
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest._retry
    ) {
      console.log("[Interceptor] Đã refresh nhưng vẫn 401, logout!");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Các lỗi khác
    return Promise.reject(error);
  }
);
