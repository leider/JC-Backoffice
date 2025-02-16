import React, { CSSProperties, FC, useCallback, useState } from "react";
import { BoxParams } from "jc-shared/rider/rider.ts";
import { useDraggable } from "@dnd-kit/core";
import { ItemTypes } from "./types.ts";
import { Box } from "./Box.tsx";

const style: CSSProperties = {
  position: "absolute",
  cursor: "move",
};

export const DraggableBox: FC<{ item: BoxParams; callback: () => void }> = ({ item, callback }) => {
  const [disableDrag, setDisableDrag] = useState(false);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
    data: { type: ItemTypes.BOX, item },
    attributes: { tabIndex: -1 },
    disabled: disableDrag,
  });

  const dialogOpenedOrClosed = useCallback(
    (open: boolean) => {
      setDisableDrag(open);
      if (!open) {
        callback();
      }
    },
    [callback],
  );

  return (
    <div style={{ ...style, left: item.left, top: item.top }} ref={setNodeRef} {...attributes} {...listeners}>
      <Box item={item} callback={dialogOpenedOrClosed} />
    </div>
  );
};
