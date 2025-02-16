import React, { useMemo } from "react";
import { theme, Tooltip } from "antd";
import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";

export function ButtonInUsers({ type, callback }: { type: "edit" | "changepass" | "delete"; callback: () => void }) {
  const { useToken } = theme;
  const token = useToken().token;

  const colors = useMemo(
    () => ({ edit: token.colorText, changepass: token.colorSuccess, delete: token.colorError }),
    [token.colorError, token.colorSuccess, token.colorText],
  );
  const color = useMemo(() => colors[type], [colors, type]);
  const text = { edit: "Bearbeiten", changepass: "Passwort ändern", delete: "löschen" };
  const iconName = { edit: "PencilSquare", changepass: "KeyFill", delete: "Trash" };

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
