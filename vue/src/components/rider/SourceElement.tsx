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
    <Col>
      <div ref={drag} style={{ border: "1px dotted black" }}>
        {item.content}
      </div>
    </Col>
  );
};
