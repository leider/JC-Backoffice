import { createContext } from "react";

type JazzGlobals = {
  isDarkMode: boolean;
  isCompactMode: boolean;
};
export const GlobalContext = createContext<JazzGlobals>({ isDarkMode: false, isCompactMode: false });
