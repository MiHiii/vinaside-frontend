import { api } from "./api";
import { CreateVoucherDto, UpdateVoucherDto } from "@/types/voucher";

export const voucherApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/vouchers", { params }),
  getValid: (params?: Record<string, unknown>) =>
    api.get("/vouchers/valid", { params }),
  getById: (id: string) => api.get(`/vouchers/${id}`),
  getByCode: (code: string) => api.get(`/vouchers/code/${code}`),
  create: (data: CreateVoucherDto) => api.post("/vouchers", data),
  update: (id: string, data: UpdateVoucherDto) =>
    api.put(`/vouchers/${id}`, data),
  remove: (id: string) => api.delete(`/vouchers/${id}`),
  restore: (id: string) => api.put(`/vouchers/${id}/restore`),
  toggleStatus: (id: string) => api.put(`/vouchers/${id}/toggle-status`),
  useVoucher: (id: string) => api.post(`/vouchers/${id}/use`),
  getUsageStats: (id: string) => api.get(`/vouchers/${id}/usage-stats`),
  getBookings: (id: string) => api.get(`/vouchers/${id}/bookings`),
  getDetailedStats: (id: string) => api.get(`/vouchers/stats/detailed/${id}`),
};
