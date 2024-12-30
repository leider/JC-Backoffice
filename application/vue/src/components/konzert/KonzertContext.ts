import { createContext } from "react";

export const KonzertContext = createContext<{
  isKasseHelpOpen: boolean;
  setKasseHelpOpen: (open: boolean) => void;
  resetChanges: () => void;
}>({
  isKasseHelpOpen: false,
  resetChanges: () => {},
  setKasseHelpOpen: () => {},
});
