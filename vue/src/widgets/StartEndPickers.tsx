import { DatePicker, Form } from "antd";
import { IntRange } from "rc-picker/lib/interface";
import * as React from "react";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

type StartAndEnd = {
  start: Dayjs;
  end: Dayjs;
};

function EmbeddedPickers({ id, dates, onDates }: { id?: string; dates?: StartAndEnd; onDates?: (val: StartAndEnd) => void }) {
  const [start, setStart] = useState<Dayjs>(dayjs());
  const [end, setEnd] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (dates) {
      setStart(dates.start);
      setEnd(dates.end);
    }
  }, [dates]);

  function onCalendarChange(dates: (Dayjs | null)[] | null) {
    const startNew = dates?.[0];
    const endNew = dates?.[1];
    if (!startNew && endNew) {
      return onDates?.({ start: new DatumUhrzeit(start).moveByDifferenceDays(endNew), end: endNew });
    }
    if (!endNew && startNew) {
      return onDates?.({ start: startNew, end: new DatumUhrzeit(end).moveByDifferenceDays(startNew) });
    }
    if (startNew && endNew) {
      onDates?.({ start: startNew, end: endNew.add(startNew.diff(start)) });
    }
  }

  return (
    <DatePicker.RangePicker
      id={id}
      showTime
      minuteStep={30 as IntRange<1, 59>}
      format={["ddd DD.MM.YY HH:mm", "DDMMYY HH:mm"]}
      value={[start, end]}
      onCalendarChange={onCalendarChange}
    />
  );
}

export default function StartEndPickers() {
  return (
    <Form.Item label={<b>Datum und Uhrzeit:</b>} name="startAndEnd" valuePropName="dates" trigger="onDates" required>
      <EmbeddedPickers />
    </Form.Item>
  );
}
