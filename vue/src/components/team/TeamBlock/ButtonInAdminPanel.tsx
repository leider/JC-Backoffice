import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import capitalize from "lodash/capitalize";
import React from "react";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";

interface ButtonInAdminPanelProps {
  type: buttonType;
  url: string;
  isVermietung?: boolean;
}

export function ButtonInAdminPanel({ type, url, isVermietung }: ButtonInAdminPanelProps) {
  const { color, icon } = colorsAndIconsForSections;
  return (
    <ButtonWithIconAndLink
      icon={icon(type)}
      tooltipTitle={capitalize(type)}
      to={`/${isVermietung ? "vermietung" : "veranstaltung"}/${encodeURIComponent(url)}?page=${type}`}
      color={color(type)}
    />
  );
}
