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
  readonly title: string | ReactNode;
  readonly buttons?: ReactNode[];
  readonly firstTag?: ReactNode;
  readonly dateString?: string;
  readonly tags?: ReactNode[];
  readonly breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
  readonly hasErrors?: boolean;
  readonly style?: React.CSSProperties;
} & PropsWithChildren) {
  const { isDarkMode } = useContext(GlobalContext);
  const { token } = theme.useToken();

  const theHeader = useMemo(() => {
    return hasErrors ? <span style={{ color: token.colorError }}>Du hast noch Fehler!</span> : <span style={style}>{title}</span>;
  }, [hasErrors, style, title, token.colorError]);

  return (
    <ConfigProvider theme={{ components: { Tag: { algorithm: isDarkMode ? theme.darkAlgorithm : undefined } } }}>
      <PageHeader
        breadcrumb={breadcrumb ? breadcrumb : undefined}
        extra={buttons}
        footer={[
          firstTag,
          dateString && (
            <b key="datum" style={{ marginRight: 8 }}>
              {dateString}
            </b>
          ),
          tags,
        ]}
        style={{ ...style, paddingInline: 4 }}
        title={theHeader}
      >
        {children}
      </PageHeader>
    </ConfigProvider>
  );
}
