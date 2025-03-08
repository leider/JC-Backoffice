import React, { useMemo } from "react";
import { theme } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";

export function ButtonStaff({
  callback,
  add,
  disabled,
}: {
  readonly add: boolean;
  readonly callback: () => void;
  readonly disabled?: boolean;
}) {
  const { useToken } = theme;
  const token = useToken().token;

  const color = useMemo(() => {
    return add ? token.colorSuccess : token.colorError;
  }, [add, token.colorError, token.colorSuccess]);

  return (
    <ButtonWithIcon
      color={color}
      disabled={disabled}
      icon={add ? "PlusCircleFill" : "DashCircleFill"}
      onClick={callback}
      size="small"
      tooltipTitle={add ? "Zusagen" : "Absagen"}
    />
  );
}
