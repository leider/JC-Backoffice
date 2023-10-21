import React, { createRef } from "react";
import { Checkbox, Col, Form, FormInstance, Row, Tooltip } from "antd";
import deLocale from "@fullcalendar/core/locales/de";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/commons/loader.ts";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { PageHeader } from "@ant-design/pro-layout";
import CheckItem from "@/widgets/CheckItem.tsx";
import login from "@/components/Login.tsx";
import { TerminFilterOptions, TerminType } from "jc-shared/optionen/termin.ts";

export default function BigKalender() {
  document.title = "Übersichtskalender";

  function getEvents(
    info: {
      start: Date;
      end: Date;
    },
    successCallback: (events: EventInput[]) => void,
    failureCallback: (error: Error) => void,
  ): void {
    async function doit() {
      try {
        const options = form.getFieldsValue(true);
        const res = await calendarEventSources(info.start, info.end, options);
        successCallback(res as EventInput[]);
      } catch (e) {
        return failureCallback(e as Error);
      }
    }
    doit();
  }

  function renderEventContent(eventInfo: any) {
    return (
      <Tooltip title={eventInfo.event.title}>
        <span>
          {eventInfo.timeText !== "00 Uhr" && <b>{eventInfo.timeText} </b>}
          <i>{eventInfo.event.title}</i>
        </span>
      </Tooltip>
    );
  }
  const [form] = Form.useForm<TerminFilterOptions>();

  function IcalCheck() {
    return (
      <Form.Item label={<b> Kalender</b>} name="icals" initialValue={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]}>
        <Checkbox.Group options={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]} />
      </Form.Item>
    );
  }

  function TerminCheck() {
    return (
      <Form.Item label={<b>Termine</b>} name="termine" initialValue={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]}>
        <Checkbox.Group options={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]} />
      </Form.Item>
    );
  }

  const calRef = createRef<FullCalendar>();
  return (
    <Form
      form={form}
      onChange={() => {
        calRef.current?.getApi().refetchEvents();
      }}
    >
      <PageHeader title="Kalenderübersicht" extra={[<IcalCheck key="icals" />, <TerminCheck key="termine" />]} />
      <Row gutter={8}>
        <Col span={24} style={{ zIndex: 0 }}>
          <FullCalendar
            ref={calRef}
            plugins={[multiMonthPlugin]}
            initialView="Sechs"
            locales={[deLocale]}
            headerToolbar={{ left: "title", center: "Sechs,Vier,Zwölf", right: "prev,today,next" }}
            views={{
              Zwölf: {
                type: "multiMonth",
                duration: { months: 12 },
              },
              Vier: {
                type: "multiMonth",
                duration: { months: 4 },
              },
              Sechs: {
                type: "multiMonth",
                duration: { months: 6 },
              },
            }}
            multiMonthMaxColumns={4}
            eventSources={[getEvents]}
            eventContent={renderEventContent}
          />
        </Col>
      </Row>
    </Form>
  );
}
