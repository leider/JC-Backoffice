import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { ReactNode, useState } from "react";
import { Col, Collapse, Row, Typography } from "antd";
import { formatToGermanNumberString } from "@/commons/utilityFunctions.ts";
import isNil from "lodash/isNil";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function Collapsible({
  amount,
  children,
  label,
  noTopBorder,
  suffix,
  uncollapsed = false,
  noMoneySign = false,
}: {
  suffix: string;
  label: string;
  children: ReactNode;
  noTopBorder?: boolean;
  amount?: number;
  uncollapsed?: boolean;
  noMoneySign?: boolean;
}) {
  const { brightText } = useJazzContext();
  const [expanded, setExpanded] = useState<string | undefined>(uncollapsed ? undefined : "content");

  const { color } = colorsAndIconsForSections;

  const farbe = color(suffix as buttonType);
  return (
    <Collapse
      activeKey={expanded}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color={brightText} /> : <CaretRight color={brightText} />)}
      items={[
        {
          key: "content",
          style: { backgroundColor: farbe, borderColor: farbe, color: brightText },
          label: (
            <Row>
              <Col flex={1}>
                <Typography.Title level={4} style={{ margin: 0, color: brightText }}>
                  {label}
                </Typography.Title>
              </Col>
              <Col flex="auto">&nbsp;</Col>
              {!isNil(amount) && (
                <Col>
                  <Typography.Title level={4} style={{ margin: 0, color: brightText }}>
                    {noMoneySign ? amount : `${formatToGermanNumberString(amount)} €`}
                  </Typography.Title>
                </Col>
              )}
            </Row>
          ),
          children,
        },
      ]}
      onChange={(key) => setExpanded(Array.isArray(key) ? key[0] : key)}
      style={{
        marginTop: noTopBorder ? "" : "16px",
        backgroundColor: farbe,
        borderColor: farbe,
        color: brightText,
      }}
    />
  );
}
