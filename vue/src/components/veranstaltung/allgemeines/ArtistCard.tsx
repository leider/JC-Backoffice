import OptionValues from "jc-shared/optionen/optionValues";
import { Col, Row } from "antd";
import { TextField } from "@/widgets-react/TextField";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import MultiSelectWithTags from "@/widgets-react/MultiSelectWithTags";
import SingleSelect from "@/widgets-react/SingleSelect";
import Kosten from "jc-shared/veranstaltung/kosten";
import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";

export default function ArtistCard(props: { optionen: OptionValues }) {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Künstler">
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
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={props.optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "deal"]} label="Deal" options={Kosten.deals} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
