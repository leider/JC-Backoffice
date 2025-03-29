import * as React from "react";
import { PropsWithChildren, ReactNode, useContext, useMemo } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Breadcrumb, type BreadcrumbProps, ConfigProvider, theme, Typography } from "antd";
import { GlobalContext } from "../app/GlobalContext.ts";
import { useLocation } from "react-router";

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
  readonly tags?: ReactNode | ReactNode[];
  readonly breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
  readonly hasErrors?: boolean;
  readonly style?: React.CSSProperties;
} & PropsWithChildren) {
  const { isDarkMode } = useContext(GlobalContext);
  const { pathname } = useLocation();
  const isCopy = useMemo(() => {
    return pathname.includes("/copy-of-");
  }, [pathname]);
  const isNew = useMemo(() => {
    return pathname.includes("/new");
  }, [pathname]);

  const subTitle = useMemo(
    () => (
      <b style={{ fontSize: "var(--ant-font-size-xl)" }}>
        {`${isNew ? " (Neu)" : ""}${isCopy ? " (Kopie)" : ""}`}
        {hasErrors ? <Typography.Text type="danger"> Du hast noch Fehler!</Typography.Text> : null}
      </b>
    ),
    [hasErrors, isCopy, isNew],
  );

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
        subTitle={subTitle}
        title={<span style={style}>{title}</span>}
      >
        {children}
      </PageHeader>
    </ConfigProvider>
  );
}
