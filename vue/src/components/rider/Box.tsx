import type { CSSProperties, FC } from "react";
import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { BoxParams, InventoryElement, ItemTypes } from "@/components/rider/types.ts";
import { Col, Input, Popover, Radio, Row, Slider } from "antd";

const style: CSSProperties = {
  position: "absolute",
  border: "0.2px solid gray",
  backgroundColor: "white",
  cursor: "move",
};

export const Box: FC<{ item: BoxParams }> = ({ item }) => {
  const [degree, setDegree] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);

  useEffect(() => {
    setDegree(item.degree);
    setLevel(item.level || 0);
  }, [item]);
  function PopContent(inv: InventoryElement) {
    return (
      <>
        {inv.photo && (
          <div>
            <img src={`img/${inv.photo?.src}`} alt="Popup Photo" />
          </div>
        )}
        <Row>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
            <b>Ebene:</b>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: "unten", value: 0 },
                { label: "mitte", value: 1 },
                { label: "oben", value: 2 },
              ]}
              value={level}
              onChange={(e) => {
                item.level = e.target.value;
                setLevel(item.level);
              }}
            />
          </Col>
        </Row>
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
    <div ref={drag} style={{ ...style, left: item.left, top: item.top, rotate: `${degree}deg`, zIndex: level }}>
      <Popover title={item.title} content={PopContent(item)} trigger="click">
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
