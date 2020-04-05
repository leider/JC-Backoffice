<template lang="pug">
FullCalendar(
  :plugins="calendarPlugins",
  defaultView="dayGridMonth",
  themeSystem="bootstrap",
  :locales="locales",
  locale="de",
  :header="{ left: 'title', center: '', right: 'prev,today,next' }",
  timeZone="Europe/Berlin",
  timeFormat="HH:mm",
  :displayEventTime="false",
  :views="{month: {titleFormat: {month: 'short', year: '2-digit'},fixedWeekCount: false,showNonCurrentDates: false}}",
  :weekNumbers="true",
  height="auto",
  :eventSources="eventSources"
)
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import deLocale from "@fullcalendar/core/locales/de";
import { CalSource } from "../../../lib/optionen/ferienIcals";
import { icals } from "@/commons/loader";

@Component({ components: { FullCalendar } })
export default class JazzCalendar extends Vue {
  eventSources: CalSource[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get calendarPlugins(): any[] {
    return [dayGridPlugin, bootstrapPlugin];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get locales(): any {
    return [deLocale];
  }

  created(): void {
    icals((icals: CalSource[]) => {
      this.eventSources = icals;
    });
  }
}
</script>
