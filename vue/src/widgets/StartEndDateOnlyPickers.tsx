import { DatePicker, Form } from "antd";
import * as React from "react";
import { Dayjs } from "dayjs";
import { NamePath } from "rc-field-form/es/interface";

interface StartEndDateOnlyPickersProps {
  name: NamePath;
  label?: string;
  dependency?: NamePath;
  onChange?: () => void;
}

export default function StartEndDateOnlyPickers({ name, label, dependency, onChange }: StartEndDateOnlyPickersProps) {
  return (
    <Form.Item
      label={label ? <b>{label}:</b> : ""}
      name={name}
      style={label ? {} : { marginBottom: 0 }}
      dependencies={dependency ? [dependency] : undefined}
      rules={
        dependency
          ? [
              ({ getFieldValue }) => ({
                validator: (_, value: Dayjs[]) => {
                  const start: Dayjs = getFieldValue(dependency).start;
                  return value[0].isAfter(start.subtract(7, "days"))
                    ? Promise.resolve()
                    : Promise.reject(new Error("Darf frühestens 1 Woche vor der Veranstaltung liegen"));
                },
              }),
            ]
          : []
      }
    >
      <DatePicker.RangePicker allowClear={false} format={"ddd DD.MM.YY"} onChange={onChange} />
    </Form.Item>
  );
}
