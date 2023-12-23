import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { theme } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import React from "react";

export function ButtonPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const { token } = theme.useToken();
  return (
    <ButtonWithIcon
      icon="EyeFill"
      type="primary"
      to={`/${"veranstaltung/preview"}/${veranstaltung.url}`}
      tooltipTitle="Vorschau"
      color={token.colorSuccess}
      size="small"
    />
  );
}
