import { InventoryElement } from "@/components/rider/types.ts";
import React from "react";

export function InventoryContent({ inv }: { inv: InventoryElement }) {
  return (
    <div style={{ width: inv.width, height: inv.height }}>
      {inv.img && <img src={"img/" + inv.img.src} width={inv.img.width} height={inv.img.height} />}
      <div style={{ textAlign: "center", fontSize: "10px" }}>{inv.id}</div>
    </div>
  );
}
