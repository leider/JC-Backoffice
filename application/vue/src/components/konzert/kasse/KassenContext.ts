import { createContext, Ref } from "react";

export const KassenContext = createContext<{
  refStartinhalt: Ref<HTMLElement>;
  refEndinhalt: Ref<HTMLElement>;
  refAnBank: Ref<HTMLElement>;
}>({
  refStartinhalt: null,
  refEndinhalt: null,
  refAnBank: null,
});
