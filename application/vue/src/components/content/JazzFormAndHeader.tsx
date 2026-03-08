import * as React from "react";
import { PropsWithChildren, ReactNode } from "react";
import { Form } from "antd";
import JazzFormAndHeaderExtended from "@/components/content/JazzFormAndHeaderExtended.tsx";

export default function JazzFormAndHeader<T>({
  title,
  data,
  saveForm,
  additionalButtons,
  children,
  resetChanges,
}: PropsWithChildren<{
  readonly title: string;
  readonly data?: Partial<T>;
  readonly saveForm: (vals: T) => void;
  readonly additionalButtons?: ReactNode[];
  readonly resetChanges?: () => Promise<unknown>;
}>) {
  const [form] = Form.useForm<T>();

  return (
    <JazzFormAndHeaderExtended
      additionalButtons={additionalButtons}
      data={data}
      form={form}
      resetChanges={resetChanges}
      saveForm={saveForm}
      title={title}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
