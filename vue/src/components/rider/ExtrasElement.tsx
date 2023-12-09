import { useDrag } from "react-dnd";
import { InventoryElement, ItemTypes } from "@/components/rider/types.ts";
import { List } from "antd";
import { v4 as uuidv4 } from "uuid";

export function ExtrasElement({ item }: { item: InventoryElement }) {
  const [, drag] = useDrag(() => {
    return {
      type: ItemTypes.SourceElement,
      item: () => ({ ...item, id: item.id + uuidv4(), left: 0, top: 0 }),
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
