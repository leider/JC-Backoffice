import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import React, { CSSProperties, forwardRef, useContext } from "react";
import { Button, ConfigProvider, theme, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import { SizeType } from "antd/es/config-provider/SizeContext";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TooltipPlacement } from "antd/es/tooltip";
import tinycolor from "tinycolor2";
import { GlobalContext } from "@/app/GlobalContext.ts";

type ButtonWithIconProps = {
  readonly icon?: IconProps["iconName"];
  readonly text?: string;
  readonly type?: BaseButtonProps["type"];
  readonly onClick?: (() => void) | "submit";
  readonly disabled?: boolean;
  readonly tooltipTitle?: string;
  readonly tooltipPlacement?: TooltipPlacement;
  readonly color?: string;
  readonly size?: SizeType;
  readonly block?: boolean;
  readonly loading?: boolean;
  readonly style?: CSSProperties;
  readonly testid?: string;
  readonly alwaysText?: boolean;
};

const ButtonWithIcon = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonWithIconProps>(function ButtonWithIcon(
  { icon, onClick, text, type, disabled, tooltipTitle, tooltipPlacement, color, size, block, loading, style, testid, alwaysText = false },
  ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>,
) {
  const { isTouch } = useContext(GlobalContext);
  const token = theme.useToken().token;

  const { sm } = useBreakpoint();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: color ?? token.colorPrimary,
          colorText: color ?? token.colorText,
          colorTextDisabled: color ? tinycolor(color).brighten(20).desaturate(30).toHexString() : token.colorTextTertiary,
        },
      }}
    >
      <Tooltip color={color} placement={tooltipPlacement || "top"} title={isTouch ? null : tooltipTitle}>
        <Button
          block={block}
          data-testid={testid}
          disabled={disabled}
          htmlType={onClick === "submit" ? "submit" : undefined}
          icon={icon ? <IconForSmallBlock iconName={icon} size={size === "small" ? 14 : 16} /> : null}
          loading={loading}
          onClick={onClick && onClick !== "submit" ? onClick : undefined}
          ref={ref}
          size={size}
          style={style}
          title={text}
          type={type || "primary"}
        >
          {(sm || alwaysText) && text ? text : null}
        </Button>
      </Tooltip>
    </ConfigProvider>
  );
});
export default ButtonWithIcon;
