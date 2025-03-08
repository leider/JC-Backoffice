import { DatePicker, Form } from "antd";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

export default function DateInput({
  name,
  label,
  required,
  save,
  focus,
}: {
  name: string[];
  label?: string;
  required?: boolean;
  save?: () => void;
  focus?: boolean;
}) {
  return (
    <Form.Item
      name={name}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      colon={false}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
    >
      <InternalPicker required={required} save={save} focus={focus} />
    </Form.Item>
  );
}

function InternalPicker({
  required,
  focus,
  save,
  value,
  onChange,
}: {
  required?: boolean;
  value?: string;
  onChange?: (value: string | undefined) => void;
  save?: () => void;
  focus?: boolean;
}) {
  const [val, setVal] = useState<Dayjs | undefined>();
  useEffect(() => {
    if (value) {
      setVal(dayjs(value));
    }
  }, [value]);
  return (
    <DatePicker
      value={val}
      onChange={(date) => onChange!(date?.toISOString())}
      format={["ll", "L", "l", "DDMMYY"]}
      required={required}
      onOpenChange={(open) => {
        if (!open) {
          save?.();
        }
      }}
      needConfirm={focus}
      autoFocus={focus}
    />
  );
}
