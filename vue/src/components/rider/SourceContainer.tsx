import type { FC } from "react";
import { useContext, useMemo } from "react";
import { useDrop } from "react-dnd";
import type { DragItem } from "./types.ts";
import { ItemTypes } from "./types.ts";
import { BoxesContext } from "@/components/rider/Rider.tsx";
import { Row } from "antd";
import { SourceElement } from "@/components/rider/SourceElement.tsx";

export const SourceContainer: FC = () => {
  const boxesContext = useContext(BoxesContext);

  const boxes = useMemo(() => boxesContext.sourceBoxes, [boxesContext]);

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
    <div ref={drop} style={{ height: "600px", border: "1px solid black" }}>
      <Row gutter={12} style={{ maxHeight: "600px", overflowX: "auto" }}>
        {boxes.map((each) => {
          return <SourceElement key={each.id} id={each.id} top={each.top} left={each.left} content={each.content} />;
        })}
      </Row>
    </div>
  );
};
