import { List } from "antd";
import { v4 as uuidv4 } from "uuid";
import { InventoryElement } from "jc-shared/rider/inventory.ts";
import { useDraggable } from "@dnd-kit/core";
import { useMemo } from "react";
import { ItemTypes } from "@/components/rider/types.ts";

export function SourceElement({ item }: { item: InventoryElement }) {
  const uuid = useMemo(() => uuidv4(), []);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id + uuid,
    data: {
      type: ItemTypes.SourceElement,
      item,
    },
  });

  // const [, drag] = useDrag(() => {
  //   return {
  //     type: ItemTypes.SourceElement,
  //     item: () => (item.category === "Extra" ? { ...item, id: item.id + uuidv4(), left: 0, top: 0 } : item),
  //     collect: (monitor) => ({
  //       isDragging: monitor.isDragging(),
  //     }),
  //   };
  // }, [item]);
  //
  return (
    <List.Item ref={setNodeRef}>
      <div style={{ width: "100%" }} {...listeners} {...attributes}>
        <div style={{ width: "100%" }}>{item.title}</div>
      </div>
    </List.Item>
  );
}
