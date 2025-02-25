import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
} from "react";
import type {
  GetAppearanceResponseSchema,
  GetSettingsResponseSchema,
} from "../../../ipc/schema/main";
import type { useStorage } from "../hooks/storage";

export type Store = {
  isDarkMode: {
    value: boolean;
    setValue: Dispatch<SetStateAction<boolean>>;
  };
  appearance: {
    value: GetAppearanceResponseSchema;
    setValue: Dispatch<SetStateAction<GetAppearanceResponseSchema>>;
  };
  settings: {
    value: GetSettingsResponseSchema;
    setValue: Dispatch<SetStateAction<GetSettingsResponseSchema>>;
  };
  storage: ReturnType<typeof useStorage>;
};

export const StoreContext = createContext({} as Store);

export function useStore() {
  return useContext(StoreContext);
}
