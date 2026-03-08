import { Tooltip } from "antd";
import MedicineBoxFilled from "@ant-design/icons/MedicineBoxFilled";
import MedicineBoxOutlined from "@ant-design/icons/MedicineBoxOutlined";
import React from "react";
import { useGlobalContext } from "@/app/GlobalContext.ts";

export function ErsthelferSymbol({ inverted = false }: { readonly inverted?: boolean }) {
  const { isTouch } = useGlobalContext();

  return (
    <Tooltip color="darkred" title={isTouch ? null : "Ersthelfer"}>
      {inverted ? (
        <MedicineBoxFilled style={{ color: "white", paddingLeft: 4, fontSize: 12 }} />
      ) : (
        <MedicineBoxOutlined style={{ color: "darkred", paddingLeft: 4, fontSize: 12 }} />
      )}
    </Tooltip>
  );
}
