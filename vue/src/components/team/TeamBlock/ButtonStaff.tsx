import React, { useMemo } from "react";
import { theme } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";

export function ButtonStaff({ callback, add }: { add: boolean; callback: () => void }) {
  const { useToken } = theme;
  const token = useToken().token;

  const color = useMemo(() => {
    return add ? token.colorSuccess : token.colorError;
  }, [add, token.colorError, token.colorSuccess]);

  return (
    <ButtonWithIcon
      size="small"
      icon={add ? "PlusCircleFill" : "DashCircleFill"}
      onClick={callback}
      tooltipTitle={add ? "Zusagen" : "Absagen"}
      color={color}
    />
  );
}
