import { IconForSmallBlock, IconProps } from "@/components/Icon";
import React from "react";
import { Button } from "antd";
import { BaseButtonProps } from "antd/es/button/button";

export default function ButtonWithIcon({
  href,
  icon,
  onClick,
  target,
  text,
  type,
}: {
  icon?: IconProps["iconName"];
  text?: string;
  type?: BaseButtonProps["type"];
  onClick?: () => void;
  href?: string;
  target?: string;
}) {
  return (
    <Button icon={icon && <IconForSmallBlock iconName={icon} />} type={type || "primary"} onClick={onClick} href={href} target={target}>
      {text && text}
    </Button>
  );
}
