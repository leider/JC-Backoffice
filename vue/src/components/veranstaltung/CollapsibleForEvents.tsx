import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { CSSProperties, ReactNode, useState } from "react";
import { Collapse } from "antd";

export default function CollapsibleForEvents(props: { suffix: string; label: string; children: ReactNode; style?: CSSProperties }) {
  const [expanded, setExpanded] = useState("content");
  return (
    <Collapse
      className={`tab-${props.suffix}`}
      activeKey={expanded}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      onChange={(key) => setExpanded(key)}
      style={props.style}
    >
      <Collapse.Panel
        key="content"
        className={`color-${props.suffix}`}
        header={<span className={`color-${props.suffix}`}>{props.label}</span>}
      >
        {props.children}
      </Collapse.Panel>
    </Collapse>
  );
}
