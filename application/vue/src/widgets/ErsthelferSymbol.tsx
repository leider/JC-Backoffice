import { Tooltip } from "antd";
import { MedicineBoxFilled, MedicineBoxOutlined } from "@ant-design/icons";
import React from "react";

export function ErsthelferSymbol({ inverted = false }: { inverted?: boolean }) {
  return (
    <Tooltip title="Ersthelfer" color="darkred">
      {inverted ? (
        <MedicineBoxFilled style={{ color: "white", paddingLeft: 4, fontSize: 12 }} />
      ) : (
        <MedicineBoxOutlined style={{ color: "darkred", paddingLeft: 4, fontSize: 12 }} />
      )}
    </Tooltip>
  );
}
