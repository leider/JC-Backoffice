import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import SingleSelect from "@/widgets/SingleSelect";
import { DynamicItem } from "@/widgets/DynamicItem";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import Kosten from "jc-shared/veranstaltung/kosten.ts";
import LabelCurrencyRow from "@/widgets/numericInputWidgets/LabelCurrencyRow.tsx";
import LabelCurrencyChangeableRow from "@/widgets/numericInputWidgets/LabelCurrencyChangeableRow.tsx";

export default function AusgabenCard() {
  const context = useContext(VermietungContext);
  const form = context!.form;

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

  useEffect(
    () => {
      updateSumme();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, backlineEUR, technikAngebot1EUR, fluegelstimmerEUR, brauchtTechnik],
  );

  function updateSumme() {
    const verm = new Vermietung(form.getFieldsValue(true));
    let sum = verm.kosten.totalEUR;
    if (!verm.brauchtTechnik) {
      sum = sum - verm.kosten.backlineUndTechnikEUR;
    }
    setSumme(sum);
  }

  const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

  function fluegelZeile() {
    const verm = new Vermietung(form.getFieldsValue(true));
    return verm.technik.fluegel && <LabelCurrencyRow label="Flügelstimmer" path={["kosten", "fluegelstimmerEUR"]} onChange={updateSumme} />;
  }

  const { lg } = useBreakpoint();
  return (
    <Collapsible suffix="ausgaben" label="Kosten / Ausgaben" noTopBorder={lg} amount={summe}>
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
      {new Vermietung(form.getFieldsValue(true)).brauchtTechnik && fluegelZeile()}
      <LabelCurrencyChangeableRow label="Werbung 1" path={["kosten", "werbung1"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 2" path={["kosten", "werbung2"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 3" path={["kosten", "werbung3"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 4" path={["kosten", "werbung4"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 5" path={["kosten", "werbung5"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 6" path={["kosten", "werbung6"]} onChange={updateSumme} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} onChange={updateSumme} />
      {new Vermietung(form.getFieldsValue(true)).brauchtTechnik && (
        <>
          <LabelCurrencyRow label="Backline Rockshop" path={["kosten", "backlineEUR"]} onChange={updateSumme} disabled />
          <LabelCurrencyRow label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} onChange={updateSumme} disabled />
        </>
      )}
    </Collapsible>
  );
}
