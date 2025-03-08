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

function IcalCheck() {
  return (
    <Form.Item initialValue={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]} label={<b> Kalender</b>} name="icals">
      <Checkbox.Group options={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]} />
    </Form.Item>
  );
}

function TerminCheck() {
  return (
    <Form.Item initialValue={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]} label={<b>Termine</b>} name="termine">
      <Checkbox.Group options={["Feiertag", "Ferien", "Sonstiges", "Vermietung"]} />
    </Form.Item>
  );
}

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
        <JazzPageHeader buttons={[<IcalCheck key="icals" />, <TerminCheck key="termine" />]} title="Kalenderübersicht" />
      </Form>
      <Row gutter={8}>
        <Col span={24} style={{ zIndex: 0 }}>
          <FullCalendar
            displayEventEnd
            eventContent={renderEventContent}
            eventDisplay="block"
            eventSources={[getEvents]}
            headerToolbar={{ left: "title", center: "four,six,twelve,weeks", right: "prev,today,next" }}
            height="auto"
            initialDate={initiaDate}
            initialView="twelve"
            locales={[deLocale]}
            multiMonthMaxColumns={4}
            multiMonthMinWidth={500}
            plugins={[dayGridPlugin, multiMonthPlugin]}
            ref={calRef}
            showNonCurrentDates={false}
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
              weeks: {
                buttonText: "36 Wochen",
                type: "dayGrid",
                duration: { weeks: 36 },
                displayEventTime: true,
                eventTimeFormat: { hour: "2-digit", minute: "2-digit", meridiem: false },
              },
            }}
          />
        </Col>
      </Row>
    </WrapFullCalendar>
  );
}
