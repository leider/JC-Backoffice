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
  return (
    <PageHeader
      title={title}
      extra={buttons}
      footer={[
        hasErrors && (
          <Typography.Title key="errors" level={4} type="danger">
            Du hast noch Fehler!
          </Typography.Title>
        ),
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
