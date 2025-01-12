import type { FC } from "react";
import { useMemo } from "react";
import { useDrop } from "react-dnd";
import type { DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { List } from "antd";
import { SourceElement } from "./SourceElement.tsx";
import { Category, InventoryElement } from "jc-shared/rider/inventory.ts";
import filter from "lodash/filter";

export const SourceContainer: FC<{
  cat: Category;
  sourceBoxes: InventoryElement[];
  dropCallback: (id: string) => void;
}> = ({ cat, sourceBoxes, dropCallback }) => {
  const boxes = useMemo(() => {
    return filter(sourceBoxes, { category: cat });
  }, [sourceBoxes, cat]);

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop: (item: DragItem) => {
        dropCallback(item.id);
        return undefined;
      },
    }),
    [sourceBoxes],
  );

  return (
    <div ref={drop}>
      <List bordered size="small" dataSource={boxes} renderItem={(each) => <SourceElement item={each} />} />
    </div>
  );
};
