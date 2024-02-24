import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import React, { useCallback } from "react";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/commons/loader.ts";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { renderEventContent } from "@/components/team/renderCalendarEventContents.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export default function TeamCalendar() {
  const getEvents = useCallback(
    (
      info: {
        start: Date;
        end: Date;
        startStr: string;
        endStr: string;
        timeZone: string;
      },
      successCallback: (events: EventInput[]) => void,
      failureCallback: (error: Error) => void,
    ) => {
      async function doit() {
        try {
          const res = await calendarEventSources(info.start, info.end);
          successCallback(res as EventInput[]);
        } catch (e) {
          return failureCallback(e as Error);
        }
      }
      doit();
    },
    [],
  );
  const { lg } = useBreakpoint();
  return (
    <FullCalendar
      plugins={[dayGridPlugin, multiMonthPlugin]}
      initialView="one"
      locales={[deLocale]}
      headerToolbar={{ left: "title", center: "one,four,weeks", right: "prev,today,next" }}
      titleFormat={{ year: lg ? "numeric" : "2-digit", month: lg ? "long" : "short" }}
      views={{
        one: {
          weekNumberFormat: { week: "short" },
          fixedWeekCount: false,
          showNonCurrentDates: false,
          weekNumbers: true,
          weekText: "KW",
          buttonText: "1 Monat",
          type: "multiMonth",
          duration: { months: 1 },
        },
        four: {
          weekNumberFormat: { week: "short" },
          fixedWeekCount: false,
          showNonCurrentDates: false,
          weekNumbers: true,
          weekText: "KW",
          buttonText: "4 Monate",
          type: "multiMonth",
          duration: { months: 4 },
        },
        weeks: {
          buttonText: "4 Wochen",
          type: "dayGrid",
          duration: { weeks: 4 },
          displayEventTime: true,
        },
      }}
      height="auto"
      events={getEvents}
      eventContent={renderEventContent}
      eventDisplay="block"
      showNonCurrentDates={false}
    />
  );
}
