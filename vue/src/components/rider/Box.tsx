import type { CSSProperties, FC } from "react";
import { useDrag } from "react-dnd";
import { BoxParams, ItemTypes } from "@/components/rider/types.ts";

const style: CSSProperties = {
  position: "absolute",
  border: "1px dashed gray",
  backgroundColor: "white",
  cursor: "move",
};

export const Box: FC<BoxParams> = (item) => {
  const [, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: item,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item],
  );

  return (
    <div ref={drag} style={{ ...style, left: item.left, top: item.top }} data-testid="box">
      {item.content}
    </div>
  );
};
