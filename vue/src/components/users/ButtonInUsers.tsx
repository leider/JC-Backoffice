import React, { useEffect, useState } from "react";
import { theme, Tooltip } from "antd";
import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";

export function ButtonInUsers({ type, callback }: { type: "edit" | "changepass" | "delete"; callback: () => void }) {
  const [color, setColor] = useState<string>("");

  const { useToken } = theme;
  const token = useToken().token;

  const colors = { edit: token.colorText, changepass: token.colorSuccess, delete: token.colorError };
  const text = { edit: "Bearbeiten", changepass: "Passwort ändern", delete: "löschen" };
  const iconName = { edit: "PencilSquare", changepass: "KeyFill", delete: "Trash" };

  useEffect(() => {
    setColor(colors[type]);
  }, [colors, type]);

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
