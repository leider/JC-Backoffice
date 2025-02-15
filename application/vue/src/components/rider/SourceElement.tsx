import { List } from "antd";
import { v4 as uuidv4 } from "uuid";
import { InventoryElement } from "jc-shared/rider/inventory.ts";
import { useDraggable } from "@dnd-kit/core";
import { useMemo } from "react";
import { ItemTypes } from "./types.ts";

export function SourceElement({ item }: { item: InventoryElement }) {
  const uuid = useMemo(() => uuidv4(), []);
  const isExtra = useMemo(() => item.category === "Extra", [item.category]);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: isExtra ? item.id + uuid : item.id,
    data: {
      type: ItemTypes.SourceElement,
      item: isExtra ? { ...item, id: item.id + uuid, left: 0, top: 0 } : item,
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
