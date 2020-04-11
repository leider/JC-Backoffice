<template lang="pug">
FullCalendar(
  :plugins="calendarPlugins",
  defaultView="dayGridMonth",
  themeSystem="bootstrap",
  :locales="locales",
  locale="de",
  :header="{ left: 'title', center: '', right: '' }",
  timeZone="Europe/Berlin",
  timeFormat="HH:mm",
  :displayEventTime="false",
  :views="{month: {titleFormat: {month: 'short', year: '2-digit'},fixedWeekCount: false,showNonCurrentDates: false}}",
  :weekNumbers="true",
  :contentHeight="600",
  :defaultDate="dateString",
  :events="events",
)
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import deLocale from "@fullcalendar/core/locales/de";

@Component({ components: { FullCalendar } })
export default class HeftCalendar extends Vue {
  @Prop() dateString!: string;
  @Prop() events!: any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get calendarPlugins(): any[] {
    return [dayGridPlugin, bootstrapPlugin];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get locales(): any {
    return [deLocale];
  }
}
</script>
