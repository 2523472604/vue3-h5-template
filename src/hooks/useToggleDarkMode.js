import { storeToRefs } from "pinia";
import { useDarkModeStoreHook } from "@/store/modules/darkMode";

/** 响应式暗黑模式状态 */
export function useDarkMode() {
  const { darkMode } = storeToRefs(useDarkModeStoreHook());
  return darkMode;
}

export function useToggleDarkMode() {
  useDarkModeStoreHook().toggleDarkMode();
}
