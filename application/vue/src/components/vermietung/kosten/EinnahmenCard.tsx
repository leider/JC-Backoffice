import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

export default function EinnahmenCard() {
  const form = useFormInstance();

  const [summe, setSumme] = useState<number>(0);

  const saalmiete = useWatch("saalmiete", {
    form,
    preserve: true,
  });

  useEffect(
    () => updateSumme(), // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, saalmiete],
  );

  function updateSumme() {
    const verm = new Vermietung(form?.getFieldsValue(true));
    const miete = verm.saalmiete || 0;
    setSumme(miete);
  }

  return (
    <Collapsible suffix="ausgaben" label="Einnahmen" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={12}>
          <NumberInput name="saalmiete" label={"Saalmiete"} decimals={2} suffix={"€"} required />
        </Col>
      </Row>
    </Collapsible>
  );
}
