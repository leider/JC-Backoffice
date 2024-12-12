import { createContext } from "react";
import { FormInstance } from "antd";
import Konzert from "jc-shared/konzert/konzert.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";

export const KonzertContext = createContext<{
  form: FormInstance<Konzert & { riderBoxes?: BoxParams[]; endbestandEUR?: number }>;
  isDirty: boolean;
  isKasseHelpOpen: boolean;
  setKasseHelpOpen: (open: boolean) => void;
  resetChanges: () => void;
}>({
  form: {} as FormInstance<Konzert & { riderBoxes?: BoxParams[]; endbestandEUR?: number }>,
  isDirty: false,
  isKasseHelpOpen: false,
  resetChanges: () => {},
  setKasseHelpOpen: () => {},
});
