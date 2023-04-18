import { Form, Select } from "antd";
import React, { useEffect, useState } from "react";

export default function SingleSelect(props: { name: string[]; label: string; options: string[] }) {
  const [realOptions, setRealOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    if (!props.options) {
      return;
    }
    setRealOptions(props.options.map((opt) => ({ label: opt, value: opt })));
  }, [props.options]);
  return (
    <Form.Item label={<b>{props.label}:</b>} name={props.name}>
      <Select options={realOptions} />
    </Form.Item>
  );
}
