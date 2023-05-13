import { Form, Select } from "antd";
import React, { useEffect, useState } from "react";

interface SingleSelectParams {
  name: string[];
  label: string;
  options: string[];
  onChange?: () => void;
  initialValue?: string;
}

export default function SingleSelect({ label, name, onChange, options, initialValue }: SingleSelectParams) {
  const [realOptions, setRealOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    if (!options) {
      return;
    }
    setRealOptions(options.map((opt) => ({ label: opt, value: opt })));
  }, [options]);
  return (
    <Form.Item label={<b>{label}:</b>} name={name} colon={false} initialValue={initialValue}>
      <Select options={realOptions} onChange={onChange} />
    </Form.Item>
  );
}
