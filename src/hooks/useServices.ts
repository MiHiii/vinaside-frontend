import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchServices,
  fetchServiceDetail,
  createService,
  updateService,
  removeService,
  restoreService,
  toggleServiceStatus,
  clearServiceError,
  clearServiceDetail,
} from "@/store/slices/serviceSlice";
import { useCallback } from "react";
import { CreateServiceDto, UpdateServiceDto } from "@/types/services";

export const useServices = () => {
  const dispatch = useAppDispatch();
  const { services, serviceDetail, loading, error } = useAppSelector((state) => state.service);

  const getServices = useCallback((params?: Record<string, unknown>) => {
    dispatch(fetchServices(params ?? {}));
  }, [dispatch]);

  const getServiceDetail = useCallback((id: string) => {
    dispatch(fetchServiceDetail(id));
  }, [dispatch]);

  const addService = useCallback((dto: CreateServiceDto) => {
    return dispatch(createService(dto));
  }, [dispatch]);

  const editService = useCallback((id: string, dto: UpdateServiceDto) => {
    return dispatch(updateService({ id, dto }));
  }, [dispatch]);

  const deleteService = useCallback((id: string) => {
    return dispatch(removeService(id));
  }, [dispatch]);

  const restore = useCallback((id: string) => {
    return dispatch(restoreService(id));
  }, [dispatch]);

  const toggleStatus = useCallback((id: string) => {
    return dispatch(toggleServiceStatus(id));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearServiceError());
  }, [dispatch]);

  const clearDetail = useCallback(() => {
    dispatch(clearServiceDetail());
  }, [dispatch]);

  return {
    services,
    serviceDetail,
    loading,
    error,
    getServices,
    getServiceDetail,
    addService,
    editService,
    deleteService,
    restore,
    toggleStatus,
    clearError,
    clearDetail,
  };
}; 