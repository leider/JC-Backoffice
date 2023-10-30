import { Col, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import React, { useContext } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";

export default function ArtistCard() {
  const context = useContext(VermietungContext);
  const optionen = context!.optionen;

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Künstler">
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
