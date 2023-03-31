<template lang="pug">
FullCalendar(:options="options")
  template(v-slot:eventContent="arg")
    .fc-content(:style="colorFor(arg)")
      i {{ arg.event.title }}
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, Prop, Vue } from "vue-property-decorator";
import { CalendarOptions } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/vue";

@Component({ components: { FullCalendar } })
export default class HeftCalendar extends Vue {
  @Prop() options!: CalendarOptions;

  colorFor(arg: { event: any }): { backgroundColor: string; borderColor: string; color: string } {
    return {
      backgroundColor: arg.event._def.extendedProps.farbe,
      borderColor: arg.event._def.extendedProps.farbe,
      color: "#FFFFFF",
    };
  }
}
</script>
