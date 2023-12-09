import { useDrag } from "react-dnd";
import { ItemTypes } from "@/components/rider/types.ts";
import { List } from "antd";
import { InventoryElement } from "@/components/rider/Inventory.ts";
import { v4 as uuidv4 } from "uuid";

export function SourceElement({ item }: { item: InventoryElement }) {
  const [, drag] = useDrag(() => {
    return {
      type: ItemTypes.SourceElement,
      item: () => (item.category === "Extra" ? { ...item, id: item.id + uuidv4(), left: 0, top: 0 } : item),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    };
  }, [item]);

  return (
    <List.Item>
      <div ref={drag} style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>{item.title}</div>
      </div>
    </List.Item>
  );
}
