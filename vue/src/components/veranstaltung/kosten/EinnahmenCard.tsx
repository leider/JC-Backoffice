import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, FormInstance, Row } from "antd";
import OptionValues from "jc-shared/optionen/optionValues";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import PreisprofilSelect from "@/widgets-react/PreisprofilSelect";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import VeranstaltungKalkulation from "jc-shared/veranstaltung/veranstaltungKalkulation";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import Eintrittspreise from "jc-shared/veranstaltung/eintrittspreise";
import { NumberInputWithDirectValue } from "@/widgets-react/numericInputWidgets/NumericInputs";

interface EinnahmenCardParams {
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
  onChange: () => void;
  veranstaltung: Veranstaltung;
}
export default function EinnahmenCard({ form, optionen, onChange, veranstaltung }: EinnahmenCardParams) {
  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    updateSumme();
  }, [form, veranstaltung]);

  function updateSumme() {
    const veranst = new Veranstaltung(form.getFieldsValue(true));
    const kalk = new VeranstaltungKalkulation(veranst);
    const sum = veranst.eintrittspreise.zuschuss + kalk.erwarteterOderEchterEintritt;
    setSumme(sum);
    onChange();
  }

  return (
    <CollapsibleForVeranstaltung suffix="kalkulation" label="Einnahmen / Eintritt / Zuschuss" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={12}>
          <PreisprofilSelect form={form} optionen={optionen} onChange={updateSumme} />
        </Col>
        <Col span={4}>
          <NumberInput name={["eintrittspreise", "preisprofil", "regulaer"]} label={"Reg"} decimals={2} suffix={"€"} disabled />;
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
              return <NumberInputWithDirectValue label={"Erm"} decimals={2} suffix={"€"} value={eintritt.mitglied} />;
            }}
          />
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
    </CollapsibleForVeranstaltung>
  );
}
