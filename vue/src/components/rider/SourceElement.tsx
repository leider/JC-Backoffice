import type { FC } from "react";
import { useDrag } from "react-dnd";
import { BoxParams, ItemTypes } from "@/components/rider/types.ts";
import { Col } from "antd";

export const SourceElement: FC<BoxParams> = (item) => {
  const [, drag] = useDrag(
    () => ({
      type: ItemTypes.SourceElement,
      item,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item],
  );

  return (
    <Col style={{ padding: 0 }}>
      <div ref={drag} style={{ border: "1px dotted black", margin: 12, padding: 0 }}>
        {item.content}
      </div>
    </Col>
  );
};
