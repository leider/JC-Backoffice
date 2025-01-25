import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import React from "react";
import { TextField } from "@/widgets/TextField.tsx";
import { JazzRow } from "../JazzRow";

export default function LabelCurrencyChangeableRow({ label, path, onChange }: { label: string; path: string[]; onChange: () => void }) {
  return (
    <JazzRow>
      <Col span={18}>
        <TextField label={label} name={[path[0], path[1] + "Label"]} initialValue={label} />
      </Col>
      <Col span={6}>
        <NumberInput label="Betrag" name={path} decimals={2} suffix="€" onChange={onChange} />
      </Col>
    </JazzRow>
  );
}
