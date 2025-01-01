import * as React from "react";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { theme } from "antd";

export function JazzPageHeader({
  title,
  children,
  buttons,
  firstTag,
  dateString,
  tags,
  breadcrumb,
  hasErrors,
}: {
  title: string | ReactNode;
  buttons?: ReactNode[];
  firstTag?: ReactNode;
  dateString?: string;
  tags?: ReactNode[];
  breadcrumb?: ReactElement;
  hasErrors?: boolean;
} & PropsWithChildren) {
  const { token } = theme.useToken();
  const errorTitle = <span style={{ color: token.colorError }}>Du hast noch Fehler!</span>;

  return (
    <PageHeader
      title={hasErrors ? errorTitle : title}
      extra={buttons}
      footer={[
        firstTag && firstTag,
        dateString && (
          <b key="datum" style={{ marginRight: 8 }}>
            {dateString}
          </b>
        ),
        tags && tags,
      ]}
      breadcrumb={breadcrumb ? breadcrumb : undefined}
    >
      {children}
    </PageHeader>
  );
}
