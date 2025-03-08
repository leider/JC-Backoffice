import { DatePicker } from "antd";
import { IntRange } from "rc-picker/lib/interface";
import * as React from "react";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import Aggregate from "@/widgets/Aggregate.tsx";

function EmbeddedPickers({
  id,
  onChange,
  value,
}: {
  readonly id?: string;
  readonly onChange?: (val: (Date | undefined)[]) => void;
  readonly value?: Date[];
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
    if (!startNew && endNew) {
      return onChange?.([new DatumUhrzeit(start).moveByDifferenceDays(endNew).toDate(), endNew.toDate()]);
    }
    if (!endNew && startNew) {
      return onChange?.([startNew.toDate(), new DatumUhrzeit(end).moveByDifferenceDays(startNew).toDate()]);
    }
    if (startNew && endNew) {
      onChange?.([startNew.toDate(), endNew.add(startNew.diff(start)).toDate()]);
    }
  }

  return (
    <DatePicker.RangePicker
      format={["ddd DD.MM.YY HH:mm", "DDMMYY HH:mm"]}
      id={id}
      minuteStep={30 as IntRange<1, 59>}
      onCalendarChange={onCalendarChange}
      showTime
      value={[start, end]}
    />
  );
}

export default function StartEndPickers() {
  return (
    <Aggregate label={<b style={{ whiteSpace: "nowrap" }}>Datum und Uhrzeit:</b>} names={["startDate", "endDate"]} required>
      <EmbeddedPickers />
    </Aggregate>
  );
}
