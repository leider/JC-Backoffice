import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { ReactNode, useState } from "react";
import { Col, Collapse, Row } from "antd";
import { formatToGermanNumberString } from "@/commons/utilityFunctions";
import { isNil } from "lodash";

export default function CollapsibleForVeranstaltung(props: {
  suffix: string;
  label: string;
  children: ReactNode;
  noTopBorder?: boolean;
  amount?: number;
}) {
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
        header={
          <Row>
            <Col flex={1}>
              <span className={`color-${props.suffix}`} style={{ fontSize: 14 }}>
                <b>{props.label}</b>
              </span>
            </Col>
            <Col flex="auto">&nbsp;</Col>
            {!isNil(props.amount) && (
              <Col>
                <span className={`color-${props.suffix}`} style={{ fontSize: 14 }}>
                  {formatToGermanNumberString(props.amount)} €
                </span>
              </Col>
            )}
          </Row>
        }
      >
        {props.children}
      </Collapse.Panel>
    </Collapse>
  );
}
