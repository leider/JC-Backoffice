import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, FormInstance, Row } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import { TextField } from "@/widgets-react/TextField";
import Kasse from "jc-shared/veranstaltung/kasse";

interface EinnahmenCardParams {
  form: FormInstance<Veranstaltung>;
  veranstaltung: Veranstaltung;
  disabled: boolean;
}

export default function EinnahmenCard({ form, veranstaltung, disabled }: EinnahmenCardParams) {
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
    setSumme(kasse.einnahmeTotalEUR);
    form.setFieldValue(["kasse", "endbestandEUR"], kasse.endbestandEUR);
  }

  return (
    <CollapsibleForVeranstaltung suffix="kasse" label="Einnahmen Abendkasse" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeTicketsEUR"]}
            label="Tickets (AK)"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput name={["kasse", "anzahlBesucherAK"]} label="Besucher gesamt" decimals={0} disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeBankEUR"]}
            label="Bareinlage"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges1Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeSonstiges1EUR"]}
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
          <TextField name={["kasse", "einnahmeSonstiges2Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeSonstiges2EUR"]}
            label="Betrag"
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
