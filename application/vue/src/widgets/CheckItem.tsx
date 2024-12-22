import { Checkbox, CheckboxProps, Form } from "antd";
import React from "react";

export default function CheckItem({
  name,
  label,
  disabled,
  onChange,
  save,
  focus,
}: Omit<CheckboxProps, "name"> & {
  name: string[] | string;
  label?: string;
  save?: () => void;
  focus?: boolean;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} valuePropName="checked">
      <Checkbox
        autoFocus={focus}
        onChange={(val) => {
          onChange?.(val);
        }}
        disabled={disabled}
        onBlur={save}
      >
        {label && <b>{label}</b>}
      </Checkbox>
    </Form.Item>
  );
}
