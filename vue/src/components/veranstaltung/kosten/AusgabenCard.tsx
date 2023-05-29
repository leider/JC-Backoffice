import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, FormInstance, Row } from "antd";
import OptionValues from "jc-shared/optionen/optionValues";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import SingleSelect from "@/widgets-react/SingleSelect";
import Kosten from "jc-shared/veranstaltung/kosten";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import Kasse from "jc-shared/veranstaltung/kasse";
import CheckItem from "@/widgets-react/CheckItem";
import { NumberInputWithDirectValue } from "@/widgets-react/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

interface AusgabenCardParams {
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
  onChange: (sum: number) => void;
  veranstaltung: Veranstaltung;
}
export default function AusgabenCard({ form, onChange, veranstaltung }: AusgabenCardParams) {
  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    updateSumme();
  }, [form, veranstaltung]);

  function updateSumme() {
    const veranst = new Veranstaltung(form.getFieldsValue(true));
    const sum = veranst.kasse.ausgabenOhneGage + veranst.kosten.totalEUR;
    setSumme(sum);
    onChange(sum);
  }

  const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

  function LabelCurrencyRow({ label, path }: { label: string; path: string[] }) {
    return (
      <Row gutter={12}>
        <Col span={18}>
          <Form.Item>
            <b>{label}:</b>
          </Form.Item>
        </Col>
        <Col span={6}>
          <NumberInput name={path} decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    );
  }

  function kassenZeile() {
    const kasse = new Kasse(form.getFieldValue("kasse"));
    return (
      kasse.istFreigegeben && (
        <Row gutter={12}>
          <Col span={18}>
            <Form.Item>
              <b>Abendkasse (ohne Gage):</b>
            </Form.Item>
          </Col>
          <Col span={6}>
            <NumberInputWithDirectValue value={kasse.ausgabenOhneGage} suffix="€" decimals={2} />
          </Col>
        </Row>
      )
    );
  }
  const { lg } = useBreakpoint();
  return (
    <CollapsibleForVeranstaltung suffix="ausgaben" label="Kosten / Ausgaben" noTopBorder={lg} amount={summe}>
      <Row gutter={12}>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label={"Gagen"} decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "gagenSteuer"]} label={"Steuer"} options={steuerSaetze} onChange={updateSumme} />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "deal"]} label={"Deal"} options={Kosten.deals} onChange={updateSumme} />
        </Col>
        <Col span={6}>
          <DynamicItem
            nameOfDepending={["kosten", "gagenEUR"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["kosten", "gagenSteuer"]}
                  renderWidget={() => {
                    const kosten = new Kosten(getFieldValue(["kosten"]));
                    return <NumberInputWithDirectValue label="Total" value={kosten.gagenTotalEUR} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <LabelCurrencyRow label="Backline Rockshop" path={["kosten", "backlineEUR"]} />
      <LabelCurrencyRow label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} />
      <LabelCurrencyRow label="Saalmiete" path={["kosten", "saalmiete"]} />
      <LabelCurrencyRow label="Werbung 1" path={["kosten", "werbung1"]} />
      <LabelCurrencyRow label="Werbung 2" path={["kosten", "werbung2"]} />
      <LabelCurrencyRow label="Werbung 3" path={["kosten", "werbung3"]} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} />
      {kassenZeile()}
      <Row gutter={12}>
        <CheckItem label="Gage in BAR an der Abendkasse" name={["kosten", "gagenBAR"]} />
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
