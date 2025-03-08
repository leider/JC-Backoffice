import { List } from "antd";
import { InventoryElement } from "jc-shared/rider/inventory.ts";
import { useDraggable } from "@dnd-kit/core";
import { useMemo } from "react";
import { ItemTypes } from "./types.ts";

export function SourceElement({ item }: { readonly item: InventoryElement }) {
  const isExtra = useMemo(() => item.category === "Extra", [item.category]);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
    data: {
      type: ItemTypes.SourceElement,
      item: isExtra ? { ...item, id: item.id, left: 0, top: 0 } : item,
    },
  });

  return (
    <List.Item ref={setNodeRef} {...listeners} {...attributes}>
      <div style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>{item.title}</div>
      </div>
    </List.Item>
  );
}
