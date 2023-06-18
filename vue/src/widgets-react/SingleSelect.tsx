import { Form, Select } from "antd";
import React, { useEffect, useState } from "react";
import { UsersAsOption } from "@/components/team/UserMultiSelect";

interface SingleSelectParams {
  name: string[] | string;
  label: string;
  options: string[];
  onChange?: (val: string) => void;
  initialValue?: string;
  required?: boolean;
}

export default function SingleSelect({ label, name, onChange, options, initialValue, required }: SingleSelectParams) {
  const [realOptions, setRealOptions] = useState<UsersAsOption[]>([]);
  useEffect(() => {
    if (!options) {
      return;
    }
    setRealOptions(options.map((opt) => ({ label: opt, value: opt })));
  }, [options]);
  return (
    <Form.Item
      label={label ? <b>{label}:</b> : ""}
      name={name}
      colon={false}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
      initialValue={initialValue}
    >
      <Select options={realOptions} onChange={onChange} />
    </Form.Item>
  );
}
