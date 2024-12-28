import { createContext } from "react";

export const KonzertContext = createContext<{
  isDirty: boolean;
  hasErrors: boolean;
  isKasseHelpOpen: boolean;
  setKasseHelpOpen: (open: boolean) => void;
  resetChanges: () => void;
}>({
  isDirty: false,
  hasErrors: false,
  isKasseHelpOpen: false,
  resetChanges: () => {},
  setKasseHelpOpen: () => {},
});
