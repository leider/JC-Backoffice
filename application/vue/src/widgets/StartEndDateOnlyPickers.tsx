import { DatePicker } from "antd";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { NamePath } from "rc-field-form/es/interface";
import Aggregate from "@/widgets/Aggregate.tsx";
import { useWatch } from "antd/es/form/Form";

interface StartEndDateOnlyPickersProps {
  names: NamePath[];
  label?: string;
  dependency?: NamePath;
  onChange?: () => void;
}

function EmbeddedPickers({
  id,
  onChange,
  value,
  fireChange,
  dependency,
}: {
  id?: string;
  onChange?: (val: (Date | undefined)[]) => void;
  value?: Date[];
  fireChange?: () => void;
  dependency?: NamePath;
}) {
  const [start, setStart] = useState<Dayjs>(dayjs());
  const [end, setEnd] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (value) {
      setStart(dayjs(value[0]));
      setEnd(dayjs(value[1]));
    }
  }, [value]);

  const eventStart: Date = useWatch([dependency]);
  const eventStartDayjs: Dayjs = useMemo(() => dayjs(eventStart), [eventStart]);

  function onCalendarChange(dates: (Dayjs | null)[] | null) {
    const startNew = dates?.[0];
    const endNew = dates?.[1];
    onChange?.([startNew?.toDate(), endNew?.toDate()]);
    fireChange?.();
  }

  return (
    <DatePicker.RangePicker
      id={id}
      allowClear={false}
      format="ddd DD.MM.YY"
      value={[start, end]}
      onCalendarChange={onCalendarChange}
      style={{ width: "100%" }}
      disabledDate={dependency ? (current: Dayjs) => !(current && current.isAfter(eventStartDayjs.subtract(7, "days"))) : undefined}
    />
  );
}

export default function StartEndDateOnlyPickers({ names, label, dependency, onChange }: StartEndDateOnlyPickersProps) {
  return (
    <Aggregate
      label={label ? <b>{label}:</b> : ""}
      names={names}
      style={label ? {} : { marginBottom: 0 }}
      dependencies={dependency ? [dependency] : undefined}
      hasFeedback
      rules={
        dependency
          ? [
              ({ getFieldValue }) => ({
                validator: (_, value: Date) => {
                  const eventStart = getFieldValue(dependency);
                  return dayjs(value).isAfter(dayjs(eventStart).subtract(7, "days"))
                    ? Promise.resolve()
                    : Promise.reject(new Error("Darf frühestens 1 Woche vor der Veranstaltung liegen"));
                },
              }),
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const end = getFieldValue(names[1]);
                  const difference = dayjs(end).diff(dayjs(value));
                  return difference ? Promise.resolve() : Promise.reject(new Error("Muss mindestens 1 Nacht sein"));
                },
              }),
            ]
          : []
      }
    >
      <EmbeddedPickers fireChange={onChange} dependency={dependency} />
    </Aggregate>
  );
}
