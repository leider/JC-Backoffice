import React from "react";
import { Button, theme } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import { IconProps } from "./Icon";
type buttonType = "allgemein" | "technik" | "ausgaben" | "hotel" | "kasse" | "presse";

const { useToken } = theme;
interface ButtonInAdminPanelProps {
  type: buttonType;
}

export function ButtonInAdminPanel({ type }: ButtonInAdminPanelProps) {
  const { token } = useToken() as any;

  const colors: { [index: string]: string } = {
    allgemein: token["custom-color-allgemeines"],
    technik: token["custom-color-technik"],
    ausgaben: token["custom-color-ausgaben"],
    hotel: token["custom-color-hotel"],
    kasse: token["custom-color-kasse"],
    presse: token["custom-color-presse"],
  };

  const icons: { [index: string]: string } = {
    allgemein: "Keyboard",
    technik: "Headphones",
    ausgaben: "GraphUp",
    hotel: "HouseDoor",
    kasse: "CashStack",
    presse: "Newspaper",
  };

  return (
    <Button
      icon={<IconForSmallBlock iconName={icons[type] as IconProps["iconName"]} />}
      type="primary"
      style={{ backgroundColor: colors[type] }}
    />
  );
}
