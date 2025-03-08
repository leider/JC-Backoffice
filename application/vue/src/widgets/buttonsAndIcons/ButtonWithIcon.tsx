import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import React, { CSSProperties, forwardRef } from "react";
import { Button, ConfigProvider, theme, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import { SizeType } from "antd/es/config-provider/SizeContext";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TooltipPlacement } from "antd/es/tooltip";
import tinycolor from "tinycolor2";

type ButtonWithIconProps = {
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
};

const ButtonWithIcon = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonWithIconProps>(function ButtonWithIcon(
  { icon, onClick, text, type, disabled, tooltipTitle, tooltipPlacement, color, size, block, loading, style, testid, alwaysText = false },
  ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>,
) {
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
