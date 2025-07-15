import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  fetchHouseRules,
  fetchHouseRuleDetail,
  createHouseRule,
  updateHouseRule,
  removeHouseRule,
  restoreHouseRule,
  toggleHouseRuleStatus,
  toggleHouseRuleDefault,
  clearHouseRuleError,
  clearHouseRuleDetail,
} from "@/store/slices/houseRuleSlice";
import { CreateHouseRuleDto, UpdateHouseRuleDto, HouseRule } from "@/types/house-rule";

interface HouseRuleReduxState {
  houseRules: HouseRule[];
  houseRuleDetail: HouseRule | null;
  loading: boolean;
  error: string | null;
}

export const useHouseRules = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();
  const houseRuleState = useSelector(
    (state: RootState) => (state as unknown as { houseRule?: HouseRuleReduxState; houseRules?: HouseRuleReduxState }).houseRule ||
      (state as unknown as { houseRule?: HouseRuleReduxState; houseRules?: HouseRuleReduxState }).houseRules
  ) as HouseRuleReduxState;
  const { houseRules, houseRuleDetail, loading, error } = houseRuleState;

  return {
    houseRules,
    houseRuleDetail,
    loading,
    error,
    fetchHouseRules: (params: Record<string, unknown> = {}) => dispatch(fetchHouseRules(params)),
    fetchHouseRuleDetail: (id: string) => dispatch(fetchHouseRuleDetail(id)),
    createHouseRule: (dto: CreateHouseRuleDto) => dispatch(createHouseRule(dto)),
    updateHouseRule: (id: string, dto: UpdateHouseRuleDto) => dispatch(updateHouseRule({ id, dto })),
    removeHouseRule: (id: string) => dispatch(removeHouseRule(id)),
    restoreHouseRule: (id: string) => dispatch(restoreHouseRule(id)),
    toggleHouseRuleStatus: (id: string) => dispatch(toggleHouseRuleStatus(id)),
    toggleHouseRuleDefault: (id: string) => dispatch(toggleHouseRuleDefault(id)),
    clearHouseRuleError: () => dispatch(clearHouseRuleError()),
    clearHouseRuleDetail: () => dispatch(clearHouseRuleDetail()),
  };
}; 