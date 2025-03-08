import { Tooltip } from "antd";
import { MedicineBoxFilled, MedicineBoxOutlined } from "@ant-design/icons";
import React from "react";

export function ErsthelferSymbol({ inverted = false }: { readonly inverted?: boolean }) {
  return (
    <Tooltip color="darkred" title="Ersthelfer">
      {inverted ? (
        <MedicineBoxFilled style={{ color: "white", paddingLeft: 4, fontSize: 12 }} />
      ) : (
        <MedicineBoxOutlined style={{ color: "darkred", paddingLeft: 4, fontSize: 12 }} />
      )}
    </Tooltip>
  );
}
