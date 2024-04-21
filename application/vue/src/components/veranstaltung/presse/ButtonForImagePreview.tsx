import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";
import React from "react";
import { Button } from "antd";

export default function ButtonForImagePreview({
  icon,
  onClick,
  disabled,
}: {
  icon: IconProps["iconName"];
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      icon={icon && <IconForSmallBlock size={14} iconName={icon} color="white" />}
      type="text"
      onClick={onClick}
      disabled={disabled}
    />
  );
}
