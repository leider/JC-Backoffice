import * as React from "react";
import { PropsWithChildren, ReactElement, ReactNode, useMemo } from "react";
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
  style,
}: {
  title: string | ReactNode;
  buttons?: ReactNode[];
  firstTag?: ReactNode;
  dateString?: string;
  tags?: ReactNode[];
  breadcrumb?: ReactElement;
  hasErrors?: boolean;
  style?: React.CSSProperties;
} & PropsWithChildren) {
  const { token } = theme.useToken();

  const theHeader = useMemo(() => {
    return hasErrors ? <span style={{ color: token.colorError }}>Du hast noch Fehler!</span> : <span style={style}>{title}</span>;
  }, [hasErrors, style, title, token.colorError]);

  return (
    <PageHeader
      title={theHeader}
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
      style={style}
    >
      {children}
    </PageHeader>
  );
}
