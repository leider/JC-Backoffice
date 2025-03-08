import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import React from "react";
import { TextField } from "@/widgets/TextField.tsx";
import { JazzRow } from "../JazzRow";

export default function LabelCurrencyChangeableRow({ label, path }: { readonly label: string; readonly path: string[] }) {
  return (
    <JazzRow>
      <Col span={18}>
        <TextField initialValue={label} label={label} name={[path[0], path[1] + "Label"]} />
      </Col>
      <Col span={6}>
        <NumberInput decimals={2} label="Betrag" name={path} suffix="€" />
      </Col>
    </JazzRow>
  );
}
