import React from "react";
import { InventoryElement } from "@/components/rider/Inventory.ts";
import { Popover } from "antd";

export function InventoryContent({ inv }: { inv: InventoryElement }) {
  return (
    <Popover title={inv.title} content={inv.photo && <img src={"img/" + inv.photo.src} alt="Popup Photo" />} trigger="click">
      <div style={{ width: inv.width, height: inv.height }}>
        {inv.img ? (
          <img src={"img/" + inv.img.src} width={inv.img.width} height={inv.img.height} alt={inv.title} />
        ) : (
          <div style={{ textAlign: "center", fontSize: "10px", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
            {inv.title}
          </div>
        )}
      </div>
    </Popover>
  );
}
