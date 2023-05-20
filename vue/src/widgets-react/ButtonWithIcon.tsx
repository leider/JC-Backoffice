import { IconForSmallBlock, IconProps } from "@/components/Icon";
import React from "react";
import { Button } from "antd";
import { BaseButtonProps } from "antd/es/button/button";

export default function ButtonWithIcon(props: { icon?: IconProps["iconName"]; text?: string; type?: BaseButtonProps["type"] }) {
  return (
    <Button icon={props.icon && <IconForSmallBlock iconName={props.icon} />} type={props.type || "primary"}>
      {props.text && props.text}
    </Button>
  );
}
