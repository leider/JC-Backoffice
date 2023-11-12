import { IconForSmallBlock, IconProps } from "@/components/Icon";
import React, { useEffect, useState } from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import { ButtonHTMLType } from "antd/es/button";
import { SizeType } from "antd/es/config-provider/SizeContext";

export default function ButtonWithIcon({
  href,
  icon,
  onClick,
  target,
  text,
  type,
  disabled,
  htmlType,
  tooltipTitle,
  color,
  size,
}: {
  icon?: IconProps["iconName"];
  text?: string;
  type?: BaseButtonProps["type"];
  onClick?: () => void;
  href?: string;
  target?: string;
  disabled?: boolean;
  htmlType?: ButtonHTMLType;
  tooltipTitle?: string;
  color?: string;
  size?: SizeType;
}) {
  const [button, setButton] = useState<JSX.Element | undefined>(undefined);

  useEffect(() => {
    setButton(
      <Button
        icon={icon && <IconForSmallBlock iconName={icon} />}
        type={type || "primary"}
        onClick={onClick}
        href={href}
        target={target}
        disabled={disabled}
        htmlType={htmlType}
        size={size}
      >
        {text && text}
      </Button>,
    );
  }, [text, icon, type, onClick, href, target, disabled, htmlType]);

  return color ? (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      {tooltipTitle ? (
        <Tooltip title={tooltipTitle} color={color}>
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </ConfigProvider>
  ) : tooltipTitle ? (
    <Tooltip title={tooltipTitle}>{button}</Tooltip>
  ) : (
    button
  );
}
