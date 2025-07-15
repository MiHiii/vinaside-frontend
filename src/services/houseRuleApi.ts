import { api } from "./api";
import { CreateHouseRuleDto, UpdateHouseRuleDto } from "@/types/house-rule";

export const houseRuleApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/house-rules", { params }),
  getPublic: (params?: Record<string, unknown>) => api.get("/house-rules/public", { params }),
  getById: (id: string) => api.get(`/house-rules/${id}`),
  create: (data: CreateHouseRuleDto) => api.post("/house-rules", data),
  update: (id: string, data: UpdateHouseRuleDto) => api.put(`/house-rules/${id}`, data),
  remove: (id: string) => api.delete(`/house-rules/${id}`),
  restore: (id: string) => api.put(`/house-rules/${id}/restore`),
  toggleStatus: (id: string) => api.put(`/house-rules/${id}/toggle-status`),
  toggleDefault: (id: string) => api.put(`/house-rules/${id}/toggle-default`),
}; 