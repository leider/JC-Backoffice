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
  :views="{month: {titleFormat: {month: 'long'},fixedWeekCount: false,showNonCurrentDates: false}}",
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
