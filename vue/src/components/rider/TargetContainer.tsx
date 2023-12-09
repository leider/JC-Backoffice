import type { CSSProperties, FC } from "react";
import { useContext, useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
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
  const { sourceBoxes, targetBoxes, setSourceBoxes, setTargetBoxes } = useContext(BoxesContext);
  const targetContainer = useRef<HTMLDivElement | null>(null);

  const [, dropTarget] = useDrop(
    () => ({
      accept: [ItemTypes.SourceElement, ItemTypes.BOX],
      drop: (item: DragItem, monitor: DropTargetMonitor<DragItem, undefined>) => {
        const result = [...targetBoxes]; // copy existing items

        if (result.map((b) => b.id).includes(item.id)) {
          // box has been moved
          const delta = monitor.getDifferenceFromInitialOffset() || { x: 0, y: 0 };
          const box = result.find((b) => b.id === item.id);
          if (box) {
            box.left = item.left + delta.x;
            box.top = item.top + delta.y;
            setTargetBoxes(result);
          }
          return undefined;
        }

        // box is new in target
        const offset = monitor.getSourceClientOffset() || { x: 0, y: 0 };
        const rect = targetContainer.current?.getBoundingClientRect() || { x: 0, y: 0 };
        result.push({ ...item, left: offset.x - rect.x, top: offset.y - rect.y });
        setTargetBoxes(result);
        setSourceBoxes(sourceBoxes.filter((b) => b.id !== item.id)); // remove added box from predefined sources
        return undefined;
      },
    }),
    [sourceBoxes, targetBoxes],
  );

  return (
    <div ref={targetContainer}>
      <div ref={dropTarget} style={style}>
        {targetBoxes.map((each) => {
          return <Box key={each.id} item={each} />;
        })}
      </div>
    </div>
  );
};
