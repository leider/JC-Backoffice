import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useCallback, useEffect, useState } from "react";

export default function ThreewayCheckbox({
  name,
  label,
  disabled,
}: Omit<CheckboxProps, "name"> & {
  name: string[] | string;
  label: string;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} valuePropName="checked" trigger="onChecked">
      <InnerThreeway label={label} disabled={disabled} />
    </Form.Item>
  );
}

function InnerThreeway({
  label,
  disabled,
  checked,
  onChecked,
}: Omit<CheckboxProps, "name"> & {
  label: string;
  onChecked?: (val: boolean | undefined) => void;
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
    <Checkbox indeterminate={chegg === undefined} checked={chegg} onChange={innerChange} disabled={disabled}>
      <b>{label}</b>
    </Checkbox>
  );
}
