import { createContext, Ref } from "react";

export const KassenContext = createContext<{
  refStartinhalt: Ref<HTMLButtonElement>;
  refEndinhalt: Ref<HTMLButtonElement>;
  refAusgaben: Ref<HTMLDivElement>;
  refEinnahmen: Ref<HTMLDivElement>;
  refAnBank: Ref<HTMLButtonElement>;
}>({ refStartinhalt: null, refEndinhalt: null, refAusgaben: null, refEinnahmen: null, refAnBank: null });
