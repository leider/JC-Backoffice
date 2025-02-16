import type { CSSProperties } from "react";
import { BoxParams } from "jc-shared/rider/rider.ts";
import map from "lodash/map";
import { useDroppable } from "@dnd-kit/core";
import { DraggableBox } from "./DraggableBox.tsx";
import cloneDeep from "lodash/cloneDeep";

const style: CSSProperties = {
  width: 800,
  height: 300,
  border: "1px solid black",
  position: "relative",
  backgroundSize: "200px 100px",
  backgroundPosition: "-2px -2px",
  backgroundImage: "-webkit-linear-gradient(#EEE 2px, transparent 2px),-webkit-linear-gradient(0, #EEE 2px, transparent 2px)\n",
};

export function TargetContainer({
  targetBoxes,
  setTargetBoxes,
}: {
  targetBoxes: BoxParams[];
  setTargetBoxes: (boxes: BoxParams[]) => void;
}) {
  const { setNodeRef } = useDroppable({ id: "TargetContainer" });

  function boxChanged() {
    setTargetBoxes(cloneDeep(targetBoxes));
  }

  return (
    <div style={{ width: "100%", overflow: "scroll" }}>
      <div ref={setNodeRef} style={style}>
        {map(targetBoxes, (each) => (
          <DraggableBox key={each.id} item={each} callback={boxChanged} />
        ))}
      </div>
    </div>
  );
}
