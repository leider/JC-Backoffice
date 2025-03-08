import React from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
import { Link, To } from "react-router";
import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { BaseButtonProps } from "antd/es/button/button";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

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
  const { brightText } = useJazzContext();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      <Tooltip color={color === brightText ? "#333" : color} title={tooltipTitle}>
        <Link to={to}>
          <Button
            block={block}
            disabled={disabled}
            ghost={ghost}
            icon={icon && <IconForSmallBlock iconName={icon} size={smallIcon ? 12 : 14} />}
            size={text && !smallIcon ? undefined : "small"}
            title={text}
            type={type || "primary"}
          >
            {(sm || alwaysText) && text && text}
          </Button>
        </Link>
      </Tooltip>
    </ConfigProvider>
  );
}
