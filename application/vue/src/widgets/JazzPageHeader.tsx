import * as React from "react";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Breadcrumb, type BreadcrumbProps, ConfigProvider, Tag, theme } from "antd";
import { useGlobalContext } from "../app/GlobalContext.ts";
import { useLocation } from "react-router";
import "./JazzPageHeader.css";
import { ValidateErrorEntity } from "@rc-component/form/lib/interface";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import map from "lodash/map";
import flatMap from "lodash/flatMap";
import uniq from "lodash/uniq";

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
  validateError,
  style,
}: {
  readonly title: string | ReactNode;
  readonly buttons?: ReactNode[];
  readonly firstTag?: ReactNode;
  readonly dateString?: string;
  readonly tags?: ReactNode | ReactNode[];
  readonly breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
  readonly validateError?: ValidateErrorEntity;
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

  const footer = useMemo(() => {
    return [
      firstTag,
      dateString && (
        <b key="datum" style={{ marginRight: 8 }}>
          {dateString}
        </b>
      ),
      tags,
    ];
  }, [dateString, firstTag, tags]);

  const errorAvatar = useMemo(
    () =>
      validateError
        ? {
            icon: <ExclamationCircleOutlined style={{ fontSize: 32 }} />,
            style: { backgroundColor: "var(--ant-color-error)" },
          }
        : undefined,
    [validateError],
  );

  const errorTags = useMemo(() => {
    if (validateError) {
      const uniqErrors = uniq(flatMap(validateError.errorFields, "errors"));
      return map(uniqErrors, (error) => (
        <Tag color="error" icon={<ExclamationCircleOutlined />} key="errorTag" variant="solid">
          {error}
        </Tag>
      ));
    }
    return [];
  }, [validateError]);

  return (
    <ConfigProvider theme={{ components: { Tag: { algorithm: isDarkMode ? theme.darkAlgorithm : undefined } } }}>
      <PageHeader
        avatar={errorAvatar}
        breadcrumb={breadcrumb ? breadcrumb : undefined}
        extra={buttons}
        footer={footer}
        style={{
          ...style,
          paddingInline: 4,
          borderBottomColor: validateError ? "var(--ant-color-error)" : "none",
          borderBottomWidth: validateError ? "var(--ant-line-width)" : "0",
          borderBottomStyle: validateError ? "inset" : "none",
        }}
        subTitle={<SubTitle isCopy={isCopy} isNew={isNew} />}
        tags={errorTags}
        title={<span style={style}>{title}</span>}
      >
        {children}
      </PageHeader>
    </ConfigProvider>
  );
}
