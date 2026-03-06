import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import React, { CSSProperties, forwardRef, MouseEvent, useCallback, useState } from "react";
import { Button, ConfigProvider, theme, Tooltip } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TooltipPlacement } from "antd/es/tooltip";
import tinycolor from "tinycolor2";
import { useGlobalContext } from "../../app/GlobalContext.ts";
import { BaseButtonProps } from "antd/es/button/Button";

type ButtonWithIconProps = {
  readonly icon?: IconProps["iconName"];
  readonly text?: string;
  readonly type?: BaseButtonProps["type"];
  readonly onClick?: (() => void) | "submit";
  readonly disabled?: boolean;
  readonly color?: string;
  readonly size?: SizeType;
  readonly block?: boolean;
  readonly loading?: boolean;
  readonly style?: CSSProperties;
  readonly testid?: string;
  readonly alwaysText?: boolean;
};

type TooltipAspectProps = {
  readonly tooltipTitle?: string;
  readonly tooltipPlacement?: TooltipPlacement;
};

// 1) Pure button (no theming, no tooltip)
const PureButtonCore = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonWithIconProps & { readonly onMouseEnter?: React.MouseEventHandler; readonly onMouseLeave?: React.MouseEventHandler }
>(function PureButtonCore(
  { icon, onClick, text, type, disabled, size, block, loading, style, testid, alwaysText = false, onMouseEnter, onMouseLeave },
  ref,
) {
  const { sm } = useBreakpoint();

  const clickCallback = useCallback(
    (e: MouseEvent) => {
      if (!onClick || onClick === "submit") {
        return undefined;
      }
      if (e.detail !== 1) {
        return undefined;
      }
      return onClick();
    },
    [onClick],
  );

  return (
    <Button
      block={block}
      data-testid={testid}
      disabled={disabled}
      htmlType={onClick === "submit" ? "submit" : undefined}
      icon={icon ? <IconForSmallBlock iconName={icon} size={size === "small" ? 14 : 16} /> : null}
      loading={loading}
      onClick={clickCallback}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={ref}
      size={size}
      style={style}
      title={text}
      type={type || "primary"}
    >
      {(sm || alwaysText) && text ? text : null}
    </Button>
  );
});

// 2) Theme aspect (separate, reusable)
function withTheme(
  Component: React.ForwardRefExoticComponent<
    ButtonWithIconProps &
      React.RefAttributes<HTMLButtonElement | HTMLAnchorElement> & {
        onMouseEnter?: React.MouseEventHandler;
        onMouseLeave?: React.MouseEventHandler;
      }
  >,
) {
  return forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonWithIconProps>(function ThemeWrapper(props, ref) {
    const { color } = props;
    const token = theme.useToken().token;

    const disabledColor = color ? tinycolor(color).brighten(20).desaturate(30).toHexString() : token.colorTextTertiary;

    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: color ?? token.colorPrimary,
            colorText: color ?? token.colorText,
            colorTextDisabled: disabledColor,
          },
        }}
      >
        <Component {...props} ref={ref} />
      </ConfigProvider>
    );
  });
}

// 3) Tooltip aspect (separate, composable)
function withTooltip(
  Component: React.ForwardRefExoticComponent<
    ButtonWithIconProps &
      React.RefAttributes<HTMLButtonElement | HTMLAnchorElement> & {
        onMouseEnter?: React.MouseEventHandler;
        onMouseLeave?: React.MouseEventHandler;
      }
  >,
) {
  return forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonWithIconProps & TooltipAspectProps>(function TooltipWrapper(props, ref) {
    const { tooltipTitle, tooltipPlacement, color, ...restProps } = props;
    const { isTouch } = useGlobalContext();
    const [ttOpen, setTtOpen] = useState(false);

    const openTT = useCallback(() => {
      setTtOpen(!!tooltipTitle && !isTouch);
    }, [isTouch, tooltipTitle]);
    const closeTT = useCallback(() => setTtOpen(false), []);

    return (
      <Tooltip color={color} open={ttOpen} placement={tooltipPlacement || "top"} title={isTouch ? null : tooltipTitle}>
        <Component {...restProps} onMouseEnter={openTT} onMouseLeave={closeTT} ref={ref} />
      </Tooltip>
    );
  });
}

// 4) Compose for exports
const ButtonWithTheme = withTheme(PureButtonCore);
export const ButtonWithoutTooltip = ButtonWithTheme;
export const ButtonWithIcon = withTooltip(ButtonWithTheme);

export default ButtonWithIcon;
