import React, { useMemo } from "react";
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

function FluegelZeile() {
  const form = useFormInstance();
  const verm = new Vermietung(form.getFieldsValue(true));
  return verm.technik.fluegel && <LabelCurrencyRow label="Flügelstimmer" path={["kosten", "fluegelstimmerEUR"]} />;
}

const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

export default function AusgabenCard() {
  const form = useFormInstance();

  const brauchtTechnik = useWatch("brauchtTechnik", { form, preserve: true });
  const kosten = useWatch("kosten", { form, preserve: true });

  const summe = useMemo(() => {
    const k = new Kosten(kosten);
    const sum = k.totalEUR;
    if (!brauchtTechnik) {
      return sum - k.backlineUndTechnikEUR;
    }
    return sum;
  }, [brauchtTechnik, kosten]);

  const { lg } = useBreakpoint();
  return (
    <Collapsible amount={summe} label="Kosten / Ausgaben" noTopBorder={lg} suffix="ausgaben">
      <JazzRow>
        <Col span={6}>
          <NumberInput decimals={2} label="Gagen" name={["kosten", "gagenEUR"]} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect label="Steuer" name={["kosten", "gagenSteuer"]} options={steuerSaetze} />
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
      {brauchtTechnik ? <FluegelZeile /> : null}
      <LabelCurrencyChangeableRow label="Werbung 1" path={["kosten", "werbung1"]} />
      <LabelCurrencyChangeableRow label="Werbung 2" path={["kosten", "werbung2"]} />
      <LabelCurrencyChangeableRow label="Werbung 3" path={["kosten", "werbung3"]} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} />
      {brauchtTechnik ? (
        <>
          <LabelCurrencyRow disabled label="Backline Rockshop" path={["kosten", "backlineEUR"]} />
          <LabelCurrencyRow disabled label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} />
        </>
      ) : null}
    </Collapsible>
  );
}
