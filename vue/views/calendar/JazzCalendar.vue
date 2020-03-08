<template lang="pug">
FullCalendar(
  :plugins="calendarPlugins",
  defaultView="dayGridMonth",
  themeSystem="bootstrap",
  :locales="locales",
  locale="de",
  :header="{ left: 'title', center: '', right: 'prev,today,next' }",
  timezone="Europe/Berlin",
  timeFormat="HH:mm",
  :displayEventTime="false",
  :views="{month: {titleFormat: {month: 'short', year: '2-digit'},fixedWeekCount: false,showNonCurrentDates: false}}",
  :weekNumbers="true",
  height="auto",
  :eventSources="eventSources"
)
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import deLocale from "@fullcalendar/core/locales/de";
import { CalSource } from "../../../lib/optionen/ferienIcals";

@Component({ components: { FullCalendar } })
export default class JazzCalendar extends Vue {
  @Prop() eventSources!: CalSource[];
  get calendarPlugins() {
    return [dayGridPlugin, bootstrapPlugin];
  }

  get locales() {
    return [deLocale];
  }
}
</script>

<style></style>
