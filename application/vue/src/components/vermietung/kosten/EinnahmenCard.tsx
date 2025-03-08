import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function EinnahmenCard() {
  const form = useFormInstance();

  const saalmiete = useWatch("saalmiete", { form, preserve: true });

  const summe = useMemo(() => {
    return saalmiete ?? 0;
  }, [saalmiete]);

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
