import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { ReactNode, useState } from "react";
import { Col, Collapse, Row } from "antd";
import { formatToGermanNumberString } from "@/commons/utilityFunctions.ts";
import isNil from "lodash/isNil";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";

export default function Collapsible({
  amount,
  children,
  label,
  noTopBorder,
  suffix,
}: {
  suffix: string;
  label: string;
  children: ReactNode;
  noTopBorder?: boolean;
  amount?: number;
}) {
  const [expanded, setExpanded] = useState<string>("content");

  const { color } = colorsAndIconsForSections;
  const farbe = color(suffix as buttonType);
  return (
    <Collapse
      activeKey={expanded}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      onChange={(key) => setExpanded(Array.isArray(key) ? key[0] : key)}
      style={{
        marginTop: noTopBorder ? "" : "16px",
        backgroundColor: farbe,
        borderColor: farbe,
        color: "#FFF",
      }}
      items={[
        {
          key: "content",
          style: { backgroundColor: farbe, borderColor: farbe, color: "#FFF" },
          label: (
            <Row>
              <Col flex={1}>
                <span style={{ fontSize: 18, color: "#FFF" }}>
                  <b>{label}</b>
                </span>
              </Col>
              <Col flex="auto">&nbsp;</Col>
              {!isNil(amount) && (
                <Col>
                  <span style={{ fontSize: 18, color: "#FFF" }}>{formatToGermanNumberString(amount)} €</span>
                </Col>
              )}
            </Row>
          ),
          children,
        },
      ]}
    />
  );
}
