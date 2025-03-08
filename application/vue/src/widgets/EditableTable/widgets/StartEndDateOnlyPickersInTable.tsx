import { DatePicker, Form } from "antd";
import * as React from "react";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { NamePath } from "rc-field-form/es/interface";

interface StartEndDateOnlyPickersProps {
  readonly name: NamePath[];
  readonly save?: () => void;
  readonly focus?: boolean;
}

function EmbeddedPickers({
  onChange,
  value,
  save,
  focus,
}: {
  readonly onChange?: (val: (Date | undefined)[]) => void;
  readonly value?: Date[];
  readonly save?: () => void;
  readonly focus?: boolean;
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
      autoFocus={focus}
      format="ddd DD.MM.YY"
      needConfirm={focus}
      onCalendarChange={onCalendarChange}
      onOpenChange={(open) => {
        if (!open) {
          save?.();
        }
      }}
      style={{ width: "100%" }}
      value={[start, end]}
    />
  );
}

export default function StartEndDateOnlyPickersInTable({ name, save, focus }: StartEndDateOnlyPickersProps) {
  return (
    <Form.Item hasFeedback name={name} style={{ marginBottom: 0 }}>
      <EmbeddedPickers focus={focus} save={save} />
    </Form.Item>
  );
}
