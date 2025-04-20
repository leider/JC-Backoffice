import React, { useCallback, useMemo } from "react";
import { Collapse, List } from "antd";
import { SourceElement } from "./SourceElement.tsx";
import { Category, InventoryElement } from "jc-shared/rider/inventory.ts";
import filter from "lodash/filter";
import { useDroppable } from "@dnd-kit/core";
import map from "lodash/map";

export function SourceContainerAll({ sourceBoxes }: { readonly sourceBoxes: InventoryElement[] }) {
  const sourceComponents = useMemo(
    () =>
      map(["Keys", "Drums", "Bass", "Guitar", "Extra"] as Category[], (key) => ({
        key,
        label: key === "Drums" ? "Drums / Percussion" : (key as string),
        children: <SourceContainer cat={key} sourceBoxes={sourceBoxes} />,
      })),
    [sourceBoxes],
  );
  const { setNodeRef } = useDroppable({ id: "SourceContainer" });

  return <Collapse accordion defaultActiveKey="Keys" items={sourceComponents} ref={setNodeRef} />;
}

function SourceContainer({ cat, sourceBoxes }: { readonly cat: Category; readonly sourceBoxes: InventoryElement[] }) {
  const boxes = useMemo(() => {
    return filter(sourceBoxes, { category: cat });
  }, [sourceBoxes, cat]);

  const renderItem = useCallback((each: InventoryElement) => <SourceElement item={each} />, []);

  return <List bordered dataSource={boxes} renderItem={renderItem} size="small" />;
}
