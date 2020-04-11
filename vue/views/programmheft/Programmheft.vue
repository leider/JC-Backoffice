<template lang="pug">
.col-12
  .page-header
    .btn-group.float-right
      button.btn.btn-success(type="submit", title="Speichern"): i.far.fa-save.fa-fw
    h2 Programmheft<br>
      small {{start.monatKompakt}} - {{start.plus({monate: 1}).monatJahrKompakt}}
    .row
      .col-lg-8.col-sm-12
        .row
          .col-6
            heft-calendar(:dateString="start.minus({monate: 2}).fuerCalendarWidget", :events="events")
          .col-6
            heft-calendar(:dateString="start.minus({monate: 1}).fuerCalendarWidget", :events="events", height="600")
      .col-lg-4.col-sm-12
        markdown(id="kalender", v-model="kalender.text", theme="light", height="600",
        toolbar="bold italic heading | image link | numlist bullist | preview fullscreen")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import HeftCalendar from "@/views/calendar/HeftCalendar.vue";
import Markdown from "@/widgets/Markdown.vue";
import Kalender, { Event } from "../../../lib/programmheft/kalender";

@Component({ components: { HeftCalendar, Markdown } })
export default class Programmheft extends Vue {
  @Prop() initialStart!: DatumUhrzeit;
  kalender = new Kalender({ id: "2020/03", text: "" });

  get start(): DatumUhrzeit {
    return this.initialStart || new DatumUhrzeit().naechsterUngeraderMonat;
  }

  get events(): Event[] {
    console.log("Bingo");
    return this.kalender.asEvents();
  }
}
</script>
