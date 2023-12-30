import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { Button } from "antd";
import React from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export default function ButtonForRider({ icon, text, href }: { icon: IconProps["iconName"]; text: string; href: string }) {
  const { sm } = useBreakpoint();
  return (
    <Button icon={<IconForSmallBlock size={16} iconName={icon} />} type="primary" href={href} target="_blank">
      {sm && text}
    </Button>
  );
}
