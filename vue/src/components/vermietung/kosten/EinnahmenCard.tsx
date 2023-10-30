import React, { useContext, useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";

export default function EinnahmenCard() {
  const context = useContext(VermietungContext);
  const form = context!.form;

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
