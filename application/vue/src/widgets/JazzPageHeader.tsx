import * as React from "react";
import { PropsWithChildren, ReactNode, useContext, useMemo } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Breadcrumb, type BreadcrumbProps, ConfigProvider, theme } from "antd";
import { GlobalContext } from "../app/GlobalContext.ts";

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
  breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
  hasErrors?: boolean;
  style?: React.CSSProperties;
} & PropsWithChildren) {
  const { isDarkMode } = useContext(GlobalContext);
  const { token } = theme.useToken();

  const theHeader = useMemo(() => {
    return hasErrors ? <span style={{ color: token.colorError }}>Du hast noch Fehler!</span> : <span style={style}>{title}</span>;
  }, [hasErrors, style, title, token.colorError]);

  return (
    <ConfigProvider theme={{ components: { Tag: { algorithm: isDarkMode ? theme.darkAlgorithm : undefined } } }}>
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
        style={{ ...style, paddingInline: 4 }}
      >
        {children}
      </PageHeader>
    </ConfigProvider>
  );
}
