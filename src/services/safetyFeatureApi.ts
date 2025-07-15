import { api } from "./api";
import { CreateSafetyFeatureDto, UpdateSafetyFeatureDto } from "@/types/safety-feature";

export const safetyFeatureApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/safety-features", { params }),
  getPublic: (params?: Record<string, unknown>) => api.get("/safety-features/public", { params }),
  getById: (id: string) => api.get(`/safety-features/${id}`),
  create: (data: CreateSafetyFeatureDto) => api.post("/safety-features", data),
  update: (id: string, data: UpdateSafetyFeatureDto) => api.put(`/safety-features/${id}`, data),
  remove: (id: string) => api.delete(`/safety-features/${id}`),
  restore: (id: string) => api.put(`/safety-features/${id}/restore`),
  toggleStatus: (id: string) => api.put(`/safety-features/${id}/toggle-status`),
  toggleDefault: (id: string) => api.put(`/safety-features/${id}/toggle-default`),
}; 