import { createContext } from "react";

export const VermietungContext = createContext<{
  resetChanges: () => void;
}>({
  resetChanges: () => {},
});
