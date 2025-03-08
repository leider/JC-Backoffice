import { createContext } from "react";

type JazzGlobals = {
  isDarkMode: boolean;
  isCompactMode: boolean;
};

export const DefaultGlobalContext = { isDarkMode: false, isCompactMode: false };
export const GlobalContext = createContext<JazzGlobals>(DefaultGlobalContext);
