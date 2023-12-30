import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import React from "react";
import { Button, ConfigProvider, theme, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import { SizeType } from "antd/es/config-provider/SizeContext";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TooltipPlacement } from "antd/es/tooltip";

export default function ButtonWithIcon({
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
}) {
  const { useToken } = theme;
  const token = useToken().token;

  const { sm } = useBreakpoint();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color || token.colorPrimary } }}>
      <Tooltip title={tooltipTitle} color={color} placement={tooltipPlacement || "top"}>
        <Button
          icon={icon && <IconForSmallBlock size={size === "small" ? 14 : 16} iconName={icon} />}
          type={type || "primary"}
          onClick={onClick && onClick !== "submit" ? onClick : undefined}
          disabled={disabled}
          htmlType={onClick === "submit" ? "submit" : undefined}
          size={size}
          block={block}
          title={!sm && text ? text : undefined}
          loading={loading}
        >
          {sm && text && text}
        </Button>
      </Tooltip>
    </ConfigProvider>
  );
}
