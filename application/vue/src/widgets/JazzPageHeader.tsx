import * as React from "react";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Alert, Breadcrumb, type BreadcrumbProps, ConfigProvider, theme } from "antd";
import { useGlobalContext } from "../app/GlobalContext.ts";
import { useLocation } from "react-router";
import "./JazzPageHeader.css";

function SubTitle({ isCopy, isNew }: { readonly isNew: boolean; readonly isCopy: boolean }) {
  return <b style={{ fontSize: "var(--ant-font-size-xl)" }}>{`${isNew ? " (Neu)" : ""}${isCopy ? " (Kopie)" : ""}`}</b>;
}

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
  const { isDarkMode } = useGlobalContext();
  const { pathname } = useLocation();
  const isCopy = useMemo(() => {
    return pathname.includes("/copy-of-");
  }, [pathname]);
  const isNew = useMemo(() => {
    return pathname.includes("/new");
  }, [pathname]);

  return (
    <ConfigProvider theme={{ components: { Tag: { algorithm: isDarkMode ? theme.darkAlgorithm : undefined } } }}>
      {hasErrors ? (
        <ConfigProvider theme={{ components: { Alert: { defaultPadding: "20px 10px 10px 10px" } } }}>
          <Alert banner message="Du hast noch Fehler!" type="error" />
        </ConfigProvider>
      ) : null}
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
        subTitle={<SubTitle isCopy={isCopy} isNew={isNew} />}
        title={<span style={style}>{title}</span>}
      >
        {children}
      </PageHeader>
    </ConfigProvider>
  );
}
