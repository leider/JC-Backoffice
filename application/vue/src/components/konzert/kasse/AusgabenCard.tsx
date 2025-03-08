import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { KassenContext } from "@/components/konzert/kasse/KassenContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useWatch } from "antd/es/form/Form";

export default function AusgabenCard() {
  const form = useFormInstance();
  const { refAnBank, refAusgaben } = useContext(KassenContext);
  const { color } = colorsAndIconsForSections;

  const freigabe = useWatch(["kasse", "kassenfreigabe"]);

  const [summe, setSumme] = useState<number>(0);
  useEffect(updateSumme);

  function updateSumme() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    setSumme(kasse.ausgabenTotalEUR);
    form.setFieldValue("endbestandEUR", kasse.endbestandEUR);
  }
  const { lg } = useBreakpoint();

  function calculateAnBank() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    const anBank = kasse.einnahmeTotalEUR - kasse.ausgabenOhneGage;
    form.setFieldValue(["kasse", "ausgabeBankEUR"], anBank);
    updateSumme();
  }

  return (
    <Collapsible amount={summe} label="Ausgaben (Bar und mit Beleg)" noTopBorder={lg} suffix="kasse">
      <JazzRow ref={refAusgaben}>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Catering"
            name={["kasse", "ausgabeCateringEUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Personal"
            name={["kasse", "ausgabeHelferEUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={freigabe} label="Sonstiges" name={["kasse", "ausgabeSonstiges1Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Betrag"
            name={["kasse", "ausgabeSonstiges1EUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={freigabe} label="Sonstiges" name={["kasse", "ausgabeSonstiges2Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Betrag"
            name={["kasse", "ausgabeSonstiges2EUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={freigabe} label="Sonstiges" name={["kasse", "ausgabeSonstiges3Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Betrag"
            name={["kasse", "ausgabeSonstiges3EUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col offset={8} span={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon
              alwaysText
              block
              color={color("kasse")}
              disabled={freigabe}
              onClick={calculateAnBank}
              ref={refAnBank}
              text="Berechnen..."
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="An Bank"
            name={["kasse", "ausgabeBankEUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
