import * as React from "react";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import { Avatar, ConfigProvider, Flex, Tag, theme, Typography } from "antd";
import { useGlobalContext } from "../app/GlobalContext.ts";
import { useLocation } from "react-router";
import "./JazzPageHeader.css";
import { ValidateErrorEntity } from "@rc-component/form/lib/interface";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
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
  validateError,
  style,
}: {
  readonly title: string | ReactNode;
  readonly buttons?: ReactNode[];
  readonly firstTag?: ReactNode;
  readonly dateString?: string;
  readonly tags?: ReactNode | ReactNode[];
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
      <Flex
        style={{
          ...style,
          marginTop: 12,
          paddingInline: 4,
          borderBottomColor: validateError ? "var(--ant-color-error)" : "none",
          borderBottomWidth: validateError ? "var(--ant-line-width)" : "0",
          borderBottomStyle: validateError ? "inset" : "none",
        }}
        vertical
      >
        <Flex justify="space-between" wrap>
          <Flex align="center" gap={12} justify="flex-start">
            {errorAvatar ? <Avatar {...errorAvatar} /> : null}
            <Typography.Title level={1} style={{ margin: "0px 12px 0px 0px" }}>
              <span style={style}>{title}</span>
            </Typography.Title>
            <SubTitle isCopy={isCopy} isNew={isNew} />
            {errorTags ? errorTags : null}
          </Flex>
          <span>
            <div className="ant-space-gap-row-small ant-space-gap-col-small" style={{ display: "inline-flex", whiteSpace: "unset" }}>
              {buttons}
            </div>
          </span>
        </Flex>
        <div style={{ marginBlockStart: 16, padding: 4 }}>
          <Flex justify="flex-start" wrap>
            {footer}
          </Flex>
        </div>
      </Flex>
      {children}
    </ConfigProvider>
  );
}
