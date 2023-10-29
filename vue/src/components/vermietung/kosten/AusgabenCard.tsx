import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, FormInstance, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import SingleSelect from "@/widgets/SingleSelect";
import Kosten from "jc-shared/veranstaltung/kosten";
import { DynamicItem } from "@/widgets/DynamicItem";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TextField } from "@/widgets/TextField.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

interface AusgabenCardParams {
  form: FormInstance<Vermietung>;
}
export default function AusgabenCard({ form }: AusgabenCardParams) {
  const [summe, setSumme] = useState<number>(0);

  const fluegelstimmerEUR = Form.useWatch(["kosten", "fluegelstimmerEUR"], {
    form,
    preserve: true,
  });

  const backlineEUR = Form.useWatch(["kosten", "backlineEUR"], {
    form,
    preserve: true,
  });

  const technikAngebot1EUR = Form.useWatch(["kosten", "technikAngebot1EUR"], {
    form,
    preserve: true,
  });

  const brauchtTechnik = Form.useWatch("brauchtTechnik", {
    form,
    preserve: true,
  });

  useEffect(() => {
    updateSumme();
  }, [form, backlineEUR, technikAngebot1EUR, fluegelstimmerEUR, brauchtTechnik]);

  function updateSumme() {
    const verm = new Vermietung(form.getFieldsValue(true));
    let sum = verm.kosten.totalEUR;
    if (!verm.brauchtTechnik) {
      sum = sum - verm.kosten.backlineUndTechnikEUR;
    }
    setSumme(sum);
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

  function LabelCurrencyChangeableRow({ label, path }: { label: string; path: string[] }) {
    return (
      <Row gutter={12}>
        <Col span={18}>
          <TextField label={label} name={[path[0], path[1] + "Label"]} initialValue={label} />
        </Col>
        <Col span={6}>
          <NumberInput label="Betrag" name={path} decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    );
  }

  function fluegelZeile() {
    const verm = new Vermietung(form.getFieldsValue(true));
    return (
      verm.technik.fluegel && (
        <Row gutter={12}>
          <Col span={18}>
            <Form.Item>
              <b>Fluegelstimmer:</b>
            </Form.Item>
          </Col>
          <Col span={6}>
            <NumberInputWithDirectValue value={verm.kosten.fluegelstimmerEUR} suffix="€" decimals={2} />
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
      {new Vermietung(form.getFieldsValue(true)).brauchtTechnik && (
        <>
          <LabelCurrencyRow label="Backline Rockshop" path={["kosten", "backlineEUR"]} />
          <LabelCurrencyRow label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} />
          {fluegelZeile()}
        </>
      )}
      <LabelCurrencyChangeableRow label="Werbung 1" path={["kosten", "werbung1"]} />
      <LabelCurrencyChangeableRow label="Werbung 2" path={["kosten", "werbung2"]} />
      <LabelCurrencyChangeableRow label="Werbung 3" path={["kosten", "werbung3"]} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} />
    </CollapsibleForVeranstaltung>
  );
}
