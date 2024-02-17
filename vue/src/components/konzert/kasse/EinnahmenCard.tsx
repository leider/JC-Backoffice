import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import { KasseCardProps } from "@/components/konzert/kasse/TabKasse";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";

export default function EinnahmenCard({ disabled }: KasseCardProps) {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  const [readonly, setReadonly] = useState<boolean>(false);
  useEffect(() => {
    setReadonly(disabled);
  }, [disabled]);

  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    updateSumme();
  });

  function updateSumme() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    setSumme(kasse.einnahmeTotalEUR);
    form.setFieldValue("endbestandEUR", kasse.endbestandEUR);
  }

  return (
    <Collapsible suffix="kasse" label="Einnahmen Abendkasse" noTopBorder amount={summe}>
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
    </Collapsible>
  );
}
