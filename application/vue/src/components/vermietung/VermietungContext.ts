import { createContext } from "react";

export const VermietungContext = createContext<{
  isDirty: boolean;
  hasErrors: boolean;
  resetChanges: () => void;
}>({
  isDirty: false,
  hasErrors: false,
  resetChanges: () => {},
});
