import { DatePicker, Form } from "antd";
import React, { useCallback, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useFormItemInTableStyle } from "@/widgets/EditableTable/useFormItemInTableStyle.ts";

export default function DateInput({
  name,
  label,
  required,
  useInTable,
}: {
  readonly name: string[];
  readonly label?: string;
  readonly required?: boolean;
  readonly useInTable?: boolean;
}) {
  return (
    <Form.Item
      colon={false}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      name={name}
      noStyle={useInTable}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
    >
      <InternalPicker required={required} useInTable={useInTable} />
    </Form.Item>
  );
}

function InternalPicker({
  required,
  value,
  onChange,
  useInTable,
}: {
  readonly required?: boolean;
  readonly value?: string;
  readonly onChange?: (value: string | undefined) => void;
  readonly useInTable?: boolean;
}) {
  const style = useFormItemInTableStyle(useInTable);
  const val = useMemo(() => {
    if (value) {
      return dayjs(value);
    }
  }, [value]);
  const onChangeCallback = useCallback((date: Dayjs | null) => onChange!(date?.toISOString()), [onChange]);

  return (
    <DatePicker
      format={["ll", "L", "l", "DDMMYY"]}
      onChange={onChangeCallback}
      required={required}
      style={{ ...style, width: "100%" }}
      value={val}
    />
  );
}
