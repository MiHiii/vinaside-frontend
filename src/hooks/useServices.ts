import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchServices,
  fetchServiceDetail,
  createService,
  updateService,
  removeService,
  restoreService,
  toggleServiceStatus,
  fetchServiceUsage,
  fetchServiceBookings,
  clearServiceUsage,
  clearServiceError,
  clearServiceDetail,
} from "@/store/slices/serviceSlice";
import { useCallback } from "react";
import { CreateServiceDto, UpdateServiceDto } from "@/types/services";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const useServices = () => {
  const dispatch = useAppDispatch();
  const {
    services,
    serviceDetail,
    serviceUsage,
    serviceBookings,
    loading,
    error,
  } = useSelector((state: RootState) => state.service);

  const getServices = useCallback(
    (params?: Record<string, unknown>) => {
      dispatch(fetchServices(params ?? {}));
    },
    [dispatch]
  );

  const getServiceDetail = useCallback(
    (id: string) => {
      dispatch(fetchServiceDetail(id));
    },
    [dispatch]
  );

  const addService = useCallback(
    (dto: CreateServiceDto) => {
      return dispatch(createService(dto));
    },
    [dispatch]
  );

  const editService = useCallback(
    (id: string, dto: UpdateServiceDto) => {
      return dispatch(updateService({ id, dto }));
    },
    [dispatch]
  );

  const deleteService = useCallback(
    (id: string) => {
      return dispatch(removeService(id));
    },
    [dispatch]
  );

  const restore = useCallback(
    (id: string) => {
      return dispatch(restoreService(id));
    },
    [dispatch]
  );

  const toggleStatus = useCallback(
    (id: string) => {
      return dispatch(toggleServiceStatus(id));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearServiceError());
  }, [dispatch]);

  const clearDetail = useCallback(() => {
    dispatch(clearServiceDetail());
  }, [dispatch]);

  const getServiceUsage = useCallback(
    (id: string) => {
      dispatch(fetchServiceUsage(id));
    },
    [dispatch]
  );

  const getServiceBookings = useCallback(
    (id: string) => {
      dispatch(fetchServiceBookings(id));
    },
    [dispatch]
  );

  const clearUsage = useCallback(() => {
    dispatch(clearServiceUsage());
  }, [dispatch]);

  return {
    services,
    serviceDetail,
    serviceUsage,
    serviceBookings,
    loading,
    error,
    getServices,
    getServiceDetail,
    createService: addService,
    updateService: editService,
    removeService: deleteService,
    restoreService: restore,
    toggleStatus: toggleStatus,
    clearError,
    clearDetail,
    getServiceUsage,
    getServiceBookings,
    clearUsage,
  };
};
