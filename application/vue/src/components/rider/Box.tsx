import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { Col, Input, Popover, Radio, RadioChangeEvent, Row, Slider } from "antd";
import TextArea from "antd/es/input/TextArea";
import { BoxParams } from "jc-shared/rider/rider.ts";

const styleInner: CSSProperties = {
  border: "0.2px solid gray",
  backgroundColor: "white",
};

type RotateAndLevelRowProps = {
  readonly item: BoxParams;
  readonly degree: number;
  readonly setDegree: (degree: number) => void;
  readonly level: number;
  readonly setLevel: (level: number) => void;
};

function RotateAndLevelRow({ item, degree, setDegree, level, setLevel }: RotateAndLevelRowProps) {
  const degreeChanged = useCallback(
    (deg: number) => {
      item.degree = deg;
      setDegree(deg);
    },
    [item, setDegree],
  );
  const levelChanged = useCallback(
    (e: RadioChangeEvent) => {
      item.level = e.target.value;
      setLevel(item.level);
    },
    [item, setLevel],
  );
  return (
    <Row style={{ minWidth: 400 }}>
      <Col span={12}>
        <b>Drehen:</b>
        <Slider max={359} min={0} onChange={degreeChanged} value={degree} />
      </Col>
      <Col span={12}>
        <b>Ebene:</b>
        <Radio.Group
          buttonStyle="solid"
          onChange={levelChanged}
          optionType="button"
          options={[
            { label: "unten", value: 0 },
            { label: "mitte", value: 1 },
            { label: "oben", value: 2 },
          ]}
          value={level}
        />
      </Col>
    </Row>
  );
}

type PopContentProps = {
  readonly comment: string;
  readonly setComment: (comment: string) => void;
} & RotateAndLevelRowProps;

function PopContent({ item, comment, setComment, degree, setDegree, level, setLevel }: PopContentProps) {
  const commentChanged = useCallback(
    (e: { target: { value: string } }) => {
      item.comment = e.target.value;
      setComment(item.comment);
    },
    [item, setComment],
  );

  return (
    <>
      {item.photo ? (
        <div>
          <img alt="Popup Photo" src={`/riderimg/${item.photo?.src}`} />
        </div>
      ) : null}
      <b>Kommentar:</b>
      <TextArea onChange={commentChanged} style={{ height: 150 }} value={comment} />
      <RotateAndLevelRow degree={degree} item={item} level={level} setDegree={setDegree} setLevel={setLevel} />
    </>
  );
}

type PopContentForExtrasProps = {
  readonly title: string;
  readonly setTitle: (comment: string) => void;
  readonly width: number;
  readonly setWidth: (width: number) => void;
  readonly height: number;
  readonly setHeight: (height: number) => void;
} & PopContentProps;

function PopContentForExtras({
  item,
  comment,
  setComment,
  degree,
  setDegree,
  level,
  setLevel,
  title,
  setTitle,
  width,
  setWidth,
  height,
  setHeight,
}: PopContentForExtrasProps) {
  const titleChanged = useCallback(
    (e: { target: { value: string } }) => {
      item.title = e.target.value;
      setTitle(item.title);
    },
    [item, setTitle],
  );

  const commentChanged = useCallback(
    (e: { target: { value: string } }) => {
      item.comment = e.target.value;
      setComment(item.comment);
    },
    [item, setComment],
  );

  const widthChanged = useCallback(
    (width: number) => {
      item.width = width;
      setWidth(width);
    },
    [item, setWidth],
  );

  const heightChanged = useCallback(
    (height: number) => {
      item.height = height;
      setHeight(height);
    },
    [item, setHeight],
  );

  return (
    <>
      <Row>
        <Col span={24}>
          <b>Titel:</b>
          <Input onChange={titleChanged} value={title} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <b>Kommentar:</b>
          <TextArea onChange={commentChanged} style={{ height: 150 }} value={comment} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <b>Breite:</b>
          <Slider max={150} min={0} onChange={widthChanged} value={width} />
        </Col>
        <Col span={12}>
          <b>Höhe:</b>
          <Slider max={150} min={0} onChange={heightChanged} value={height} />
        </Col>
      </Row>
      <RotateAndLevelRow degree={degree} item={item} level={level} setDegree={setDegree} setLevel={setLevel} />
    </>
  );
}

export function Box({ item, callback }: { readonly item: BoxParams; readonly callback: (open: boolean) => void }) {
  const [degree, setDegree] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const isExtra = useMemo(() => item.category === "Extra", [item]);

  const styleText: CSSProperties = useMemo(
    () => ({
      textAlign: "center",
      fontSize: "10px",
      lineHeight: `${height}px`,
    }),
    [height],
  );

  useEffect(() => {
    setDegree(item.degree);
    setLevel(item.level || 0);
    setWidth(item.width);
    setHeight(item.height);
    setTitle(item.title);
    setComment(item.comment || "");
  }, [item]);

  return (
    <Popover
      content={
        isExtra ? (
          <PopContentForExtras
            comment={comment}
            degree={degree}
            height={height}
            item={item}
            level={level}
            setComment={setComment}
            setDegree={setDegree}
            setHeight={setHeight}
            setLevel={setLevel}
            setTitle={setTitle}
            setWidth={setWidth}
            title={title}
            width={width}
          />
        ) : (
          <PopContent
            comment={comment}
            degree={degree}
            item={item}
            level={level}
            setComment={setComment}
            setDegree={setDegree}
            setLevel={setLevel}
          />
        )
      }
      onOpenChange={callback}
      title={title}
      trigger="contextMenu"
    >
      <div style={{ ...styleInner, width, height, rotate: `${degree}deg`, zIndex: level, borderRadius: item.isCircle ? "50%" : 0 }}>
        {item.img ? (
          <img alt={item.title} height={item.img.height} src={`/riderimg/${item.img.src}`} width={item.img.width} />
        ) : (
          <div style={styleText}>
            <span style={{ display: "inline-block", verticalAlign: "middle", lineHeight: "normal" }}>{title}</span>
          </div>
        )}
      </div>
    </Popover>
  );
}
