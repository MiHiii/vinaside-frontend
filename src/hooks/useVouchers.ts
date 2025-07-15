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
} from "@/store/slices/voucherSlice";
import { useCallback } from "react";
import { CreateVoucherDto, UpdateVoucherDto } from "@/types/voucher";

export const useVouchers = () => {
  const dispatch = useAppDispatch();
  const { vouchers, voucherDetail, loading, error } = useAppSelector((state) => state.voucher);

  // Các hàm CRUD
  const getVouchers = useCallback((params?: Record<string, unknown>) => {
    dispatch(fetchVouchers(params ?? {}));
  }, [dispatch]);

  const getVoucherDetail = useCallback((id: string) => {
    dispatch(fetchVoucherDetail(id));
  }, [dispatch]);

  const addVoucher = useCallback((dto: CreateVoucherDto) => {
    return dispatch(createVoucher(dto));
  }, [dispatch]);

  const editVoucher = useCallback((id: string, dto: UpdateVoucherDto) => {
    return dispatch(updateVoucher({ id, dto }));
  }, [dispatch]);

  const deleteVoucher = useCallback((id: string) => {
    return dispatch(removeVoucher(id));
  }, [dispatch]);

  const restore = useCallback((id: string) => {
    return dispatch(restoreVoucher(id));
  }, [dispatch]);

  const toggleStatus = useCallback((id: string) => {
    return dispatch(toggleVoucherStatus(id));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearVoucherError());
  }, [dispatch]);

  const clearDetail = useCallback(() => {
    dispatch(clearVoucherDetail());
  }, [dispatch]);

  return {
    vouchers,
    voucherDetail,
    loading,
    error,
    getVouchers,
    getVoucherDetail,
    addVoucher,
    editVoucher,
    deleteVoucher,
    restore,
    toggleStatus,
    clearError,
    clearDetail,
  };
}; 