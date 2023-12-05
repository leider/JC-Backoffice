import type { CSSProperties, FC } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/components/rider/types.ts";

const style: CSSProperties = {
  position: "absolute",
  border: "1px dashed gray",
  backgroundColor: "white",
  padding: "0.5rem 1rem",
  cursor: "move",
};

export interface BoxProps {
  id: string;
  left: number;
  top: number;
  hideSourceOnDrag?: boolean;
  title: string;
}

export const Box: FC<BoxProps> = ({ id, left, top, hideSourceOnDrag, title }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: { id, left, top, title },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  );

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />;
  }
  return (
    <div className="box" ref={drag} style={{ ...style, left, top }} data-testid="box">
      {title}
    </div>
  );
};
