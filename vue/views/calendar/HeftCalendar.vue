<template lang="pug">
FullCalendar( :options="options" )
  template( v-slot:eventContent='arg')
    .fc-content(:style="colorFor(arg)")
      b(v-if="arg.timeText && arg.timeText !== '00 Uhr'" ) {{ arg.timeText }}
        br
      i {{ arg.event.title }}
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import FullCalendar, { CalendarOptions } from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import luxonPlugin from "@fullcalendar/luxon";
import deLocale from "@fullcalendar/core/locales/de";
import { Event } from "../../../lib/programmheft/kalender";

@Component({ components: { FullCalendar } })
export default class HeftCalendar extends Vue {
  @Prop() dateString!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Prop() events!: Event[];

  options: CalendarOptions = {
    plugins: [dayGridPlugin, bootstrapPlugin, luxonPlugin],
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
    locales: [deLocale],
    headerToolbar: { left: "title", center: "", right: "" },
    timeZone: "Europe/Berlin",
    views: {
      month: {
        titleFormat: { month: "long" },
        weekNumberFormat: { week: "short" },
        fixedWeekCount: false,
        showNonCurrentDates: false,
      },
    },
    contentHeight: 600,
    initialDate: this.dateString,
    events: this.events,
  };

  colorFor(arg: { event: any }): object {
    return {
      backgroundColor: arg.event._def.extendedProps.farbe,
      borderColor: arg.event._def.extendedProps.farbe,
      color: "#FFFFFF",
    };
  }

  @Watch("events")
  eventsChanged(): void {
    this.options.events = this.events;
  }
}
</script>
