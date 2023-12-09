import type { FC } from "react";
import { useContext, useMemo } from "react";
import { useDrop } from "react-dnd";
import type { DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { BoxesContext } from "@/components/rider/Rider.tsx";
import { List } from "antd";
import { SourceElement } from "@/components/rider/SourceElement.tsx";
import { Category } from "@/components/rider/Inventory.ts";

export const SourceContainer: FC<{ cat: Category }> = ({ cat }) => {
  const { sourceBoxes, setSourceBoxes, targetBoxes, setTargetBoxes } = useContext(BoxesContext);

  const boxes = useMemo(() => {
    return sourceBoxes.filter((box) => box.category === cat);
  }, [sourceBoxes, cat]);

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop: (item: DragItem) => {
        const result = [...sourceBoxes];
        result.push({ ...item });
        setSourceBoxes(result);
        setTargetBoxes(targetBoxes.filter((b) => b.id !== item.id));
        return undefined;
      },
    }),
    [sourceBoxes, targetBoxes, setSourceBoxes, setTargetBoxes],
  );

  return (
    <div ref={drop}>
      <List bordered size="small" dataSource={boxes} renderItem={(each) => <SourceElement item={each} />} />
    </div>
  );
};
