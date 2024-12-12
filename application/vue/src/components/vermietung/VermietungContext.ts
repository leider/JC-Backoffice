import { createContext } from "react";
import { FormInstance } from "antd";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export const VermietungContext = createContext<{ form: FormInstance<Vermietung>; isDirty: boolean; resetChanges: () => void }>({
  form: {} as FormInstance<Vermietung>,
  isDirty: false,
  resetChanges: () => {},
});
