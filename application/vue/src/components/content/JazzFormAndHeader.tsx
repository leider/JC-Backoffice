import * as React from "react";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { Form } from "antd";
import JazzFormAndHeaderExtended from "@/components/content/JazzFormAndHeaderExtended.tsx";

export default function JazzFormAndHeader<T>({
  title,
  data,
  saveForm,
  additionalButtons,
  changedPropsToWatch,
  children,
  resetChanges,
  breadcrumb,
}: PropsWithChildren<{
  title: string;
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  additionalButtons?: ReactNode[];
  changedPropsToWatch?: string[];
  resetChanges?: () => void;
  breadcrumb?: ReactElement;
}>) {
  const [form] = Form.useForm<T>();

  return (
    <JazzFormAndHeaderExtended
      title={title}
      data={data}
      saveForm={saveForm}
      form={form}
      additionalButtons={additionalButtons}
      changedPropsToWatch={changedPropsToWatch}
      resetChanges={resetChanges}
      breadcrumb={breadcrumb}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
