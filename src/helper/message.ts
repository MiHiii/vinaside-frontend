import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || err.message || "Lỗi không xác định!";
  }
  if (error instanceof Error) return error.message;
  return String(error);
};
