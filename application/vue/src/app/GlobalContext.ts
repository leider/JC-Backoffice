import { createContext, useContext } from "react";

type JazzGlobals = {
  isDarkMode: boolean;
  isCompactMode: boolean;
  viewport: { width: number; height: number };
  isTouch: boolean;
};

export const DefaultGlobalContext = { isDarkMode: false, isCompactMode: false, viewport: { width: 0, height: 0 }, isTouch: false };
export const GlobalContext = createContext<JazzGlobals>(DefaultGlobalContext);

export function useGlobalContext(): JazzGlobals {
  return useContext(GlobalContext);
}
