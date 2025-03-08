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
    <Collapsible label="Künstler" suffix="allgemeines">
      <JazzRow>
        <Col span={12}>
          <MultiSelectWithTags label="Namen" name={["artist", "name"]} options={optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput decimals={2} label="Gage (Netto)" name={["kosten", "gagenEUR"]} suffix="€" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
