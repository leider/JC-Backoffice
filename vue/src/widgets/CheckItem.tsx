import { Checkbox, CheckboxProps, Form } from "antd";
import React from "react";

export default function CheckItem({
  name,
  label,
  disabled,
  onChange,
}: Omit<CheckboxProps, "name"> & {
  name: string[] | string;
  label: string;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} valuePropName="checked">
      <Checkbox onChange={onChange} disabled={disabled}>
        <b>{label}</b>
      </Checkbox>
    </Form.Item>
  );
}
