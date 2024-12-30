import { createContext } from "react";

export const KonzertContext = createContext<{
  isKasseHelpOpen: boolean;
  setKasseHelpOpen: (open: boolean) => void;
}>({
  isKasseHelpOpen: false,
  setKasseHelpOpen: () => {},
});
