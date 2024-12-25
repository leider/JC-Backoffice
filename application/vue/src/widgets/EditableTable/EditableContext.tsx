import { Form, GetRef } from "antd";
import React from "react";

type FormInstance<T> = GetRef<typeof Form<T>>;

export const EditableContext = React.createContext<FormInstance<unknown> | null>(null);
