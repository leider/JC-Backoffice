import { DatePicker, Form } from "antd";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

export default function DateInput(props: { name: string[]; label: string; required?: boolean }) {
  const { name, label, required } = props;

  return (
    <Form.Item
      name={name}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label}:</b> : ""}
      colon={false}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
    >
      <InternalPicker required={required} />
    </Form.Item>
  );
}

function InternalPicker(props: { required?: boolean; value?: string; onChange?: (value: string | undefined) => void }) {
  const [val, setVal] = useState<Dayjs | undefined>();
  useEffect(() => {
    if (props.value) {
      setVal(dayjs(props.value));
    }
  }, [props.value]);
  return (
    <DatePicker
      value={val}
      onChange={(date) => props.onChange!(date.toISOString())}
      format={["ll", "L", "l", "DDMMYY"]}
      required={props.required}
    />
  );
}
