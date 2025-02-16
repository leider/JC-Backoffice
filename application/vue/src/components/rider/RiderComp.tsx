import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TargetContainer } from "./TargetContainer.tsx";
import { Col, Collapse, ConfigProvider, Row, Typography } from "antd";
import { SourceContainer } from "./SourceContainer.tsx";
import { Category, Inventory, InventoryElement } from "jc-shared/rider/inventory.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";
import map from "lodash/map";
import filter from "lodash/filter";
import reject from "lodash/reject";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import noop from "lodash/noop";
import { ItemTypes } from "./types.ts";
import find from "lodash/find";
import { Box } from "./Box.tsx";

export const RiderComp: FC<{ targetBoxes?: BoxParams[]; setTargetBoxes?: (boxes: BoxParams[]) => void }> = ({
  targetBoxes,
  setTargetBoxes,
}) => {
  const [sourceBoxes, setSourceBoxes] = useState<InventoryElement[]>(Inventory);

  useEffect(() => {
    const boxIds = map(targetBoxes, "id");
    setSourceBoxes(filter(Inventory, (inv) => !boxIds.includes(inv.id))); // remove added box from predefined sources
  }, [targetBoxes]);

  const sourceComponents = useMemo(
    () =>
      map(["Keys", "Drums", "Bass", "Guitar", "Extra"] as Category[], (key) => ({
        key,
        label: key === "Drums" ? "Drums / Percussion" : (key as string),
        children: <SourceContainer cat={key} sourceBoxes={sourceBoxes} />,
      })),
    [sourceBoxes],
  );

  const [dragging, setDragging] = useState<BoxParams | null>(null);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setDragging(event.active.data.current?.item);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragging(null);
      const { active, over, delta } = event;
      const { item, type } = active.data.current ?? {};
      const id = item.id;

      if (over?.id === "SourceContainer") {
        setTargetBoxes?.(reject(targetBoxes, { id }));
        return;
      }
      const result = [...(targetBoxes ?? [])]; // copy existing items

      if (type === ItemTypes.SourceElement) {
        result.push({ ...item, left: 50, top: 50 });
        setTargetBoxes?.(result);
        return;
      }

      if (find(result, { id })) {
        // box has been moved
        const box = find(result, { id });
        if (box) {
          result.splice(result.indexOf(box), 1);
          const newBox = { ...box, left: item.left + delta.x, top: item.top + delta.y };
          result.push(newBox);
          setTargetBoxes?.(result);
        }
        return undefined;
      }
    },
    [setTargetBoxes, targetBoxes],
  );

  const activationConstraint = {
    delay: 100,
    tolerance: 5,
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const sensors = useSensors(mouseSensor, touchSensor);
  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
      <DragOverlay>{dragging ? <Box item={dragging} callback={noop} /> : null}</DragOverlay>
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
          <TargetContainer targetBoxes={targetBoxes!} setTargetBoxes={setTargetBoxes!} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Typography.Title level={5}>Hilfe</Typography.Title>
          <ul>
            <li>Ziehe Elemente von links nach rechts</li>
            <li>Zum Entfernen wieder nach links ziehen</li>
            <li>Rechts kannst Du mit Rechtsklick bearbeiten</li>
            <li>Speichern nicht vergessen!</li>
          </ul>
        </Col>
      </Row>
    </DndContext>
  );
};
