import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import React, { useRef } from "react";
import { Event } from "jc-shared/programmheft/kalender";
import { Property } from "csstype";

export default function HeftCalendar(props: { initialDate: string; events: Event[] }) {
  interface LocalUsedEvent {
    title: string;
    _def: { extendedProps: { farbe: string } };
  }
  function renderEventContent(eventInfo: { event: LocalUsedEvent }) {
    return (
      <div style={colorFor(eventInfo.event)}>
        <i>{eventInfo.event.title}</i>
      </div>
    );
  }
  function colorFor(event: LocalUsedEvent): {
    backgroundColor: string;
    borderColor: string;
    color: string;
    whiteSpace: Property.WhiteSpace;
  } {
    return {
      backgroundColor: event._def.extendedProps.farbe,
      borderColor: event._def.extendedProps.farbe,
      color: "#FFFFFF",
      whiteSpace: "normal",
    };
  }

  const calRef = useRef<FullCalendar>(null);
  calRef.current?.getApi().gotoDate(props.initialDate);
  return (
    <FullCalendar
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
