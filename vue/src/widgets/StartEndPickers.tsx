import { Col, DatePicker, Form, Row } from "antd";
import { IntRange } from "rc-picker/lib/interface";
import * as React from "react";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { StartAndEnd } from "@/components/veranstaltung/veranstaltungCompUtils";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

function EmbeddedPickers(props: { dates?: StartAndEnd; onDates?: (val: StartAndEnd) => void }) {
  const [start, setStart] = useState<Dayjs>(dayjs());
  const [end, setEnd] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (props.dates) {
      setStart(props.dates.start);
      setEnd(props.dates.end);
    }
  }, [props.dates]);

  function onCalendarChange(dates: (Dayjs | null)[] | null) {
    const startNew = dates?.[0];
    const endNew = dates?.[1];
    if (!startNew && endNew) {
      return props.onDates?.({ start: new DatumUhrzeit(start).moveByDifferenceDays(endNew), end: endNew });
    }
    if (!endNew && startNew) {
      return props.onDates?.({ start: startNew, end: new DatumUhrzeit(end).moveByDifferenceDays(startNew) });
    }
    if (startNew && endNew) {
      props.onDates?.({ start: startNew, end: endNew.add(startNew.diff(start)) });
    }
  }

  return (
    <Row gutter={12}>
      <Col>
        <DatePicker.RangePicker
          showTime
          minuteStep={30 as IntRange<1, 59>}
          format={["ddd DD.MM.YY HH:mm", "DDMMYY HH:mm"]}
          value={[start, end]}
          onCalendarChange={onCalendarChange}
        />
      </Col>
    </Row>
  );
}

export default function StartEndPickers() {
  return (
    <Form.Item label={<b>Datum und Uhrzeit:</b>} name="startAndEnd" valuePropName="dates" trigger="onDates">
      <EmbeddedPickers />
    </Form.Item>
  );
}
