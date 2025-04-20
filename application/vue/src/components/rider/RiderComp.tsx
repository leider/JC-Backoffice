import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TargetContainer } from "./TargetContainer.tsx";
import { Col, ConfigProvider, List, Row, Typography } from "antd";
import { SourceContainerAll } from "./SourceContainer.tsx";
import { extraEckig, extraRund, Inventory, InventoryElement } from "jc-shared/rider/inventory.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";
import map from "lodash/map";
import filter from "lodash/filter";
import reject from "lodash/reject";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import noop from "lodash/noop";
import { ItemTypes } from "./types.ts";
import find from "lodash/find";
import { Box } from "./Box.tsx";
import { v4 as uuidv4 } from "uuid";

export function RiderComp({
  targetBoxes,
  setTargetBoxes,
}: {
  readonly targetBoxes?: BoxParams[];
  readonly setTargetBoxes?: (boxes: BoxParams[]) => void;
}) {
  const [sourceBoxes, setSourceBoxes] = useState<InventoryElement[]>(Inventory);

  useEffect(() => {
    const boxIds = map(targetBoxes, "id");
    const sources = filter(Inventory, (inv) => !boxIds.includes(inv.id));
    if (!find(sources, (elem) => elem.id.startsWith("Extra Eckig"))) {
      sources.push({ ...extraEckig, id: "Extra Eckig" + uuidv4() });
    }
    if (!find(sources, (elem) => elem.id.startsWith("Extra Rund"))) {
      sources.push({ ...extraRund, id: "Extra Rund" + uuidv4() });
    }
    setSourceBoxes(sources); // remove added box from predefined sources
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
        const calcX = delta.x - (rect.left - (actiEvenet.x - actiEvenet.offsetX));
        const calcY = delta.y - (rect.top - (actiEvenet.y - actiEvenet.offsetY));

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
      }
    },
    [setTargetBoxes, targetBoxes],
  );

  const itemsWithComment = useMemo(() => filter(targetBoxes, (box) => !!box.comment), [targetBoxes]);

  const renderItem = useCallback(
    (item: BoxParams) => (
      <List.Item>
        <List.Item.Meta title={item.title} />
        {item.comment}
      </List.Item>
    ),
    [],
  );
  return (
    <DndContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <DragOverlay>{dragging ? <Box callback={noop} item={dragging} /> : null}</DragOverlay>
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
          <TargetContainer setTargetBoxes={setTargetBoxes!} targetBoxes={targetBoxes!} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Typography.Title level={5}>Hilfe</Typography.Title>
          <ul>
            <li>Ziehe Elemente von links nach rechts</li>
            <li>Zum Entfernen wieder nach links ziehen</li>
            <li>Rechts kannst Du mit Rechtsklick bearbeiten</li>
            <li>Speichern nicht vergessen!</li>
          </ul>
        </Col>
        <Col span={16}>
          <Typography.Title level={5}>Infos</Typography.Title>
          <List dataSource={itemsWithComment} itemLayout="horizontal" renderItem={renderItem} />
        </Col>
      </Row>
    </DndContext>
  );
}
