import { AppDispatch, RootState } from "@/store";
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector } from "react-redux";

export const useAppDispatch = (): AppDispatch => useReduxDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;