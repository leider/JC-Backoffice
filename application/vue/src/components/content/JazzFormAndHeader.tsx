import * as React from "react";
import { PropsWithChildren, ReactNode } from "react";
import { Breadcrumb, type BreadcrumbProps, Form } from "antd";
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
  resetChanges?: () => Promise<unknown>;
  breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
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
