import { Col, Form } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import React from "react";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function LabelCurrencyRow({
  label,
  path,
  disabled,
  onChange,
}: {
  label: string;
  path: string[];
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <JazzRow>
      <Col span={18}>
        <Form.Item>
          <b>{label}:</b>
        </Form.Item>
      </Col>
      <Col span={6}>
        <NumberInput name={path} decimals={2} suffix="€" onChange={onChange} disabled={disabled} />
      </Col>
    </JazzRow>
  );
}
