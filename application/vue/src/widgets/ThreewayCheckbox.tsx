import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useCallback } from "react";

export default function ThreewayCheckbox({
  name,
  label,
  disabled,
}: Omit<CheckboxProps, "name"> & {
  readonly name: string[] | string;
  readonly label: string;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} trigger="onChecked" valuePropName="checked">
      <InnerThreeway disabled={disabled} label={label} />
    </Form.Item>
  );
}

function InnerThreeway({
  label,
  disabled,
  checked,
  onChecked,
}: Omit<CheckboxProps, "name"> & {
  readonly label: string;
  readonly onChecked?: (val: boolean | undefined) => void;
}) {
  const innerChange = useCallback(() => {
    let val;
    if (checked === undefined) {
      val = true;
    } else if (checked) {
      val = false;
    } else if (!checked) {
      val = undefined;
    }
    onChecked?.(val);
  }, [checked, onChecked]);

  return (
    <Checkbox checked={checked} disabled={disabled} indeterminate={checked === undefined} onChange={innerChange}>
      <b>{label}</b>
    </Checkbox>
  );
}
