import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import React, { useRef } from "react";
import { Event } from "jc-shared/programmheft/kalender";

export default function HeftCalendar(props: { initialDate: string; events: Event[] }) {
  function renderEventContent(eventInfo: any) {
    return (
      <div style={colorFor(eventInfo)}>
        <i>{eventInfo.event.title}</i>
      </div>
    );
  }
  function colorFor(event: { event: any }): {
    backgroundColor: string;
    borderColor: string;
    color: string;
    whiteSpace: any;
  } {
    return {
      backgroundColor: event.event._def.extendedProps.farbe,
      borderColor: event.event._def.extendedProps.farbe,
      color: "#FFFFFF",
      whiteSpace: "normal",
    };
  }

  const calRef = useRef<FullCalendar>();
  calRef.current?.getApi().gotoDate(props.initialDate);
  return (
    <FullCalendar
      // @ts-ignore
      ref={calRef}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      buttonText={{ next: ">", prev: "<" }}
      locales={[deLocale]}
      headerToolbar={{ left: "title", center: "", right: "" }}
      views={{
        month: {
          titleFormat: { month: "long", year: "2-digit" },
          weekNumberFormat: { week: "short" },
          fixedWeekCount: false,
          showNonCurrentDates: false,
        },
      }}
      contentHeight={600}
      initialDate={props.initialDate}
      //events={getEvents}
      events={props.events}
      eventContent={renderEventContent}
    />
  );
}
