import React, { useEffect, useState } from "react";
import { theme, Tooltip } from "antd";
import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";

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
