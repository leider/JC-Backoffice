import React from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { Button } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";

export default function ButtonIcal() {
  const { sm } = useBreakpoint();
  return (
    <Button
      key="cal"
      icon={<IconForSmallBlock size={14} iconName="CalendarWeek" />}
      type="default"
      href={`${window.location.origin.replace(/https|http/, "webcal")}/ical/`}
    >
      {sm && "ical..."}
    </Button>
  );
}
