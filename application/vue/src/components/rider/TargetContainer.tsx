import type { CSSProperties, FC } from "react";
import { useRef } from "react";
import { BoxParams } from "jc-shared/rider/rider.ts";
import find from "lodash/find";
import map from "lodash/map";
import { useDroppable } from "@dnd-kit/core";
import { DraggableBox } from "./DraggableBox.tsx";

const style: CSSProperties = {
  width: 800,
  height: 300,
  border: "1px solid black",
  position: "relative",
  backgroundSize: "200px 100px",
  backgroundPosition: "-2px -2px",
  backgroundImage: "-webkit-linear-gradient(#EEE 2px, transparent 2px),-webkit-linear-gradient(0, #EEE 2px, transparent 2px)\n",
};

export const TargetContainer: FC<{
  targetBoxes: BoxParams[];
  setTargetBoxes: (boxes: BoxParams[]) => void;
}> = ({ targetBoxes, setTargetBoxes }) => {
  const targetContainer = useRef<HTMLDivElement | null>(null);

  const { setNodeRef } = useDroppable({
    id: "TargetContainer",
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
          <DraggableBox key={each.id} item={each} callback={boxChanged} />
        ))}
      </div>
    </div>
  );
};
