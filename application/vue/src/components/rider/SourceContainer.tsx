import React, { useMemo } from "react";
import { Collapse, List } from "antd";
import { SourceElement } from "./SourceElement.tsx";
import { Category, InventoryElement } from "jc-shared/rider/inventory.ts";
import filter from "lodash/filter";
import { useDroppable } from "@dnd-kit/core";
import map from "lodash/map";

export function SourceContainerAll({ sourceBoxes }: { sourceBoxes: InventoryElement[] }) {
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

  return <Collapse ref={setNodeRef} defaultActiveKey="Keys" accordion items={sourceComponents} />;
}

function SourceContainer({ cat, sourceBoxes }: { cat: Category; sourceBoxes: InventoryElement[] }) {
  const boxes = useMemo(() => {
    return filter(sourceBoxes, { category: cat });
  }, [sourceBoxes, cat]);

  return <List bordered size="small" dataSource={boxes} renderItem={(each) => <SourceElement item={each} />} />;
}
