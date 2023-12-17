import { Checkbox, CheckboxProps, Form } from "antd";
import React from "react";

export default function CheckItem(
  props: Omit<CheckboxProps, "name"> & {
    name: string[] | string;
    label: string;
  },
) {
  return (
    <Form.Item name={props.name} style={props.label ? {} : { marginBottom: 0 }} valuePropName="checked">
      <Checkbox onChange={props.onChange} disabled={props.disabled}>
        <b>{props.label}</b>
      </Checkbox>
    </Form.Item>
  );
}
