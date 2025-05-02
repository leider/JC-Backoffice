import { createContext } from "react";

type JazzGlobals = {
  isDarkMode: boolean;
  isCompactMode: boolean;
  viewport: { width: number; height: number };
};

export const DefaultGlobalContext = { isDarkMode: false, isCompactMode: false, viewport: { width: 0, height: 0 } };
export const GlobalContext = createContext<JazzGlobals>(DefaultGlobalContext);
