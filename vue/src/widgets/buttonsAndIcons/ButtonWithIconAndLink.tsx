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
  block,
  tooltipTitle,
  text,
  disabled,
  type,
  ghost,
  smallIcon,
  alwaysText = false,
}: {
  to: To;
  icon: IconProps["iconName"];
  color: string;
  block?: boolean;
  tooltipTitle?: string;
  text?: string;
  disabled?: boolean;
  type?: BaseButtonProps["type"];
  ghost?: boolean;
  smallIcon?: boolean;
  alwaysText?: boolean;
}) {
  const { sm } = useBreakpoint();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      <Tooltip title={tooltipTitle} color={color === "#FFF" ? "#333" : color}>
        <Link to={to}>
          <Button
            icon={icon && <IconForSmallBlock size={smallIcon ? 12 : 14} iconName={icon} />}
            type={type || "primary"}
            size={text && !smallIcon ? undefined : "small"}
            disabled={disabled}
            block={block}
            title={text}
            ghost={ghost}
          >
            {(sm || alwaysText) && text && text}
          </Button>
        </Link>
      </Tooltip>
    </ConfigProvider>
  );
}
