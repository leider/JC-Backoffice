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
      initialView="dayGridMonth"
      locales={[deLocale]}
      headerToolbar={{ left: "title", center: "dayGridMonth,Vier", right: "prev,today,next" }}
      titleFormat={{ year: lg ? "numeric" : "2-digit", month: lg ? "long" : "short" }}
      views={{
        month: {
          weekNumberFormat: { week: "short" },
          fixedWeekCount: false,
          showNonCurrentDates: false,
          weekNumbers: true,
          weekText: "KW",
        },
        Vier: {
          type: "multiMonth",
          duration: { months: 4 },
        },
      }}
      height="auto"
      events={getEvents}
      eventContent={renderEventContent}
    />
  );
}
