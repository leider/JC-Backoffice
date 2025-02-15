import type { CSSProperties, FC } from "react";
import { useRef } from "react";

import { Box } from "./Box.js";
import { ItemTypes } from "./types.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";
import find from "lodash/find";
import map from "lodash/map";
import { DragEndEvent, DragStartEvent, useDndMonitor, useDroppable } from "@dnd-kit/core";

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

  const { setNodeRef } = useDroppable({
    id: "TargetContainer",
  });

  useDndMonitor({
    onDragEnd(event: DragEndEvent) {
      const { active, over, delta } = event;
      if (over?.id !== "TargetContainer") {
        return;
      }
      const result = [...targetBoxes]; // copy existing items

      const { item, type } = active.data.current ?? {};
      const id = item.id;
      console.log({ item, type, delta, rect: active.rect, over, event });
      console.log({ result, id });

      if (type === ItemTypes.SourceElement) {
        result.push({ ...item, left: delta.x, top: delta.y });
        setTargetBoxes(result);
        return;
      }

      if (find(result, { id })) {
        // box has been moved
        const box = find(result, { id });
        if (box) {
          result.splice(result.indexOf(box), 1);
          const newBox = { ...box, left: item.left + delta.x, top: item.top + delta.y };
          result.push(newBox);
          setTargetBoxes(result);
        }
        return undefined;
      }
    },
  });

  function boxChanged(id: string) {
    const result = [...targetBoxes]; // copy existing items
    const box = find(result, { id });
    if (box) {
      result.splice(result.indexOf(box), 1);
      const newBox = { ...box };
      result.push(newBox);
      setTargetBoxes(result);
    }
  }

  return (
    <div ref={targetContainer} style={{ width: "100%", overflow: "scroll" }}>
      <div ref={setNodeRef} style={style}>
        {map(targetBoxes, (each) => (
          <Box key={each.id} item={each} callback={boxChanged} />
        ))}
      </div>
    </div>
  );
};
