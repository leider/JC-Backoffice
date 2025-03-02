import React, { createRef, useCallback, useMemo } from "react";
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
import WrapFullCalendar from "@/widgets/calendar/WrapFullCalendar.tsx";
import dayGridPlugin from "@fullcalendar/daygrid";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function BigKalender() {
  document.title = "Übersichtskalender";
  const [form] = Form.useForm<TerminFilterOptions>();
  const { isDarkMode } = useJazzContext();

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
          const res = await calendarEventSources({ start: info.start, end: info.end, options, isDarkMode });
          successCallback(res);
        } catch (e) {
          return failureCallback(e as Error);
        }
      }
      doit();
    },
    [form, isDarkMode],
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
  const initiaDate = useMemo(() => new DatumUhrzeit().minus({ wochen: 2 }).toJSDate, []);
  return (
    <WrapFullCalendar>
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
            plugins={[dayGridPlugin, multiMonthPlugin]}
            initialView="twelve"
            locales={[deLocale]}
            headerToolbar={{ left: "title", center: "four,six,twelve,weeks", right: "prev,today,next" }}
            titleFormat={{ year: lg ? "numeric" : "2-digit", month: lg ? "long" : "short" }}
            displayEventEnd
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
              weeks: {
                buttonText: "36 Wochen",
                type: "dayGrid",
                duration: { weeks: 36 },
                displayEventTime: true,
                eventTimeFormat: { hour: "2-digit", minute: "2-digit", meridiem: false },
              },
            }}
            height="auto"
            multiMonthMaxColumns={4}
            multiMonthMinWidth={500}
            initialDate={initiaDate}
            eventSources={[getEvents]}
            eventContent={renderEventContent}
            eventDisplay="block"
            showNonCurrentDates={false}
          />
        </Col>
      </Row>
    </WrapFullCalendar>
  );
}
