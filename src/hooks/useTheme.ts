import { useAppSelector } from "./useRedux";

export function useThememode(){
  return useAppSelector((state) => state.theme.mode);
}