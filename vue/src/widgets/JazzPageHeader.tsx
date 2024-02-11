import * as React from "react";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { PageHeader } from "@ant-design/pro-layout";

export function JazzPageHeader({
  title,
  children,
  buttons,
  firstTag,
  dateString,
  tags,
  breadcrumb,
}: {
  title: string | ReactNode;
  buttons?: ReactNode[];
  firstTag?: ReactNode;
  dateString?: string;
  tags?: ReactNode[];
  breadcrumb?: ReactElement;
} & PropsWithChildren) {
  return (
    <PageHeader
      title={title}
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
