import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import deLocale from "@fullcalendar/core/locales/de";
import React, { useEffect, useRef } from "react";
import { Event } from "jc-shared/programmheft/Event";
import { Property } from "csstype";
import WrapFullCalendar from "@/widgets/calendar/WrapFullCalendar.tsx";

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

export default function HeftCalendar({
  events,
  initialDate,
  triggerRender,
}: {
  initialDate: string;
  events: Event[];
  triggerRender: boolean;
}) {
  const calRef = useRef<FullCalendar>(null);
  useEffect(() => {
    setTimeout(() => {
      calRef.current?.getApi().gotoDate(initialDate);
    }, 0);
  }, [initialDate, triggerRender]);

  return (
    <WrapFullCalendar>
      <FullCalendar
        buttonText={{ next: ">", prev: "<" }}
        contentHeight={900}
        eventContent={renderEventContent}
        events={events}
        headerToolbar={{ left: "title", center: "", right: "prev,next" }}
        initialDate={initialDate}
        initialView="weeks"
        locales={[deLocale]}
        plugins={[dayGridPlugin]}
        ref={calRef}
        views={{
          weeks: {
            buttonText: "36 Wochen",
            type: "dayGrid",
            duration: { weeks: 9 },
          },
        }}
      />
    </WrapFullCalendar>
  );
}
