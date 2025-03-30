import { createContext } from "react";
import noop from "lodash/noop";

export const KonzertContext = createContext<{
  isKasseHelpOpen: boolean;
  setKasseHelpOpen: (open: boolean) => void;
  agenturauswahl: string;
  setAgenturauswahl: (auswahl: string) => void;
  hotelauswahl: string;
  setHotelauswahl: (auswahl: string) => void;
  hotelpreiseAlsDefault: boolean;
  setHotelpreiseAlsDefault: (open: boolean) => void;
}>({
  isKasseHelpOpen: false,
  setKasseHelpOpen: noop,
  agenturauswahl: "",
  hotelauswahl: "",
  hotelpreiseAlsDefault: false,
  setHotelauswahl: noop,
  setAgenturauswahl: noop,
  setHotelpreiseAlsDefault: noop,
});
