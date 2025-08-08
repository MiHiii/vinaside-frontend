import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchVouchers,
  fetchVoucherDetail,
  createVoucher,
  updateVoucher,
  removeVoucher,
  restoreVoucher,
  toggleVoucherStatus,
  clearVoucherError,
  clearVoucherDetail,
  fetchVoucherUsage,
  fetchVoucherBookings,
  clearVoucherUsage,
  fetchVoucherDetailedStats,
} from "@/store/slices/voucherSlice";
import { useCallback } from "react";
import { CreateVoucherDto, UpdateVoucherDto } from "@/types/voucher";

export const useVouchers = () => {
  const dispatch = useAppDispatch();
  const {
    vouchers,
    voucherDetail,
    voucherUsage,
    voucherBookings,
    voucherDetailedStats,
    loading,
    error,
  } = useAppSelector((state) => state.voucher);

  // Các hàm CRUD
  const getVouchers = useCallback(
    (params?: Record<string, unknown>) => {
      dispatch(fetchVouchers(params ?? {}));
    },
    [dispatch]
  );

  const getVoucherDetail = useCallback(
    (id: string) => {
      dispatch(fetchVoucherDetail(id));
    },
    [dispatch]
  );

  const getVoucherUsage = useCallback(
    (id: string) => {
      dispatch(fetchVoucherUsage(id));
    },
    [dispatch]
  );

  const getVoucherBookings = useCallback(
    (id: string) => {
      dispatch(fetchVoucherBookings(id));
    },
    [dispatch]
  );

  const getVoucherDetailedStats = useCallback(
    (id: string) => {
      dispatch(fetchVoucherDetailedStats(id));
    },
    [dispatch]
  );

  const clearUsage = useCallback(() => {
    dispatch(clearVoucherUsage());
  }, [dispatch]);

  const addVoucher = useCallback(
    (dto: CreateVoucherDto) => {
      return dispatch(createVoucher(dto));
    },
    [dispatch]
  );

  const editVoucher = useCallback(
    (id: string, dto: UpdateVoucherDto) => {
      return dispatch(updateVoucher({ id, dto }));
    },
    [dispatch]
  );

  const deleteVoucher = useCallback(
    (id: string) => {
      return dispatch(removeVoucher(id));
    },
    [dispatch]
  );

  const restore = useCallback(
    (id: string) => {
      return dispatch(restoreVoucher(id));
    },
    [dispatch]
  );

  const toggleStatus = useCallback(
    (id: string) => {
      return dispatch(toggleVoucherStatus(id));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearVoucherError());
  }, [dispatch]);

  const clearDetail = useCallback(() => {
    dispatch(clearVoucherDetail());
  }, [dispatch]);

  return {
    vouchers,
    voucherDetail,
    voucherUsage,
    voucherBookings,
    voucherDetailedStats,
    loading,
    error,
    getVouchers,
    getVoucherDetail,
    getVoucherUsage,
    getVoucherBookings,
    getVoucherDetailedStats,
    clearUsage,
    addVoucher,
    editVoucher,
    deleteVoucher,
    restore,
    toggleStatus,
    clearError,
    clearDetail,
  };
};
