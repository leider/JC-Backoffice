import type { FC } from "react";
import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { TargetContainer } from "@/components/rider/TargetContainer.tsx";
import { DndProvider, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Col, Row } from "antd";
import { BoxParams } from "@/components/rider/types.ts";
import { SourceContainer } from "@/components/rider/SourceContainer.tsx";

export const BoxesContext = createContext<{
  sourceBoxes: BoxParams[];
  targetBoxes: BoxParams[];
  moveBox: (x: { containerId: string; offset?: XYCoord | null; delta?: XYCoord | null; item: BoxParams }) => void;
}>({
  sourceBoxes: [],
  targetBoxes: [],
  moveBox: () => {},
});

const inventory = [
  { id: "Rhodes", top: 0, left: 0, content: <div style={{ width: 120, height: 60 }}>Rhodes</div> },
  { id: "Drums", top: 0, left: 0, content: <div style={{ width: 40, height: 100 }}>Drums</div> },
];
export const Rider: FC = () => {
  const targetContainer = useRef<HTMLDivElement | null>(null);

  const [sourceBoxes, setSourceBoxes] = useState<BoxParams[]>(inventory);

  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  const [isTouch, setIsTouch] = useState<boolean>(false);
  useEffect(() => {
    try {
      document.createEvent("TouchEvent");
      setIsTouch(true);
    } catch {
      setIsTouch(false);
    }
  }, []);

  const moveBox = useCallback(
    ({ containerId, offset, delta, item }: { containerId: string; offset?: XYCoord | null; delta?: XYCoord | null; item: BoxParams }) => {
      const isSource = containerId === "source";
      const boxes = isSource ? sourceBoxes : targetBoxes;
      const setBoxes = isSource ? setSourceBoxes : setTargetBoxes;
      const oppositeBoxes = !isSource ? sourceBoxes : targetBoxes;
      const setOppositeBoxes = !isSource ? setSourceBoxes : setTargetBoxes;
      const alreadyIn = boxes.map((b) => b.id).includes(item.id);
      const result = [...boxes];
      if (!isSource && alreadyIn) {
        const box = result.find((b) => b.id === item.id);
        if (box) {
          const left = Math.round(item.left + (delta?.x || 0));
          const top = Math.round(item.top + (delta?.y || 0));
          box.left = left;
          box.top = top;
          return setBoxes(result);
        }
      }
      let newLeft = 0;
      let newTop = 0;
      if (!isSource) {
        const rect = targetContainer.current?.getBoundingClientRect();
        newLeft = (offset?.x || 0) - (rect?.x || 0);
        newTop = (offset?.y || 0) - (rect?.y || 0);
      }

      const otherBoxes = oppositeBoxes.filter((b) => b.id !== item.id);
      result.push({ ...item, left: newLeft, top: newTop });
      setBoxes(result);
      setOppositeBoxes(otherBoxes);
    },
    [sourceBoxes, targetBoxes],
  );

  return (
    <DndProvider backend={isTouch ? TouchBackend : HTML5Backend}>
      <BoxesContext.Provider value={{ sourceBoxes, targetBoxes, moveBox }}>
        <Row gutter={16} style={{ paddingTop: "32px" }}>
          <Col span={6}>
            <SourceContainer />
          </Col>
          <Col span={18}>
            <div ref={targetContainer}>
              <TargetContainer />
            </div>
          </Col>
        </Row>
      </BoxesContext.Provider>
    </DndProvider>
  );
};
