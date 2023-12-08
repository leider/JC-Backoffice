import { useDrag } from "react-dnd";
import { InventoryElement, ItemTypes } from "@/components/rider/types.ts";
import { List } from "antd";

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
