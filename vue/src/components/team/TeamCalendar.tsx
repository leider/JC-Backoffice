import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import React, { useCallback } from "react";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/commons/loader.ts";
import { Tooltip } from "antd";

export function renderEventContent(eventInfo: { timeText: string; event: { title: string } }) {
  return (
    <Tooltip
      title={
        <span>
          {eventInfo.timeText !== "00 Uhr" && <b>{eventInfo.timeText} </b>}
          <i>{eventInfo.event.title}</i>
        </span>
      }
    >
      {eventInfo.event.title}
    </Tooltip>
  );
}

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

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      buttonText={{ next: ">", prev: "<" }}
      locales={[deLocale]}
      headerToolbar={{ left: "title", center: "", right: "prev,today,next" }}
      views={{
        month: {
          titleFormat: { month: "short", year: "2-digit" },
          weekNumberFormat: { week: "short" },
          fixedWeekCount: false,
          showNonCurrentDates: false,
          weekNumbers: true,
          weekText: "KW",
        },
      }}
      height="auto"
      events={getEvents}
      eventContent={renderEventContent}
    />
  );
}
