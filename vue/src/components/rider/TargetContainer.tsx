import type { CSSProperties, FC } from "react";
import { useContext } from "react";
import type { DropTargetMonitor, XYCoord } from "react-dnd";
import { useDrop } from "react-dnd";

import { Box } from "./Box.js";
import type { DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { BoxesContext } from "@/components/rider/Rider.tsx";

const style: CSSProperties = {
  width: "100%",
  height: 600,
  border: "1px solid black",
  position: "relative",
  overflow: "clip",
};

export const TargetContainer: FC = () => {
  const boxesContext = useContext(BoxesContext);

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.SourceElement, ItemTypes.BOX],
      drop(item: DragItem, monitor: DropTargetMonitor<DragItem, undefined>) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        const offset = monitor.getSourceClientOffset();

        boxesContext.dropOntoTarget({ offset, delta, item: { ...item } });
        return undefined;
      },
    }),
    [boxesContext],
  );

  return (
    <div ref={drop} style={style}>
      {boxesContext.targetBoxes.map((each) => {
        return <Box key={each.id} item={each} />;
      })}
    </div>
  );
};
