import type { CSSProperties, FC } from "react";
import { useCallback, useContext } from "react";
import type { DropTargetMonitor, XYCoord } from "react-dnd";
import { useDrop } from "react-dnd";

import { Box } from "./Box.js";
import type { DragItem } from "./types.ts";
import { BoxesContext } from "@/components/rider/Rider.tsx";
import { ItemTypes } from "./types.ts";

const styles: CSSProperties = {
  width: "100%",
  height: 600,
  border: "1px solid black",
  position: "relative",
};

export interface ContainerProps {
  id: string;
}

export const Container: FC<ContainerProps> = ({ id }) => {
  const boxesContext = useContext(BoxesContext);

  const boxes = useCallback(() => {
    return id === "source" ? boxesContext.sourceBoxes : boxesContext.targetBoxes;
  }, [boxesContext, id]);

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop(item: DragItem, monitor: DropTargetMonitor<DragItem, undefined>) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        const initialOffset = monitor.getInitialSourceClientOffset();
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        boxesContext.moveBox({ containerId: id, id: item.id, left, top, title: item.title, initialOffset });
        return undefined;
      },
    }),
    [boxesContext],
  );

  return (
    <div ref={drop} style={styles}>
      {boxes().map((each) => {
        const { id, left, top, title } = each;
        return <Box key={id} id={id} left={left} top={top} hideSourceOnDrag={false} title={title} />;
      })}
    </div>
  );
};
