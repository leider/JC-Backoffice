<template lang="pug">
FullCalendar(:options="options")
  template(v-slot:eventContent="arg")
    .fc-content
      b(v-if="arg.timeText && arg.timeText !== '00 Uhr'") {{ arg.timeText }}
        br
      i {{ arg.event.title }}
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FullCalendar, { CalendarOptions } from "@fullcalendar/vue/";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import deLocale from "@fullcalendar/core/locales/de";
import { CalSource } from "../../../lib/optionen/ferienIcals";
import { icals } from "@/commons/loader";

@Component({ components: { FullCalendar } })
export default class JazzCalendar extends Vue {
  options: CalendarOptions = {
    plugins: [dayGridPlugin, bootstrapPlugin],
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
    bootstrapFontAwesome: false,
    buttonText: { next: ">", prev: "<"},
    locales: [deLocale],
    headerToolbar: { left: "title", center: "", right: "prev,today,next" },
    timeZone: "Europe/Berlin",
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
    eventSources: [],
  };

  created(): void {
    icals((icals: CalSource[]) => {
      this.options.eventSources = icals;
    });
  }
}
</script>
