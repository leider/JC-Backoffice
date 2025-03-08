import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";

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
    const verm = new Vermietung(form.getFieldsValue(true));
    const miete = verm.saalmiete || 0;
    setSumme(miete);
  }

  return (
    <Collapsible amount={summe} label="Einnahmen" noTopBorder suffix="ausgaben">
      <JazzRow>
        <Col span={12}>
          <NumberInput decimals={2} label="Saalmiete" name="saalmiete" required suffix="€" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
