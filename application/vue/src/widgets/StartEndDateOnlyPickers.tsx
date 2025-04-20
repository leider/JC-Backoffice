import { DatePicker } from "antd";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { NamePath } from "rc-field-form/es/interface";
import Aggregate from "@/widgets/Aggregate.tsx";
import { useWatch } from "antd/es/form/Form";

interface StartEndDateOnlyPickersProps {
  readonly names: NamePath[];
  readonly label?: string;
  readonly dependency?: NamePath;
  readonly onChange?: () => void;
}

function EmbeddedPickers({
  id,
  onChange,
  value,
  fireChange,
  dependency,
}: {
  readonly id?: string;
  readonly onChange?: (val: (Date | undefined)[]) => void;
  readonly value?: Date[];
  readonly fireChange?: () => void;
  readonly dependency?: NamePath;
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

  const onCalendarChange = useCallback(
    (dates: (Dayjs | null)[] | null) => {
      const startNew = dates?.[0];
      const endNew = dates?.[1];
      onChange?.([startNew?.toDate(), endNew?.toDate()]);
      fireChange?.();
    },
    [onChange, fireChange],
  );

  const disabledDateCallback = useCallback(
    (current: Dayjs) => !(current && current.isAfter(eventStartDayjs.subtract(7, "days"))),
    [eventStartDayjs],
  );

  return (
    <DatePicker.RangePicker
      allowClear={false}
      disabledDate={dependency ? disabledDateCallback : undefined}
      format="ddd DD.MM.YY"
      id={id}
      onCalendarChange={onCalendarChange}
      style={{ width: "100%" }}
      value={[start, end]}
    />
  );
}

export default function StartEndDateOnlyPickers({ names, label, dependency, onChange }: StartEndDateOnlyPickersProps) {
  return (
    <Aggregate
      dependencies={dependency ? [dependency] : undefined}
      hasFeedback
      label={label ? <b>{label + ":"}</b> : ""}
      names={names}
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
      style={label ? {} : { marginBottom: 0 }}
    >
      <EmbeddedPickers dependency={dependency} fireChange={onChange} />
    </Aggregate>
  );
}
