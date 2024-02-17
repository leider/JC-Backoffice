import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import Konzert from "../../../../../shared/konzert/konzert.ts";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import KonzertKalkulation from "../../../../../shared/konzert/konzertKalkulation.ts";
import { DynamicItem } from "@/widgets/DynamicItem";
import Eintrittspreise from "jc-shared/konzert/eintrittspreise";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";

interface EinnahmenCardParams {
  onChange: (sum: number) => void;
}
export default function EinnahmenCard({ onChange }: EinnahmenCardParams) {
  const konzertContext = useContext(KonzertContext);
  const { optionen } = useJazzContext();
  const form = konzertContext!.form;

  const [summe, setSumme] = useState<number>(0);
  useEffect(
    () => {
      updateSumme();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
  );

  function updateSumme() {
    const konzert = new Konzert(form.getFieldsValue(true));
    const kalk = new KonzertKalkulation(konzert);
    const sum = konzert.eintrittspreise.zuschuss + kalk.erwarteterOderEchterEintritt;
    setSumme(sum);
    onChange(sum);
  }

  return (
    <Collapsible suffix="ausgaben" label="Einnahmen / Eintritt / Zuschuss" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={12}>
          <PreisprofilSelect form={form} optionen={optionen} onChange={updateSumme} />
        </Col>
        <Col span={4}>
          <NumberInput name={["eintrittspreise", "preisprofil", "regulaer"]} label={"Reg"} decimals={2} suffix={"€"} disabled />
        </Col>
        <Col span={4}>
          <DynamicItem
            nameOfDepending={["eintrittspreise", "preisprofil"]}
            renderWidget={(getFieldValue) => {
              const eintritt = new Eintrittspreise(getFieldValue("eintrittspreise"));
              return <NumberInputWithDirectValue label={"Erm"} decimals={2} suffix={"€"} value={eintritt.ermaessigt} />;
            }}
          />
        </Col>
        <Col span={4}>
          <DynamicItem
            nameOfDepending={["eintrittspreise", "preisprofil"]}
            renderWidget={(getFieldValue) => {
              const eintritt = new Eintrittspreise(getFieldValue("eintrittspreise"));
              return <NumberInputWithDirectValue label={"Mitgl"} decimals={2} suffix={"€"} value={eintritt.mitglied} />;
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <NumberInput name={["kasse", "einnahmenReservix"]} label={"Reservix"} decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <NumberInput name={["eintrittspreise", "zuschuss"]} label={"Zuschüsse"} decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
        <Col span={12}>
          {form.getFieldValue(["kasse", "kassenfreigabe"]) ? (
            <NumberInput name={["kasse", "einnahmeTicketsEUR"]} label={"Abendkasse (Tickets)"} decimals={2} disabled suffix="€" />
          ) : (
            <NumberInput name={["eintrittspreise", "erwarteteBesucher"]} label={"Gäste (erw.)"} decimals={0} onChange={updateSumme} />
          )}
        </Col>
      </Row>
    </Collapsible>
  );
}
