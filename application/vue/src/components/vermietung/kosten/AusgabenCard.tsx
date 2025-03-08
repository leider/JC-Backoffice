import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import SingleSelect from "@/widgets/SingleSelect";
import { DynamicItem } from "@/widgets/DynamicItem";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import Kosten from "jc-shared/veranstaltung/kosten.ts";
import LabelCurrencyRow from "@/widgets/numericInputWidgets/LabelCurrencyRow.tsx";
import LabelCurrencyChangeableRow from "@/widgets/numericInputWidgets/LabelCurrencyChangeableRow.tsx";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function AusgabenCard() {
  const form = useFormInstance();

  const [summe, setSumme] = useState<number>(0);

  const fluegelstimmerEUR = useWatch(["kosten", "fluegelstimmerEUR"], {
    form,
    preserve: true,
  });

  const backlineEUR = useWatch(["kosten", "backlineEUR"], {
    form,
    preserve: true,
  });

  const technikAngebot1EUR = useWatch(["kosten", "technikAngebot1EUR"], {
    form,
    preserve: true,
  });

  const brauchtTechnik = useWatch("brauchtTechnik", {
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
    return verm.technik.fluegel && <LabelCurrencyRow label="Flügelstimmer" onChange={updateSumme} path={["kosten", "fluegelstimmerEUR"]} />;
  }

  const { lg } = useBreakpoint();
  return (
    <Collapsible amount={summe} label="Kosten / Ausgaben" noTopBorder={lg} suffix="ausgaben">
      <JazzRow>
        <Col span={6}>
          <NumberInput decimals={2} label="Gagen" name={["kosten", "gagenEUR"]} onChange={updateSumme} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect label="Steuer" name={["kosten", "gagenSteuer"]} onChange={updateSumme} options={steuerSaetze} />
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
                    return <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={kosten.gagenTotalEUR} />;
                  }}
                />
              );
            }}
          />
        </Col>
      </JazzRow>
      {new Vermietung(form.getFieldsValue(true)).brauchtTechnik ? fluegelZeile() : null}
      <LabelCurrencyChangeableRow label="Werbung 1" onChange={updateSumme} path={["kosten", "werbung1"]} />
      <LabelCurrencyChangeableRow label="Werbung 2" onChange={updateSumme} path={["kosten", "werbung2"]} />
      <LabelCurrencyChangeableRow label="Werbung 3" onChange={updateSumme} path={["kosten", "werbung3"]} />
      <LabelCurrencyChangeableRow label="Werbung 4" onChange={updateSumme} path={["kosten", "werbung4"]} />
      <LabelCurrencyChangeableRow label="Werbung 5" onChange={updateSumme} path={["kosten", "werbung5"]} />
      <LabelCurrencyChangeableRow label="Werbung 6" onChange={updateSumme} path={["kosten", "werbung6"]} />
      <LabelCurrencyRow label="Personal (unbar)" onChange={updateSumme} path={["kosten", "personal"]} />
      {new Vermietung(form.getFieldsValue(true)).brauchtTechnik ? (
        <>
          <LabelCurrencyRow disabled label="Backline Rockshop" onChange={updateSumme} path={["kosten", "backlineEUR"]} />
          <LabelCurrencyRow disabled label="Technik Zumietung" onChange={updateSumme} path={["kosten", "technikAngebot1EUR"]} />
        </>
      ) : null}
    </Collapsible>
  );
}
