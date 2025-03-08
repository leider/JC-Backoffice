import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";
import React from "react";
import { Button } from "antd";

export default function ButtonForImagePreview({
  icon,
  onClick,
  disabled,
}: {
  readonly icon: IconProps["iconName"];
  readonly onClick: () => void;
  readonly disabled?: boolean;
}) {
  return (
    <Button
      disabled={disabled}
      icon={icon ? <IconForSmallBlock color="white" iconName={icon} size={14} /> : null}
      onClick={onClick}
      type="text"
    />
  );
}
