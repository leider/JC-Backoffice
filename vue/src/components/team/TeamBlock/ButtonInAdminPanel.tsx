import { buttonType, useColorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import capitalize from "lodash/capitalize";
import React from "react";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";

interface ButtonInAdminPanelProps {
  type: buttonType;
  url: string;
  isVermietung?: boolean;
}

export function ButtonInAdminPanel({ type, url, isVermietung }: ButtonInAdminPanelProps) {
  const { color, icon } = useColorsAndIconsForSections(type);
  return (
    <ButtonWithIconAndLink
      icon={icon()}
      tooltipTitle={capitalize(type)}
      to={`/${isVermietung ? "vermietung" : "veranstaltung"}/${encodeURIComponent(url)}?page=${type}`}
      color={color()}
    />
  );
}
