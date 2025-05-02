import React, { useContext } from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
import { Link, To } from "react-router";
import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { BaseButtonProps } from "antd/es/button/button";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { GlobalContext } from "@/app/GlobalContext.ts";

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
  readonly to: To;
  readonly icon: IconProps["iconName"];
  readonly color: string;
  readonly block?: boolean;
  readonly tooltipTitle?: string;
  readonly text?: string;
  readonly disabled?: boolean;
  readonly type?: BaseButtonProps["type"];
  readonly ghost?: boolean;
  readonly smallIcon?: boolean;
  readonly alwaysText?: boolean;
}) {
  const { isTouch } = useContext(GlobalContext);
  const { sm } = useBreakpoint();
  const { brightText } = useJazzContext();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      <Tooltip color={color === brightText ? "#333" : color} title={isTouch ? null : tooltipTitle}>
        <Link to={to}>
          <Button
            block={block}
            disabled={disabled}
            ghost={ghost}
            icon={icon ? <IconForSmallBlock iconName={icon} size={smallIcon ? 12 : 14} /> : null}
            size={text && !smallIcon ? undefined : "small"}
            style={ghost ? { color, borderColor: color } : undefined}
            title={text}
            type={type || "primary"}
          >
            {(sm || alwaysText) && text ? text : null}
          </Button>
        </Link>
      </Tooltip>
    </ConfigProvider>
  );
}
