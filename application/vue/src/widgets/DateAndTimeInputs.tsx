import { DatePicker, Form } from "antd";
import React, { useCallback, useEffect, useState } from "react";
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
  const onChangeCallback = useCallback((date: Dayjs) => onChange!(date?.toISOString()), [onChange]);
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        save?.();
      }
    },
    [save],
  );

  return (
    <DatePicker
      autoFocus={focus}
      format={["ll", "L", "l", "DDMMYY"]}
      needConfirm={focus}
      onChange={onChangeCallback}
      onOpenChange={onOpenChange}
      required={required}
      value={val}
    />
  );
}
