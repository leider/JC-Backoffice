import type { CSSProperties, FC } from "react";
import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { BoxParams, InventoryElement, ItemTypes } from "@/components/rider/types.ts";
import { Popover, Slider } from "antd";

const style: CSSProperties = {
  position: "absolute",
  border: "0.2px solid gray",
  backgroundColor: "white",
  cursor: "move",
};

export const Box: FC<{ item: BoxParams }> = ({ item }) => {
  const [degree, setDegree] = useState<number>(0);

  useEffect(() => {
    setDegree(item.degree);
  }, [item]);
  function popContent(inv: InventoryElement) {
    return (
      <>
        {inv.photo && (
          <div>
            <img src={`img/${inv.photo?.src}`} alt="Popup Photo" />
          </div>
        )}
        <b>Drehen:</b>
        <Slider
          min={0}
          max={359}
          onChange={(deg) => {
            item.degree = deg;
            setDegree(deg);
          }}
          value={degree}
        />
      </>
    );
  }

  const [, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: item,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item],
  );

  return (
    <div ref={drag} style={{ ...style, left: item.left, top: item.top, rotate: `${degree}deg` }}>
      <Popover title={item.title} content={popContent(item)} trigger="click">
        <div style={{ width: item.width, height: item.height }}>
          {item.img ? (
            <img src={"img/" + item.img.src} width={item.img.width} height={item.img.height} alt={item.title} />
          ) : (
            <div style={{ textAlign: "center", fontSize: "10px", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
              {item.title}
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
};
