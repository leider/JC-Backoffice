import { Col, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function ArtistCard() {
  const { optionen } = useJazzContext();

  return (
    <Collapsible suffix="allgemeines" label="Künstler">
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
      </Row>
    </Collapsible>
  );
}
