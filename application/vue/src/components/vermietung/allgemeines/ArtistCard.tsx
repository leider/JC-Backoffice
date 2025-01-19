import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function ArtistCard() {
  const { optionen } = useJazzContext();

  return (
    <Collapsible suffix="allgemeines" label="Künstler">
      <JazzRow>
        <Col span={12}>
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
