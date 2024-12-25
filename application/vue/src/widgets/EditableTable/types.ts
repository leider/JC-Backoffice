import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import React from "react";
import { NamePath } from "rc-field-form/es/interface";

export type Columns = {
  editable?: boolean;
  dataIndex: NamePath;
  title: React.ReactNode;
  type?: ColType;
  required?: boolean;
  filters?: string[];
  presets?: boolean;
  usersWithKann?: UserWithKann[];
  width?: string;
  initialValue?: number | string;
  min?: number | string;
  pattern?: RegExp;
  uniqueValues?: boolean;
};

export type ColType = "color" | "user" | "date" | "startEnd" | "text" | "integer" | "boolean";
