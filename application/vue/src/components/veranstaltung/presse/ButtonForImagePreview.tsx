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
      disabled={disabled}
      icon={icon && <IconForSmallBlock color="white" iconName={icon} size={14} />}
      onClick={onClick}
      type="text"
    />
  );
}
