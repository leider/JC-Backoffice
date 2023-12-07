import type { FC } from "react";
import { useContext, useMemo } from "react";
import { useDrop } from "react-dnd";
import type { Category, DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { BoxesContext } from "@/components/rider/Rider.tsx";
import { List } from "antd";
import { SourceElement } from "@/components/rider/SourceElement.tsx";

export const SourceContainer: FC<{ cat: Category }> = ({ cat }) => {
  const boxesContext = useContext(BoxesContext);

  const boxes = useMemo(() => {
    return boxesContext.sourceBoxes.filter((box) => box.category === cat);
  }, [boxesContext, cat]);

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop(item: DragItem) {
        boxesContext.moveBox({ containerId: "source", item: item });
        return undefined;
      },
    }),
    [boxesContext],
  );

  return (
    <>
      <h4 style={{ marginLeft: 12, marginBottom: 0 }}>{cat}:</h4>
      <div ref={drop}>
        <List bordered size="small" dataSource={boxes} renderItem={(each) => <SourceElement item={each} />} />
      </div>
    </>
  );
};
