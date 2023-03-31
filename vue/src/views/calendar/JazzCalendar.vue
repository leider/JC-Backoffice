<template lang="pug">
FullCalendar(:options="options")
  template(v-slot:eventContent="arg")
    .fc-content
      b(v-if="arg.timeText && arg.timeText !== '00 Uhr'") {{ arg.timeText }}
        br
      i {{ arg.event.title }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, Vue } from "vue-property-decorator";
import { CalendarOptions, EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import deLocale from "@fullcalendar/core/locales/de";
import { calendarEventSources } from "@/commons/loader";

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
  failureCallback: (error: { message: string; response?: any; [otherProp: string]: any }) => void
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

@Component({ components: { FullCalendar } })
export default class JazzCalendar extends Vue {
  options: CalendarOptions = {
    plugins: [dayGridPlugin, bootstrapPlugin],
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
    bootstrapFontAwesome: false,
    buttonText: { next: ">", prev: "<" },
    locales: [deLocale],
    headerToolbar: { left: "title", center: "", right: "prev,today,next" },
    views: {
      month: {
        titleFormat: { month: "short", year: "2-digit" },
        weekNumberFormat: { week: "short" },
        fixedWeekCount: false,
        showNonCurrentDates: false,
        weekNumbers: true,
        weekText: "KW",
      },
    },
    height: "auto",
    events: getEvents,
  };
}
</script>
