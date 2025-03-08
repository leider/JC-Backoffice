import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useCallback, useEffect, useState } from "react";

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
  const [chegg, setChegg] = useState<boolean | undefined>(checked);

  useEffect(() => {
    setChegg(checked);
  }, [checked, chegg]);

  const innerChange = useCallback(() => {
    let val;
    if (chegg === undefined) {
      val = true;
    } else if (chegg) {
      val = false;
    } else if (!chegg) {
      val = undefined;
    }
    setChegg(val);
    onChecked?.(val);
  }, [chegg, onChecked]);

  return (
    <Checkbox checked={chegg} disabled={disabled} indeterminate={chegg === undefined} onChange={innerChange}>
      <b>{label}</b>
    </Checkbox>
  );
}
