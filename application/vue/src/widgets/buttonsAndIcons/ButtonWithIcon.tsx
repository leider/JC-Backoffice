import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import React, { CSSProperties, forwardRef } from "react";
import { Button, ConfigProvider, theme, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import { SizeType } from "antd/es/config-provider/SizeContext";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TooltipPlacement } from "antd/es/tooltip";

const ButtonWithIcon = forwardRef(function (
  {
    icon,
    onClick,
    text,
    type,
    disabled,
    tooltipTitle,
    tooltipPlacement,
    color,
    size,
    block,
    loading,
    style,
    testid,
    alwaysText = false,
  }: {
    icon?: IconProps["iconName"];
    text?: string;
    type?: BaseButtonProps["type"];
    onClick?: (() => void) | "submit";
    disabled?: boolean;
    tooltipTitle?: string;
    tooltipPlacement?: TooltipPlacement;
    color?: string;
    size?: SizeType;
    block?: boolean;
    loading?: boolean;
    style?: CSSProperties;
    testid?: string;
    alwaysText?: boolean;
  },
  ref: any, // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const token = theme.useToken().token;

  const { sm } = useBreakpoint();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color || token.colorPrimary } }}>
      <Tooltip title={tooltipTitle} color={color} placement={tooltipPlacement || "top"}>
        <Button
          ref={ref}
          icon={icon && <IconForSmallBlock size={size === "small" ? 14 : 16} iconName={icon} />}
          type={type || "primary"}
          onClick={onClick && onClick !== "submit" ? onClick : undefined}
          disabled={disabled}
          htmlType={onClick === "submit" ? "submit" : undefined}
          size={size}
          block={block}
          title={text}
          loading={loading}
          style={style}
          data-testid={testid}
        >
          {(sm || alwaysText) && text && text}
        </Button>
      </Tooltip>
    </ConfigProvider>
  );
});
export default ButtonWithIcon;
