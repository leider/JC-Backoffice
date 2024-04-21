import type { CSSProperties, FC } from "react";
import { useRef } from "react";
import type { DropTargetMonitor } from "react-dnd";
import { useDrop } from "react-dnd";

import { Box } from "./Box.js";
import type { DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";

const style: CSSProperties = {
  width: 800,
  height: 300,
  border: "1px solid black",
  position: "relative",
  backgroundSize: "200px 100px",
  backgroundPosition: "-2px -2px",
  backgroundImage: "-webkit-linear-gradient(#EEE 2px, transparent 2px),-webkit-linear-gradient(0, #EEE 2px, transparent 2px)\n", // +
  //"-moz-linear-gradient(#EEE 2px, transparent 2px),-moz-linear-gradient(0, #EEE 2px, transparent 2px)\n" +
  //"linear-gradient(#EEE 2px, transparent 2px),linear-gradient(90deg, #EEE 2px, transparent 2px)",
  //overflow: "scroll",
};
/*
background-image: -webkit-linear-gradient(white 2px, transparent 2px),
                  -webkit-linear-gradient(0, white 2px, transparent 2px),
                  -webkit-linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                  -webkit-linear-gradient(0, rgba(255,255,255,.3) 1px, transparent 1px);
background-image: -moz-linear-gradient(white 2px, transparent 2px),
                  -moz-linear-gradient(0, white 2px, transparent 2px),
                  -moz-linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                  -moz-linear-gradient(0, rgba(255,255,255,.3) 1px, transparent 1px);
background-image: linear-gradient(white 2px, transparent 2px),
                  linear-gradient(90deg, white 2px, transparent 2px),
                  linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px);

body{
background-color: #FFF;
background-image: -webkit-linear-gradient(#EEE 2px, transparent 2px),
                  -webkit-linear-gradient(0, #EEE 2px, transparent 2px);
}
 */
export const TargetContainer: FC<{
  targetBoxes: BoxParams[];
  setTargetBoxes: (boxes: BoxParams[]) => void;
}> = ({ targetBoxes, setTargetBoxes }) => {
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
            result.splice(result.indexOf(box), 1);
            const newBox = { ...box, left: item.left + delta.x, top: item.top + delta.y };
            result.push(newBox);
            setTargetBoxes(result);
          }
          return undefined;
        }

        // box is new in target
        const offset = monitor.getSourceClientOffset() || { x: 0, y: 0 };
        const rect = targetContainer.current?.getBoundingClientRect() || { x: 0, y: 0 };
        result.push({ ...item, left: offset.x - rect.x, top: offset.y - rect.y });
        setTargetBoxes(result);
        return undefined;
      },
    }),
    [targetBoxes],
  );

  function boxChanged(id: string) {
    const result = [...targetBoxes]; // copy existing items
    const box = result.find((b) => b.id === id);
    if (box) {
      result.splice(result.indexOf(box), 1);
      const newBox = { ...box };
      result.push(newBox);
      setTargetBoxes(result);
    }
  }

  return (
    <div ref={targetContainer} style={{ width: "100%", overflow: "scroll" }}>
      <div ref={dropTarget} style={style}>
        {targetBoxes.map((each) => {
          return <Box key={each.id} item={each} callback={boxChanged} />;
        })}
      </div>
    </div>
  );
};
