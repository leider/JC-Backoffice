import { createContext } from "react";

type JazzGlobals = {
  isDarkMode: boolean;
};

export const GlobalContext = createContext<JazzGlobals>({ isDarkMode: false });
