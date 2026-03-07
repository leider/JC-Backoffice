import { DatePicker, Form } from "antd";
import * as React from "react";
import { useCallback, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { NamePath } from "antd/es/form/interface";
import { useFormItemInTableStyle } from "@/widgets/EditableTable/useFormItemInTableStyle.ts";

interface StartEndDateOnlyPickersProps {
  readonly name: NamePath[];
  readonly useInTable?: boolean;
}

function EmbeddedPickers({
  onChange,
  value,
  useInTable,
}: {
  readonly onChange?: (val: (Date | undefined)[]) => void;
  readonly value?: Date[];
  readonly useInTable?: boolean;
}) {
  const style = useFormItemInTableStyle(useInTable);

  const start = useMemo(() => dayjs(value?.[0]), [value]);
  const end = useMemo(() => dayjs(value?.[1]), [value]);

  const onCalendarChange = useCallback(
    (dates: (Dayjs | null)[] | null) => {
      const startNew = dates?.[0];
      const endNew = dates?.[1];
      onChange?.([startNew?.toDate(), endNew?.toDate()]);
    },
    [onChange],
  );

  return (
    <DatePicker.RangePicker
      allowClear={false}
      format="ddd DD.MM.YY"
      onCalendarChange={onCalendarChange}
      style={{ ...style, width: "100%" }}
      value={[start, end]}
    />
  );
}

export default function StartEndDateOnlyPickersInTable({ name, useInTable }: StartEndDateOnlyPickersProps) {
  return (
    <Form.Item hasFeedback name={name} style={{ marginBottom: 0 }}>
      <EmbeddedPickers useInTable={useInTable} />
    </Form.Item>
  );
}
