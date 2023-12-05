import type { FC } from "react";
import React, { createContext, useCallback, useRef, useState } from "react";
import { Container } from "@/components/rider/Container.tsx";
import { DndProvider, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Col, Row } from "antd";
import { BoxParams } from "@/components/rider/types.ts";

export const BoxesContext = createContext<{
  sourceBoxes: BoxParams[];
  targetBoxes: BoxParams[];
  moveBox: (x: { containerId: string; id: string; left: number; top: number; title: string; initialOffset: XYCoord | null }) => void;
}>({
  sourceBoxes: [],
  targetBoxes: [],
  moveBox: () => {},
});

export const Rider: FC = () => {
  const cont1 = useRef<HTMLDivElement | null>(null);
  const cont2 = useRef<HTMLDivElement | null>(null);

  const [sourceBoxes, setSourceBoxes] = useState<BoxParams[]>([
    { id: "Rhodes", top: 20, left: 20, title: "Rhodes" },
    { id: "Drums", top: 180, left: 20, title: "Drums" },
  ]);

  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  const getDistance = useCallback(() => {
    if (cont1.current && cont2.current) {
      const left = cont1.current.getBoundingClientRect();
      const right = cont2.current.getBoundingClientRect();
      return { horizontal: right.x - left.x };
    }
    return { horizontal: 0 };
  }, [cont1, cont2]);

  const moveBox = useCallback(
    ({
      containerId,
      id,
      left,
      top,
      title,
      initialOffset,
    }: {
      containerId: string;
      id: string;
      left: number;
      top: number;
      title: string;
      initialOffset: XYCoord | null;
    }) => {
      const boxes = containerId === "source" ? sourceBoxes : targetBoxes;
      const setBoxes = containerId === "source" ? setSourceBoxes : setTargetBoxes;
      const oppositeBoxes = containerId !== "source" ? sourceBoxes : targetBoxes;
      const setOppositeBoxes = containerId !== "source" ? setSourceBoxes : setTargetBoxes;
      const alreadyIn = boxes.map((b) => b.id).includes(id);
      const result = [...boxes];
      if (alreadyIn) {
        const box = result.find((b) => b.id === id);
        if (box) {
          box.left = left;
          box.top = top;
        }
        setBoxes(result);
      } else {
        const distance = getDistance().horizontal;
        const newLeft = (initialOffset?.x || 0) > distance ? left + distance : left - distance;
        result.push({ id, left: newLeft, top, title });
        const otherBoxes = oppositeBoxes.filter((b) => b.id !== id);
        setBoxes(result);
        setOppositeBoxes(otherBoxes);
      }
    },
    [getDistance, sourceBoxes, targetBoxes],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <BoxesContext.Provider value={{ sourceBoxes, targetBoxes, moveBox }}>
        <Row gutter={16}>
          <Col span={6}>
            <div ref={cont1}>
              <Container id="source" />
            </div>
          </Col>
          <Col span={18}>
            <div ref={cont2}>
              <Container id="target" />
            </div>
          </Col>
        </Row>
      </BoxesContext.Provider>
    </DndProvider>
  );
};
