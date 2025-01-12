import { createContext } from "react";
import noop from "lodash/noop";

export const KonzertContext = createContext<{
  isKasseHelpOpen: boolean;
  setKasseHelpOpen: (open: boolean) => void;
}>({
  isKasseHelpOpen: false,
  setKasseHelpOpen: noop,
});
