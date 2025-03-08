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
  readonly name: string[];
  readonly label?: string;
  readonly required?: boolean;
  readonly save?: () => void;
  readonly focus?: boolean;
}) {
  return (
    <Form.Item
      colon={false}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      name={name}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
    >
      <InternalPicker focus={focus} required={required} save={save} />
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
  readonly required?: boolean;
  readonly value?: string;
  readonly onChange?: (value: string | undefined) => void;
  readonly save?: () => void;
  readonly focus?: boolean;
}) {
  const [val, setVal] = useState<Dayjs | undefined>();
  useEffect(() => {
    if (value) {
      setVal(dayjs(value));
    }
  }, [value]);
  return (
    <DatePicker
      autoFocus={focus}
      format={["ll", "L", "l", "DDMMYY"]}
      needConfirm={focus}
      onChange={(date) => onChange!(date?.toISOString())}
      onOpenChange={(open) => {
        if (!open) {
          save?.();
        }
      }}
      required={required}
      value={val}
    />
  );
}
