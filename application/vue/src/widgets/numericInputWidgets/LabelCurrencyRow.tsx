import { Col, Form } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import React from "react";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function LabelCurrencyRow({
  label,
  path,
  disabled,
}: {
  readonly label: string;
  readonly path: string[];
  readonly disabled?: boolean;
}) {
  return (
    <JazzRow>
      <Col span={18}>
        <Form.Item>
          <b>{label + ":"}</b>
        </Form.Item>
      </Col>
      <Col span={6}>
        <NumberInput decimals={2} disabled={disabled} name={path} suffix="€" />
      </Col>
    </JazzRow>
  );
}
