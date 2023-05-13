import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, FormInstance, Row } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import { TextField } from "@/widgets-react/TextField";
import Kasse from "jc-shared/veranstaltung/kasse";

interface AusgabenCardParams {
  form: FormInstance<Veranstaltung>;
  veranstaltung: Veranstaltung;
  disabled: boolean;
}

export default function AusgabenCard({ form, veranstaltung, disabled }: AusgabenCardParams) {
  const [readonly, setReadonly] = useState<boolean>(false);
  useEffect(() => {
    setReadonly(disabled);
  }, [disabled]);

  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    updateSumme();
  }, [veranstaltung]);

  function updateSumme() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    setSumme(kasse.ausgabenTotalEUR);
    form.setFieldValue(["kasse", "endbestandEUR"], kasse.endbestandEUR);
  }

  return (
    <CollapsibleForVeranstaltung suffix="kasse" label="Ausgaben (Bar und mit Beleg)" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeCateringEUR"]}
            label="Catering"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeHelferEUR"]}
            label="Personal"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges1Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges1EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges2Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges2EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges3Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges3EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8} offset={16}>
          <NumberInput
            name={["kasse", "ausgabeBankEUR"]}
            label="An Bank"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
