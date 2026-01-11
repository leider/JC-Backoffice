import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import React from "react";
import { NamePath } from "antd/es/form/interface";

export type JazzColumn = {
  editable?: boolean;
  dataIndex: NamePath;
  title: React.ReactNode;
  type?: ColType;
  required?: boolean;
  dropdownchoices?: string[];
  presets?: boolean;
  usersWithKann?: UserWithKann[];
  width?: string;
  initialValue?: number | string;
  min?: number | string;
  pattern?: RegExp;
  uniqueValues?: boolean;
  multiline?: boolean;
  align?: "end" | "center" | "start";
};

export type ColType = "color" | "user" | "date" | "startEnd" | "text" | "integer" | "twoDecimals" | "boolean";
