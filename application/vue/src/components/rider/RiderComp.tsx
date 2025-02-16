import React, { useCallback, useEffect, useState } from "react";
import { TargetContainer } from "./TargetContainer.tsx";
import { Col, ConfigProvider, Row, Typography } from "antd";
import { SourceContainerAll } from "./SourceContainer.tsx";
import { Inventory, InventoryElement } from "jc-shared/rider/inventory.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";
import map from "lodash/map";
import filter from "lodash/filter";
import reject from "lodash/reject";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import noop from "lodash/noop";
import { ItemTypes } from "./types.ts";
import find from "lodash/find";
import { Box } from "./Box.tsx";

export function RiderComp({ targetBoxes, setTargetBoxes }: { targetBoxes?: BoxParams[]; setTargetBoxes?: (boxes: BoxParams[]) => void }) {
  const [sourceBoxes, setSourceBoxes] = useState<InventoryElement[]>(Inventory);

  useEffect(() => {
    const boxIds = map(targetBoxes, "id");
    setSourceBoxes(filter(Inventory, (inv) => !boxIds.includes(inv.id))); // remove added box from predefined sources
  }, [targetBoxes]);

  const [dragging, setDragging] = useState<BoxParams | null>(null);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setDragging(event.active.data.current?.item);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragging(null);
      const { active, over, delta, activatorEvent } = event;
      if (delta.x === 0 && delta.y === 0) {
        return;
      }
      const { item, type } = active.data.current ?? {};
      const id = item.id;

      if (over?.id === "SourceContainer") {
        setTargetBoxes?.(reject(targetBoxes, { id }));
        return;
      }
      if (over?.id !== "TargetContainer") {
        return; // dropped into nowhere
      }

      const result = [...(targetBoxes ?? [])]; // copy existing items

      if (type === ItemTypes.SourceElement) {
        const actiEvenet = activatorEvent as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const rect = over.rect;
        const calcX = delta.x - (rect.left - actiEvenet.x);
        const calcY = actiEvenet.y - (rect.top - delta.y);
        result.push({ ...item, left: calcX, top: calcY });
        setTargetBoxes?.(result);
        return;
      }

      if (find(result, { id })) {
        // box has been moved
        const box = find(result, { id });
        if (box) {
          box.left = item.left + delta.x;
          box.top = item.top + delta.y;
          result.splice(result.indexOf(box), 1);
          result.push(box);
          setTargetBoxes?.(result);
        }
        return;
      }
    },
    [setTargetBoxes, targetBoxes],
  );

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
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
            <SourceContainerAll sourceBoxes={sourceBoxes} />
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
}
