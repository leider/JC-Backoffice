import { Col, DatePicker, Form, Row, TimePicker } from "antd";
import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { StartAndEnd } from "@/components/veranstaltung/veranstaltungCompUtils";
function EmbeddedPickers(props: { dates?: StartAndEnd; onDates?: (val: StartAndEnd) => void }) {
  const [start, setStart] = useState<Dayjs>(dayjs());
  const [end, setEnd] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (props.dates) {
      setStart(props.dates.start);
      setEnd(props.dates.end);
    }
  }, [props.dates]);

  function dateChanged(startDate: Dayjs | null) {
    if (!startDate) {
      return;
    }
    const newStart = start.set("year", startDate?.get("year")).set("month", startDate.get("month")).set("day", startDate.get("day"));
    const newEnd = end.set("year", startDate?.get("year")).set("month", startDate.get("month")).set("day", startDate.get("day"));
    props.onDates?.({ start: newStart, end: newEnd });
  }

  function timesChanged(times: any) {
    if (!times) {
      return;
    }
    const startTime: Dayjs = times[0];
    const endTime: Dayjs = times[1];
    const newStart = start.set("hour", startTime?.get("hour")).set("minute", startTime.get("minute"));
    const newEnd = end.set("hour", endTime?.get("hour")).set("minute", endTime.get("minute"));
    props.onDates?.({ start: newStart, end: newEnd });
  }

  return (
    <Row gutter={12}>
      <Col>
        <DatePicker allowClear={false} format={"ddd DD.MM.YY"} value={start} onChange={dateChanged} />
      </Col>
      <Col span={12}>
        <TimePicker.RangePicker allowClear={false} format={"HH:mm"} value={[start, end]} minuteStep={15} onChange={timesChanged} />
      </Col>
    </Row>
  );
}

export default function StartEndPickers() {
  return (
    <Form.Item label={<b>Datum und Uhrzeit:</b>} name={["startAndEnd"]} valuePropName="dates" trigger="onDates">
      <EmbeddedPickers />
    </Form.Item>
  );
}
