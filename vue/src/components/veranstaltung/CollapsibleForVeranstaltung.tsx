import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { ReactNode, useState } from "react";
import { Collapse } from "antd";

export default function CollapsibleForVeranstaltung(props: { suffix: string; label: string; children: ReactNode; noTopBorder?: boolean }) {
  const [expanded, setExpanded] = useState("content");
  return (
    <Collapse
      className={`tab-${props.suffix}`}
      activeKey={expanded}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      onChange={(key) => setExpanded(key)}
      style={props.noTopBorder ? {} : { marginTop: "16px" }}
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
