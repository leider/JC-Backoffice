import { Checkbox, CheckboxProps, Form } from "antd";
import React from "react";

export default function CheckItem(props: Omit<CheckboxProps, "name"> & { name: string[]; label: string }) {
  return (
    <Form.Item name={props.name} valuePropName="checked">
      <Checkbox onChange={props.onChange}>
        <b>{props.label}</b>
      </Checkbox>
    </Form.Item>
  );
}
