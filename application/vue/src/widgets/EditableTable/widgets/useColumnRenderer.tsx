import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import isNil from "lodash/isNil";
import numeral from "numeral";
import { Tag, theme, Typography } from "antd";
import dayjs from "dayjs";
import { TagForUser } from "@/widgets/TagForUser.tsx";
import React from "react";
import { Columns } from "@/widgets/EditableTable/types.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import map from "lodash/map";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function useColumnRenderer(usersWithKann?: UserWithKann[]) {
  const token = theme.useToken().token;
  const { isCompactMode } = useJazzContext();

  return ({ type, required }: Columns) => {
    switch (type) {
      case "boolean":
        return (val: boolean) =>
          val ? (
            <IconForSmallBlock iconName="CheckSquareFill" color={token.colorSuccess} size={isCompactMode ? 14 : undefined} />
          ) : (
            <IconForSmallBlock iconName="Square" color={token.colorFillSecondary} size={isCompactMode ? 14 : undefined} />
          );
      case "integer":
        return (val: number | null) => {
          if (!isNil(val)) {
            return numeral(val).format("0");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "0";
        };
      case "color":
        return (val: string | null) => {
          if (isNil(val) && required) {
            return <IconForSmallBlock size="20" iconName="SlashSquare" color={token.colorError} />;
          }
          return val ? (
            <div style={{ backgroundColor: val, width: 20, height: 20 }} />
          ) : (
            <IconForSmallBlock size="20" iconName="SlashSquare" color={token.colorPrimary} />
          );
        };
      case "date":
        return (val: string | null) => {
          if (!isNil(val)) {
            return dayjs(val).format("ll");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "<Klick ...>";
        };
      case "startEnd":
        return (val: string[] | null) => {
          if (!isNil(val)) {
            return dayjs(val[0]).format("ll") + " - " + dayjs(val[1]).format("ll");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "<Klick ...>";
        };
      case "user":
        return (val: string[] | null) => {
          if (isNil(val) || val.length === 0) {
            if (required) {
              return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
            }
            return "Noch niemand gewählt...";
          }
          return (
            <>
              {map(val, (each) => (
                <Tag key={each}>
                  <TagForUser value={each} usersAsOptions={usersWithKann ?? []} hideErsthelfer />
                </Tag>
              ))}
            </>
          );
        };
      default:
        return (val: string | null) => {
          if (val) {
            return val;
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "<Klick ...>";
        };
    }
  };
}
