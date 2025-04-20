import { Col } from "antd";
import { TextField } from "@/widgets/TextField";
import { NumberInput } from "@/widgets/numericInputWidgets";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import SingleSelect from "@/widgets/SingleSelect";
import Kosten from "jc-shared/veranstaltung/kosten.ts";
import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { TimeField } from "@/widgets/TimeField.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useWatch } from "antd/es/form/Form";

export default function ArtistCard() {
  const { optionen } = useJazzContext();
  const startDate = useWatch("startDate", { preserve: true });

  return (
    <Collapsible label="Künstler" suffix="allgemeines">
      <JazzRow>
        <Col span={12}>
          <TextField label="Bandname" name={["artist", "bandname"]} />
        </Col>
        <Col span={6}>
          <NumberInput decimals={0} label="Musiker" min={0} name={["artist", "numMusiker"]} />
        </Col>
        <Col span={6}>
          <NumberInput decimals={0} label="Crew" min={0} name={["artist", "numCrew"]} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <MultiSelectWithTags label="Namen" name={["artist", "name"]} options={optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput decimals={2} label="Gage (Netto)" name={["kosten", "gagenEUR"]} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect label="Deal" name={["kosten", "deal"]} options={Kosten.deals} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <TimeField baseValue={startDate} label="Band Get-In (informativ)" name={["artist", "getInForMasterDate"]} />;
        </Col>
        <Col span={12}>
          <SingleSelect
            label="Transport"
            name={["artist", "bandTransport"]}
            options={["Band kommt selbst", "Band abholen (Auto)", "Band abholen (Transporter)"]}
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
