import type { CSSProperties, FC } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./types.ts";
import { Col, Input, Popover, Radio, Row, Slider } from "antd";
import TextArea from "antd/es/input/TextArea";
import { InventoryElement } from "jc-shared/rider/inventory.ts";
import { BoxParams } from "jc-shared/rider/rider.ts";

const style: CSSProperties = {
  position: "absolute",
  cursor: "move",
};

const styleInner: CSSProperties = {
  border: "0.2px solid gray",
  backgroundColor: "white",
};

const styleText: CSSProperties = {
  textAlign: "center",
  fontSize: "10px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

export const Box: FC<{ item: BoxParams; callback: (id: string) => void }> = ({ item, callback }) => {
  const [degree, setDegree] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const isExtra = useMemo(() => item.category === "Extra", [item]);

  useEffect(() => {
    setDegree(item.degree);
    setLevel(item.level || 0);
    setWidth(item.width);
    setHeight(item.height);
    setTitle(item.title);
    setComment(item.comment || "");
  }, [item]);

  function RotateAndLevelRow() {
    return (
      <Row style={{ minWidth: 400 }}>
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
    );
  }
  function PopContent(inv: InventoryElement) {
    return (
      <>
        {inv.photo && (
          <div>
            <img src={`/riderimg/${inv.photo?.src}`} alt="Popup Photo" />
          </div>
        )}
        {RotateAndLevelRow()}
      </>
    );
  }

  function PopContentForExtras() {
    return (
      <>
        <Row>
          <Col span={24}>
            <b>Titel:</b>
            <Input
              onChange={(e) => {
                item.title = e.target.value;
                setTitle(item.title);
              }}
              value={title}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <b>Kommentar:</b>
            <TextArea
              style={{ height: 150 }}
              onChange={(e) => {
                item.comment = e.target.value;
                setComment(item.comment);
              }}
              value={comment}
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <b>Breite:</b>
            <Slider
              min={0}
              max={150}
              onChange={(width) => {
                item.width = width;
                setWidth(width);
              }}
              value={width}
            />
          </Col>
          <Col span={12}>
            <b>Höhe:</b>
            <Slider
              min={0}
              max={150}
              onChange={(height) => {
                item.height = height;
                setHeight(height);
              }}
              value={height}
            />
          </Col>
        </Row>
        {RotateAndLevelRow()}
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
    <div ref={drag} style={{ ...style, left: item.left, top: item.top }}>
      <Popover
        title={title}
        content={isExtra ? PopContentForExtras() : PopContent(item)}
        trigger="click"
        onOpenChange={() => callback(item.id)}
      >
        <div style={{ ...styleInner, width, height, rotate: `${degree}deg`, zIndex: level }}>
          {item.img ? (
            <img src={"/riderimg/" + item.img.src} width={item.img.width} height={item.img.height} alt={item.title} />
          ) : (
            <div style={styleText}>{title}</div>
          )}
        </div>
      </Popover>
    </div>
  );
};
