import React, { createRef, useCallback } from "react";
import { Checkbox, Col, Form, Row } from "antd";
import deLocale from "@fullcalendar/core/locales/de";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/commons/loader.ts";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { TerminFilterOptions } from "jc-shared/optionen/termin.ts";
import { renderEventContent } from "@/components/team/renderCalendarEventContents.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function BigKalender() {
  document.title = "Übersichtskalender";
  const [form] = Form.useForm<TerminFilterOptions>();

  const getEvents = useCallback(
    (
      info: {
        start: Date;
        end: Date;
      },
      successCallback: (events: EventInput[]) => void,
      failureCallback: (error: Error) => void,
    ): void => {
      async function doit() {
        try {
          const options = form.getFieldsValue(true);
          const res = await calendarEventSources(info.start, info.end, options);
          successCallback(res);
        } catch (e) {
          return failureCallback(e as Error);
        }
      }
      doit();
    },
    [form],
  );

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
  const { lg } = useBreakpoint();
  return (
    <>
      <Form
        form={form}
        onChange={() => {
          calRef.current?.getApi().refetchEvents();
        }}
      >
        <JazzPageHeader title="Kalenderübersicht" buttons={[<IcalCheck key="icals" />, <TerminCheck key="termine" />]} />
      </Form>
      <Row gutter={8}>
        <Col span={24} style={{ zIndex: 0 }}>
          <FullCalendar
            ref={calRef}
            plugins={[multiMonthPlugin]}
            initialView="six"
            locales={[deLocale]}
            headerToolbar={{ left: "title", center: "four,six,twelve", right: "prev,today,next" }}
            titleFormat={{ year: lg ? "numeric" : "2-digit", month: lg ? "long" : "short" }}
            views={{
              twelve: {
                buttonText: "12 Monate",
                type: "multiMonth",
                duration: { months: 12 },
              },
              four: {
                buttonText: "4 Monate",
                type: "multiMonth",
                duration: { months: 4 },
              },
              six: {
                buttonText: "6 Monate",
                type: "multiMonth",
                duration: { months: 6 },
              },
            }}
            height="auto"
            multiMonthMaxColumns={4}
            multiMonthMinWidth={500}
            eventSources={[getEvents]}
            eventContent={renderEventContent}
            eventDisplay="block"
            showNonCurrentDates={false}
          />
        </Col>
      </Row>
    </>
  );
}
