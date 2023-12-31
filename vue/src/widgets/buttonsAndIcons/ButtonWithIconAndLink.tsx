import React from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
import { Link, To } from "react-router-dom";
import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { BaseButtonProps } from "antd/es/button/button";

export default function ButtonWithIconAndLink({
  to,
  icon,
  color,
  tooltipTitle,
  text,
  disabled,
  type,
}: {
  to: To;
  icon: IconProps["iconName"];
  color: string;
  tooltipTitle?: string;
  text?: string;
  disabled?: boolean;
  type?: BaseButtonProps["type"];
}) {
  const { sm } = useBreakpoint();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      <Tooltip title={tooltipTitle} color={color}>
        <Link to={to}>
          <Button
            icon={icon && <IconForSmallBlock size={14} iconName={icon} />}
            type={type || "primary"}
            size={text ? undefined : "small"}
            disabled={disabled}
          >
            {sm && text && text}
          </Button>
        </Link>
      </Tooltip>
    </ConfigProvider>
  );
}