import { useDrag } from "react-dnd";
import { ItemTypes } from "@/components/rider/types.ts";
import { List } from "antd";
import { InventoryElement } from "@/components/rider/Inventory.ts";

export function SourceElement({ item }: { item: InventoryElement }) {
  const [, drag] = useDrag(() => {
    return {
      type: ItemTypes.SourceElement,
      item,
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
