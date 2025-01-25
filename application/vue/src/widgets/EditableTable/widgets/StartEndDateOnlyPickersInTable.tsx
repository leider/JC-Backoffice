import { DatePicker, Form } from "antd";
import * as React from "react";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { NamePath } from "rc-field-form/es/interface";

interface StartEndDateOnlyPickersProps {
  name: NamePath[];
  save?: () => void;
  focus?: boolean;
}

function EmbeddedPickers({
  onChange,
  value,
  save,
  focus,
}: {
  onChange?: (val: (Date | undefined)[]) => void;
  value?: Date[];
  save?: () => void;
  focus?: boolean;
}) {
  const [start, setStart] = useState<Dayjs>(dayjs());
  const [end, setEnd] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (value) {
      setStart(dayjs(value[0]));
      setEnd(dayjs(value[1]));
    }
  }, [value]);

  function onCalendarChange(dates: (Dayjs | null)[] | null) {
    const startNew = dates?.[0];
    const endNew = dates?.[1];
    onChange?.([startNew?.toDate(), endNew?.toDate()]);
  }

  return (
    <DatePicker.RangePicker
      allowClear={false}
      format="ddd DD.MM.YY"
      value={[start, end]}
      onCalendarChange={onCalendarChange}
      style={{ width: "100%" }}
      needConfirm={focus}
      autoFocus={focus}
      onOpenChange={(open) => {
        if (!open) {
          save?.();
        }
      }}
    />
  );
}

export default function StartEndDateOnlyPickersInTable({ name, save, focus }: StartEndDateOnlyPickersProps) {
  return (
    <Form.Item name={name} style={{ marginBottom: 0 }} hasFeedback>
      <EmbeddedPickers save={save} focus={focus} />
    </Form.Item>
  );
}
