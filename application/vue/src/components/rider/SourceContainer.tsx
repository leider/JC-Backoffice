import type { FC } from "react";
import { useMemo } from "react";
import { List } from "antd";
import { SourceElement } from "./SourceElement.tsx";
import { Category, InventoryElement } from "jc-shared/rider/inventory.ts";
import filter from "lodash/filter";
import { useDroppable } from "@dnd-kit/core";

export const SourceContainer: FC<{
  cat: Category;
  sourceBoxes: InventoryElement[];
}> = ({ cat, sourceBoxes }) => {
  const boxes = useMemo(() => {
    return filter(sourceBoxes, { category: cat });
  }, [sourceBoxes, cat]);

  const { setNodeRef } = useDroppable({ id: "SourceContainer" });

  return (
    <div ref={setNodeRef}>
      <List bordered size="small" dataSource={boxes} renderItem={(each) => <SourceElement item={each} />} />
    </div>
  );
};
