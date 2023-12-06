import type { CSSProperties, FC } from "react";
import { useContext } from "react";
import type { DropTargetMonitor, XYCoord } from "react-dnd";
import { useDrop } from "react-dnd";

import { Box } from "./Box.js";
import type { DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { BoxesContext } from "@/components/rider/Rider.tsx";

const styles: CSSProperties = {
  width: "100%",
  height: 600,
  border: "1px solid black",
  position: "relative",
};

export const TargetContainer: FC = () => {
  const boxesContext = useContext(BoxesContext);

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.SourceElement, ItemTypes.BOX],
      drop(item: DragItem, monitor: DropTargetMonitor<DragItem, undefined>) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        const offset = monitor.getSourceClientOffset();

        boxesContext.moveBox({ containerId: "target", offset, delta, item: { ...item } });
        return undefined;
      },
    }),
    [boxesContext],
  );

  return (
    <div ref={drop} style={styles}>
      {boxesContext.targetBoxes.map((each) => {
        const { id, left, top, content } = each;
        return <Box key={id} id={id} left={left} top={top} content={content} />;
      })}
    </div>
  );
};
