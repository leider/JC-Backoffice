import React from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { Button } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";

export default function ButtonIcal() {
  const { sm } = useBreakpoint();
  return (
    <Button
      href={`${window.location.origin.replace(/https|http/, "webcal")}/ical/`}
      icon={<IconForSmallBlock iconName="CalendarWeek" size={14} />}
      key="cal"
      type="default"
    >
      {sm && "ical..."}
    </Button>
  );
}
