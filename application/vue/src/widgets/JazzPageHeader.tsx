import * as React from "react";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Typography } from "antd";

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
  const errorTitle = (
    <Typography.Title key="errors" type="danger">
      Du hast noch Fehler!
    </Typography.Title>
  );

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
