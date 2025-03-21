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
        return function BooleanCol(val: boolean) {
          return (
            <IconForSmallBlock
              color={val ? token.colorSuccess : token.colorFillSecondary}
              iconName={val ? "CheckSquareFill" : "Square"}
              size={isCompactMode ? 14 : undefined}
            />
          );
        };
      case "integer":
        return function IntegerCol(val: number | null) {
          if (!isNil(val)) {
            return numeral(val).format("0");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "0";
        };
      case "twoDecimals":
        return function IntegerCol(val: number | null) {
          if (!isNil(val)) {
            return numeral(val).format("0.00");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "0,00";
        };
      case "color":
        return function ColorCol(val: string | null) {
          if (isNil(val) && required) {
            return <IconForSmallBlock color={token.colorError} iconName="SlashSquare" size="20" />;
          }
          return val ? (
            <div style={{ backgroundColor: val, width: 20, height: 20 }} />
          ) : (
            <IconForSmallBlock color={token.colorPrimary} iconName="SlashSquare" size="20" />
          );
        };
      case "date":
        return function DateCol(val: string | null) {
          if (!isNil(val)) {
            return dayjs(val).format("ll");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "<Klick ...>";
        };
      case "startEnd":
        return function StartEndCol(val: string[] | null) {
          if (!isNil(val)) {
            // eslint-disable-next-line react/destructuring-assignment
            return dayjs(val[0]).format("ll") + " - " + dayjs(val[1]).format("ll");
          }
          if (required) {
            return <Typography.Text type="danger"> Wert eingeben</Typography.Text>;
          }
          return "<Klick ...>";
        };
      case "user":
        return function UserCol(val: string[] | null) {
          // eslint-disable-next-line react/destructuring-assignment
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
                  <TagForUser hideErsthelfer usersAsOptions={usersWithKann ?? []} value={each} />
                </Tag>
              ))}
            </>
          );
        };
      default:
        return function DefaultCol(val: string | null) {
          if (val) {
            return <Typography.Text style={{ whiteSpace: "pre-wrap" }}>{val}</Typography.Text>;
          }
          if (required) {
            return <Typography.Text type="danger">Wert eingeben</Typography.Text>;
          }
          return <Typography.Text type="secondary">-</Typography.Text>;
        };
    }
  };
}
