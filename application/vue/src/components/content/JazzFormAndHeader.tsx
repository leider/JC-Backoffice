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
  readonly title: string;
  readonly data?: Partial<T>;
  readonly saveForm: (vals: T) => void;
  readonly additionalButtons?: ReactNode[];
  readonly changedPropsToWatch?: string[];
  readonly resetChanges?: () => Promise<unknown>;
  readonly breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
}>) {
  const [form] = Form.useForm<T>();

  return (
    <JazzFormAndHeaderExtended
      additionalButtons={additionalButtons}
      breadcrumb={breadcrumb}
      changedPropsToWatch={changedPropsToWatch}
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
