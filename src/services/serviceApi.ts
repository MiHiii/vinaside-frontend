import { api } from './api';
import { CreateServiceDto, UpdateServiceDto } from '@/types/services';

export const serviceApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/services', { params }),
  getActive: () => api.get('/services/active'),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: CreateServiceDto) => api.post('/services', data),
  update: (id: string, data: UpdateServiceDto) => api.put(`/services/${id}`, data),
  remove: (id: string) => api.delete(`/services/${id}`),
  restore: (id: string) => api.put(`/services/${id}/restore`),
  toggleStatus: (id: string) => api.put(`/services/${id}/toggle-status`),
  toggleQuantity: (id: string) => api.put(`/services/${id}/toggle-quantity`),
  getBookings: (id: string) => api.get(`/services/${id}/bookings`),
  getDetailedStats: (id: string) => api.get(`/services/stats/detailed/${id}`),
};
