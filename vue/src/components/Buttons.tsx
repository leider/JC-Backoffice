import React from "react";
import { Button, Tooltip } from "antd";
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
    <Tooltip title={_.capitalize(type)} color={color()}>
      <Button
        icon={<IconForSmallBlock iconName={icon()} />}
        className={`btn-${type}`}
        type="primary"
        //style={{ backgroundColor: color() }}
        onClick={() => {
          navigate({ pathname: `/veranstaltung/${url}`, search: `page=${type}` });
        }}
      />
    </Tooltip>
  );
}
