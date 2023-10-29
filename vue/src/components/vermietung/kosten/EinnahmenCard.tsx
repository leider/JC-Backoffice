import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, FormInstance, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

interface EinnahmenCardParams {
  form: FormInstance<Vermietung>;
}
export default function EinnahmenCard({ form }: EinnahmenCardParams) {
  const [summe, setSumme] = useState<number>(0);

  const saalmiete = Form.useWatch("saalmiete", {
    form,
    preserve: true,
  });

  useEffect(() => {
    updateSumme();
  }, [form, saalmiete]);

  function updateSumme() {
    const verm = new Vermietung(form.getFieldsValue(true));
    const miete = verm.saalmiete || 0;
    setSumme(miete);
  }

  return (
    <CollapsibleForVeranstaltung suffix="ausgaben" label="Einnahmen" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={12}>
          <NumberInput name="saalmiete" label={"Saalmiete"} decimals={2} suffix={"€"} required />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
