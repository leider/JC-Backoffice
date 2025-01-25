import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { ReactNode, useMemo, useState } from "react";
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
}: {
  suffix: string;
  label: string;
  children: ReactNode;
  noTopBorder?: boolean;
  amount?: number;
  uncollapsed?: boolean;
}) {
  const { isDarkMode } = useJazzContext();
  const [expanded, setExpanded] = useState<string | undefined>(uncollapsed ? undefined : "content");

  const { color } = colorsAndIconsForSections;
  const brightText = useMemo(() => (isDarkMode ? "#dcdcdc" : "#fff"), [isDarkMode]);

  const farbe = color(suffix as buttonType);
  return (
    <Collapse
      activeKey={expanded}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color={brightText} /> : <CaretRight color={brightText} />)}
      onChange={(key) => setExpanded(Array.isArray(key) ? key[0] : key)}
      style={{
        marginTop: noTopBorder ? "" : "16px",
        backgroundColor: farbe,
        borderColor: farbe,
        color: brightText,
      }}
      items={[
        {
          key: "content",
          style: { backgroundColor: farbe, borderColor: farbe, color: brightText },
          label: (
            <Row>
              <Col flex={1}>
                <Typography.Title style={{ margin: 0, color: brightText }} level={4}>
                  {label}
                </Typography.Title>
              </Col>
              <Col flex="auto">&nbsp;</Col>
              {!isNil(amount) && (
                <Col>
                  <Typography.Title style={{ margin: 0, color: brightText }} level={4}>
                    {formatToGermanNumberString(amount)} €
                  </Typography.Title>
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
