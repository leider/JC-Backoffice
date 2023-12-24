import { IconForSmallBlock, IconProps } from "./Icon.tsx";
import React, { useEffect, useState } from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import { ButtonHTMLType } from "antd/es/button";
import { SizeType } from "antd/es/config-provider/SizeContext";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { Link, To } from "react-router-dom";
import { TooltipPlacement } from "antd/es/tooltip";

export default function ButtonWithIcon({
  href,
  to,
  icon,
  iconColor,
  onClick,
  target,
  text,
  type,
  disabled,
  htmlType,
  tooltipTitle,
  tooltipPlacement,
  color,
  size,
  block,
  loading,
}: {
  icon?: IconProps["iconName"];
  iconColor?: string;
  text?: string;
  type?: BaseButtonProps["type"];
  onClick?: () => void;
  href?: string;
  to?: To;
  target?: string;
  disabled?: boolean;
  htmlType?: ButtonHTMLType;
  tooltipTitle?: string;
  tooltipPlacement?: TooltipPlacement;
  color?: string;
  size?: SizeType;
  block?: boolean;
  loading?: boolean;
}) {
  const [button, setButton] = useState<React.ReactElement | undefined>(undefined);

  const { sm } = useBreakpoint();

  useEffect(() => {
    if (to) {
      setButton(
        <Link to={to}>
          <Button
            icon={icon && <IconForSmallBlock size={size === "small" ? 14 : 16} iconName={icon} color={iconColor} />}
            type={type || "primary"}
            onClick={onClick}
            target={target}
            disabled={disabled}
            htmlType={htmlType}
            size={size}
            block={block}
            title={!sm && text ? text : undefined}
            loading={loading}
          >
            {sm && text && text}
          </Button>
        </Link>,
      );
    } else {
      setButton(
        <Button
          icon={icon && <IconForSmallBlock size={size === "small" ? 14 : 16} iconName={icon} color={iconColor} />}
          type={type || "primary"}
          onClick={onClick}
          href={href}
          target={target}
          disabled={disabled}
          htmlType={htmlType}
          size={size}
          block={block}
          title={!sm && text ? text : undefined}
          loading={loading}
        >
          {sm && text && text}
        </Button>,
      );
    }
  }, [sm, text, icon, type, onClick, href, to, target, disabled, htmlType, size, block, loading, iconColor]);

  return color ? (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      {tooltipTitle ? (
        <Tooltip title={tooltipTitle} color={color} placement={tooltipPlacement || "top"}>
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </ConfigProvider>
  ) : tooltipTitle ? (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement || "top"}>
      {button}
    </Tooltip>
  ) : (
    button
  );
}
