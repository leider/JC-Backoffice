import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import capitalize from "lodash/capitalize";
import React from "react";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

interface ButtonInAdminPanelProps {
  readonly type: buttonType;
  readonly veranstaltung: Veranstaltung;
}

export function ButtonInAdminPanel({ type, veranstaltung }: ButtonInAdminPanelProps) {
  const { color, icon } = colorsAndIconsForSections;
  return (
    <ButtonWithIconAndLink
      color={color(type)}
      icon={icon(type)}
      to={`${veranstaltung?.fullyQualifiedUrl}?page=${type}`}
      tooltipTitle={capitalize(type)}
    />
  );
}
