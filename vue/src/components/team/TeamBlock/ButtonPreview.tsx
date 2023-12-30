import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { theme } from "antd";
import React from "react";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";

export function ButtonPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const { token } = theme.useToken();
  return (
    <ButtonWithIconAndLink
      icon="EyeFill"
      to={`/${"veranstaltung/preview"}/${veranstaltung.url}`}
      tooltipTitle="Vorschau"
      color={token.colorSuccess}
    />
  );
}
