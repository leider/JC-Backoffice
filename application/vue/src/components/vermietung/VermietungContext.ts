import { createContext } from "react";
import { FormInstance } from "antd";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export const VermietungContext = createContext<{ form: FormInstance<Vermietung>; isDirty: boolean } | null>(null);
