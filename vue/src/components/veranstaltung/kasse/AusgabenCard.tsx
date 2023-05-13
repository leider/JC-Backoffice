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
}

export default function AusgabenCard({ form, veranstaltung }: AusgabenCardParams) {
  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    updateSumme();
  }, [veranstaltung]);

  function updateSumme() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    setSumme(kasse.einnahmeTotalEUR);
  }

  return (
    <CollapsibleForVeranstaltung suffix="kasse" label="Einnahmen Abendkasse" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput name={["kasse", "einnahmeTicketsEUR"]} label="Tickets (AK)" decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
        <Col span={8}>
          <NumberInput name={["kasse", "anzahlBesucherAK"]} label="Besucher gesamt" decimals={0} />
        </Col>
        <Col span={8}>
          <NumberInput name={["kasse", "einnahmeBankEUR"]} label="Bareinlage" decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges1Text"]} label="Sonstiges" />
        </Col>
        <Col span={8}>
          <NumberInput name={["kasse", "einnahmeSonstiges1EUR"]} label="Betrag" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges2Text"]} label="Sonstiges" />
        </Col>
        <Col span={8}>
          <NumberInput name={["kasse", "einnahmeSonstiges2EUR"]} label="Betrag" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
