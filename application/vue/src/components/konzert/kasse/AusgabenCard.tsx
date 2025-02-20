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
    <Collapsible suffix="kasse" label="Ausgaben (Bar und mit Beleg)" noTopBorder={lg} amount={summe}>
      <JazzRow ref={refAusgaben}>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeCateringEUR"]}
            label="Catering"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeHelferEUR"]}
            label="Personal"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges1Text"]} label="Sonstiges" disabled={freigabe} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges1EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges2Text"]} label="Sonstiges" disabled={freigabe} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges2EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges3Text"]} label="Sonstiges" disabled={freigabe} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges3EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8} offset={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon
              ref={refAnBank}
              block
              text="Berechnen..."
              color={color("kasse")}
              onClick={calculateAnBank}
              alwaysText
              disabled={freigabe}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeBankEUR"]}
            label="An Bank"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
