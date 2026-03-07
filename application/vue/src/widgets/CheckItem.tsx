import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useCallback } from "react";
import { NamePath } from "antd/es/form/interface";
import { CheckboxChangeEvent } from "antd/es/checkbox";

function InternalCheckbox({
  focus,
  onChange,
  disabled,
  label,
  checked,
}: CheckboxProps & {
  readonly label?: string;
  readonly focus?: boolean;
}) {
  const onChangeCallback = useCallback(
    (e: CheckboxChangeEvent) => {
      onChange?.(e);
    },
    [onChange],
  );

  return (
    <Checkbox autoFocus={focus} checked={checked} disabled={disabled} onChange={onChangeCallback}>
      {label ? <b>{label}</b> : null}
    </Checkbox>
  );
}

export default function CheckItem({
  name,
  label,
  disabled,
  onChange,
  focus,
}: Omit<CheckboxProps, "name"> & {
  readonly name: NamePath;
  readonly label?: string;
  readonly focus?: boolean;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} valuePropName="checked">
      <InternalCheckbox disabled={disabled} focus={focus} label={label} onChange={onChange} />
    </Form.Item>
  );
}
