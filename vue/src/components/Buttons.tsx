import React, { useEffect, useState } from "react";
import { theme, Tooltip } from "antd";
import { IconForSmallBlock, IconProps } from "@/components/Icon";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import capitalize from "lodash/capitalize";

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

export function ButtonInUsers({ type, callback }: { type: "edit" | "changepass" | "delete"; callback: () => void }) {
  const [color, setColor] = useState<string>("");

  const { useToken } = theme;
  const colors = {
    edit: useToken().token.colorText,
    changepass: useToken().token.colorSuccess,
    delete: useToken().token.colorError,
  };
  const text = {
    edit: "Bearbeiten",
    changepass: "Passwort ändern",
    delete: "löschen",
  };
  const iconName = {
    edit: "PencilSquare",
    changepass: "KeyFill",
    delete: "Trash",
  };

  useEffect(
    () => {
      setColor(colors[type]);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [type],
  );

  return (
    <Tooltip title={text[type]} color={color}>
      <span
        onClick={(event) => {
          event.stopPropagation();
          callback();
        }}
      >
        <IconForSmallBlock size={16} color={color} iconName={iconName[type] as IconProps["iconName"]} />
      </span>
    </Tooltip>
  );
}

export function ButtonKassenzettel({ callback }: { callback: () => void }) {
  const { color } = useColorsAndIconsForSections("kasse");

  return (
    <ButtonWithIcon
      block
      text="Kassenzettel"
      icon="PrinterFill"
      type="primary"
      onClick={callback}
      tooltipTitle="Kassenzettel asl PDF"
      color={color()}
    />
  );
}

export function ButtonStaff({ callback, add }: { add: boolean; callback: () => void }) {
  const [color, setColor] = useState<string>("");
  const { useToken } = theme;

  const token = useToken().token;
  useEffect(
    () => {
      setColor(add ? token.colorSuccess : token.colorError);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [add],
  );
  return (
    <ButtonWithIcon
      size="small"
      icon={add ? "PlusCircleFill" : "DashCircleFill"}
      type="primary"
      onClick={callback}
      tooltipTitle={add ? "Zusagen" : "Absagen"}
      color={color}
    />
  );
}
