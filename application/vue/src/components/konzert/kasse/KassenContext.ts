import { createContext, Ref } from "react";

export const KassenContext = createContext<{
  refStartinhalt: Ref<HTMLElement>;
  refEndinhalt: Ref<HTMLElement>;
  refAusgaben: Ref<HTMLDivElement>;
  refEinnahmen: Ref<HTMLDivElement>;
  refAnBank: Ref<HTMLElement>;
}>({ refStartinhalt: null, refEndinhalt: null, refAusgaben: null, refEinnahmen: null, refAnBank: null });
