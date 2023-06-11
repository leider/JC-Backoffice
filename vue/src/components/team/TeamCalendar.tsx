import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import React from "react";
import { EventInput } from "@fullcalendar/core";
import { calendarEventSources } from "@/commons/loader-for-react";

export default function TeamCalendar() {
  function getEvents(
    info: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    },
    // eslint-disable-next-line no-unused-vars
    successCallback: (events: EventInput[]) => void,
    // eslint-disable-next-line no-unused-vars
    failureCallback: (error: Error) => void
  ): void {
    async function doit() {
      try {
        const res = await calendarEventSources(info.start, info.end);
        successCallback(res as EventInput[]);
      } catch (e) {
        return failureCallback(e as Error);
      }
    }
    doit();
  }

  function renderEventContent(eventInfo: any) {
    return (
      <div style={{ whiteSpace: "normal" }}>
        <b>{eventInfo.timeText !== "00 Uhr" && eventInfo.timeText}</b>
        <br />
        <i>{eventInfo.event.title}</i>
      </div>
    );
  }

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