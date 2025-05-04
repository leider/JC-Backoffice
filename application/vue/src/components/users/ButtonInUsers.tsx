import React, { MouseEvent, useCallback, useMemo } from "react";
import { theme, Tooltip } from "antd";
import { IconForSmallBlock, IconProps } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useGlobalContext } from "@/app/GlobalContext.ts";

export function ButtonInUsers({ type, callback }: { readonly type: "edit" | "changepass" | "delete"; readonly callback: () => void }) {
  const { useToken } = theme;
  const token = useToken().token;
  const { isTouch } = useGlobalContext();

  const colors = useMemo(
    () => ({ edit: token.colorText, changepass: token.colorSuccess, delete: token.colorError }),
    [token.colorError, token.colorSuccess, token.colorText],
  );
  const color = useMemo(() => colors[type], [colors, type]);
  const text = { edit: "Bearbeiten", changepass: "Passwort ändern", delete: "Löschen" };
  const iconName = { edit: "PencilSquare", changepass: "KeyFill", delete: "Trash" };

  const click = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      callback();
    },
    [callback],
  );

  return (
    <Tooltip color={color} title={isTouch ? null : text[type]}>
      <span onClick={click}>
        <IconForSmallBlock color={color} iconName={iconName[type] as IconProps["iconName"]} size={16} />
      </span>
    </Tooltip>
  );
}
