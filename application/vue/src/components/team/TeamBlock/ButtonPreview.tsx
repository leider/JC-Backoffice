import { theme } from "antd";
import React from "react";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

export function ButtonPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const { token } = theme.useToken();
  return (
    <ButtonWithIconAndLink color={token.colorSuccess} icon="EyeFill" to={veranstaltung.fullyQualifiedPreviewUrl} tooltipTitle="Vorschau" />
  );
}
