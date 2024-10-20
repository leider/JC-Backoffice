import { Col, Row } from "antd";
import { TextField } from "@/widgets/TextField";
import { NumberInput } from "@/widgets/numericInputWidgets";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import SingleSelect from "@/widgets/SingleSelect";
import Kosten from "jc-shared/veranstaltung/kosten.ts";
import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { TimeField } from "@/widgets/TimeField.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";

export default function ArtistCard() {
  const { optionen } = useJazzContext();

  return (
    <Collapsible suffix="allgemeines" label="Künstler">
      <Row gutter={12}>
        <Col span={12}>
          <TextField name={["artist", "bandname"]} label="Bandname" />
        </Col>
        <Col span={6}>
          <NumberInput name={["artist", "numMusiker"]} label="Musiker" decimals={0} min={0} />
        </Col>
        <Col span={6}>
          <NumberInput name={["artist", "numCrew"]} label="Crew" decimals={0} min={0} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "deal"]} label="Deal" options={Kosten.deals} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <DynamicItem
            nameOfDepending={"startDate"}
            renderWidget={(getFieldValue) => {
              const startDate = getFieldValue("startDate");
              return <TimeField name={["artist", "getInForMasterDate"]} label="Band Get-In (informativ)" baseValue={startDate} />;
            }}
          />
        </Col>
        <Col span={12}>
          <SingleSelect
            name={["artist", "bandTransport"]}
            label="Transport"
            options={["Band kommt selbst", "Band abholen (Auto)", "Band abholen (Transporter)"]}
          />
        </Col>
      </Row>
    </Collapsible>
  );
}
