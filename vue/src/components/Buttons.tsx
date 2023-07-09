import React, { useEffect, useState } from "react";
import { Button, ConfigProvider, theme, Tooltip } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import { useNavigate } from "react-router-dom";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import _ from "lodash";

interface ButtonInAdminPanelProps {
  type: buttonType;
  url: string;
}

export function ButtonInAdminPanel({ type, url }: ButtonInAdminPanelProps) {
  const navigate = useNavigate();

  const { color, icon } = useColorsAndIconsForSections(type);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color() } }}>
      <Tooltip title={_.capitalize(type)} color={color()}>
        <Button
          icon={<IconForSmallBlock size={16} iconName={icon()} />}
          size="middle"
          type="primary"
          onClick={() =>
            navigate({
              pathname: `/veranstaltung/${url}`,
              search: `page=${type}`,
            })
          }
        />
      </Tooltip>
    </ConfigProvider>
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

  useEffect(() => {
    setColor(colors[type]);
  }, [type]);
  return (
    <Tooltip title={text[type]} color={color}>
      <span
        onClick={(event) => {
          event.stopPropagation();
          callback();
        }}
      >
        <IconForSmallBlock size={16} color={color} iconName={iconName[type] as any} />
      </span>
    </Tooltip>
  );
}

export function ButtonKassenzettel({ callback }: { callback: () => void }) {
  const { color } = useColorsAndIconsForSections("kasse");

  return (
    <ConfigProvider theme={{ token: { colorPrimary: color() } }}>
      <Tooltip title="Kassenzettel als PDF" color={color()}>
        <Button block icon={<IconForSmallBlock size={16} iconName={"PrinterFill"} />} type="primary" onClick={callback}>
          &nbsp;Kassenzettel
        </Button>
      </Tooltip>
    </ConfigProvider>
  );
}

export function ButtonStaff({ callback, add }: { add: boolean; callback: () => void }) {
  const [color, setColor] = useState<string>("");
  const { useToken } = theme;

  const token = useToken().token;
  useEffect(() => {
    setColor(add ? token.colorSuccess : token.colorError);
  }, [add]);
  return (
    <ConfigProvider theme={{ token: { colorPrimary: color } }}>
      <Tooltip title={add ? "Zusagen" : "Absagen"} color={color}>
        <Button
          icon={<IconForSmallBlock size={14} iconName={add ? "PlusCircleFill" : "DashCircleFill"} />}
          size="small"
          type="primary"
          onClick={callback}
        />
      </Tooltip>
    </ConfigProvider>
  );
}
