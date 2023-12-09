import type { FC } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TargetContainer } from "@/components/rider/TargetContainer.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Col, Collapse, ConfigProvider, Row } from "antd";
import { BoxParams } from "@/components/rider/types.ts";
import { SourceContainer } from "@/components/rider/SourceContainer.tsx";
import { Category, InventoryElement, rawInventory } from "@/components/rider/Inventory.ts";

export const RiderComp: FC<{ targetBoxes: BoxParams[]; setTargetBoxes: (boxes: BoxParams[]) => void }> = ({
  targetBoxes,
  setTargetBoxes,
}) => {
  useEffect(() => {
    try {
      document.createEvent("TouchEvent");
      setIsTouch(true);
    } catch {
      setIsTouch(false);
    }
  }, []);

  const [sourceBoxes, setSourceBoxes] = useState<InventoryElement[]>(rawInventory);
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    const boxIds = targetBoxes.map((box) => box.id);
    setSourceBoxes(rawInventory.filter((inv) => !boxIds.includes(inv.id))); // remove added box from predefined sources
  }, [targetBoxes]);

  const itemDroppedOntoSource = useCallback(
    (id: string) => {
      setTargetBoxes(targetBoxes.filter((b) => b.id !== id));
    },
    [targetBoxes],
  );

  const sourceComponents = useMemo(
    () =>
      (["Keys", "Drums", "Bass", "Guitar", "Extra"] as Category[]).map((key) => {
        return {
          key,
          label: key as string,
          children: <SourceContainer cat={key} sourceBoxes={sourceBoxes} dropCallback={itemDroppedOntoSource} />,
        };
      }),
    [sourceBoxes, itemDroppedOntoSource],
  );

  return (
    <DndProvider backend={isTouch ? TouchBackend : HTML5Backend}>
      <Row gutter={16}>
        <Col span={4}>
          <ConfigProvider
            theme={{
              components: {
                Collapse: {
                  contentPadding: 0,
                },
              },
            }}
          >
            <Collapse defaultActiveKey="Keys" accordion items={sourceComponents} />
          </ConfigProvider>
        </Col>
        <Col span={20}>
          <TargetContainer targetBoxes={targetBoxes} setTargetBoxes={setTargetBoxes} />
        </Col>
      </Row>
    </DndProvider>
  );
};
