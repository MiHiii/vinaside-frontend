import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchSafetyFeatures,
  fetchSafetyFeatureDetail,
  createSafetyFeature,
  updateSafetyFeature,
  removeSafetyFeature,
  restoreSafetyFeature,
  toggleSafetyFeatureStatus,
  toggleSafetyFeatureDefault,
  clearSafetyFeatureError,
  clearSafetyFeatureDetail,
} from "@/store/slices/safetyFeatureSlice";
import { useCallback } from "react";
import { CreateSafetyFeatureDto, UpdateSafetyFeatureDto } from "@/types/safety-feature";

export const useSafetyFeatures = () => {
  const dispatch = useAppDispatch();
  const { safetyFeatures, safetyFeatureDetail, loading, error } = useAppSelector((state) => state.safetyFeature);

  const getSafetyFeatures = useCallback((params?: Record<string, unknown>) => {
    dispatch(fetchSafetyFeatures(params ?? {}));
  }, [dispatch]);

  const getSafetyFeatureDetail = useCallback((id: string) => {
    dispatch(fetchSafetyFeatureDetail(id));
  }, [dispatch]);

  const addSafetyFeature = useCallback((dto: CreateSafetyFeatureDto) => {
    return dispatch(createSafetyFeature(dto));
  }, [dispatch]);

  const editSafetyFeature = useCallback((id: string, dto: UpdateSafetyFeatureDto) => {
    return dispatch(updateSafetyFeature({ id, dto }));
  }, [dispatch]);

  const deleteSafetyFeature = useCallback((id: string) => {
    return dispatch(removeSafetyFeature(id));
  }, [dispatch]);

  const restore = useCallback((id: string) => {
    return dispatch(restoreSafetyFeature(id));
  }, [dispatch]);

  const toggleStatus = useCallback((id: string) => {
    return dispatch(toggleSafetyFeatureStatus(id));
  }, [dispatch]);

  const toggleDefault = useCallback((id: string) => {
    return dispatch(toggleSafetyFeatureDefault(id));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSafetyFeatureError());
  }, [dispatch]);

  const clearDetail = useCallback(() => {
    dispatch(clearSafetyFeatureDetail());
  }, [dispatch]);

  return {
    safetyFeatures,
    safetyFeatureDetail,
    loading,
    error,
    getSafetyFeatures,
    getSafetyFeatureDetail,
    addSafetyFeature,
    editSafetyFeature,
    deleteSafetyFeature,
    restore,
    toggleStatus,
    toggleDefault,
    clearError,
    clearDetail,
  };
}; 