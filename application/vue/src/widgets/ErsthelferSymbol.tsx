import { Tooltip } from "antd";
import { MedicineBoxFilled, MedicineBoxOutlined } from "@ant-design/icons";
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
