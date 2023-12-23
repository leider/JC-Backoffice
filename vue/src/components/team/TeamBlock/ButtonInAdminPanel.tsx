import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import capitalize from "lodash/capitalize";
import React from "react";

interface ButtonInAdminPanelProps {
  type: buttonType;
  url: string;
  isVermietung?: boolean;
}

export function ButtonInAdminPanel({ type, url, isVermietung }: ButtonInAdminPanelProps) {
  const { color, icon } = useColorsAndIconsForSections(type);
  return (
    <ButtonWithIcon
      tooltipTitle={capitalize(type)}
      icon={icon()}
      type="primary"
      to={`/${isVermietung ? "vermietung" : "veranstaltung"}/${encodeURIComponent(url)}?page=${type}`}
      color={color()}
      size="small"
    />
  );
}
