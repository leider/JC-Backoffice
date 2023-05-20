import React from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
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
          size="medium"
          type="primary"
          onClick={() => navigate({ pathname: `/veranstaltung/${url}`, search: `page=${type}` })}
        />
      </Tooltip>
    </ConfigProvider>
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
