import { Col, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";

export default function ArtistCard({ artists }: { artists: string[] }) {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Künstler">
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
