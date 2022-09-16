<template lang="pug">
.col-12
  .btn-group.float-right
    b-button.btn.btn-success(@click="save", title="Speichern"): b-icon-check-square
  h2 Programmheft<br>
    small {{ start.monatKompakt }} - {{ start.plus({ monate: 1 }).monatJahrKompakt }}
  .row
    .col-lg-8.col-sm-12
      .row
        .col-6
          heft-calendar(:dateString="start.minus({ monate: 2 }).fuerCalendarWidget", :events="events")
        .col-6
          heft-calendar(:dateString="start.minus({ monate: 1 }).fuerCalendarWidget", :events="events", height="600")
      .row.mt-4
        .col-12
          h4 Farben Hilfe
          p
            | Du kannst entweder eine #{ ' ' }
            a(href="https://www.w3schools.com/colors/colors_names.asp", target="_blank") Farbe mit Namen eintragen #{ ' ' }
            | oder einen HEX-Code als "#RGB" oder "#RRGGBB".

    .col-lg-4.col-sm-12
      markdown#kalender(
        v-model="kalender.text",
        theme="light",
        height="600",
        toolbar="bold italic heading | image link | numlist bullist | preview fullscreen help"
      )
  h2.text-danger(v-if="unbestaetigte.length > 0") Es gibt noch unbestätigte Veranstaltungen
  p(v-for="veranst in unbestaetigte", :key="veranst.id")
    b-link.text-danger(:to="`${veranst.fullyQualifiedUrl}/allgemeines`") {{ veranst.kopf.titelMitPrefix }}
  .row(v-for="monat in monate", :key="monat")
    .col-12
      h4.pt-1.pb-2.px-1.bg-primary.text-white {{ monat }}
    .col-xl-4.col-md-6(v-for="veranst in veranstaltungenNachMonat[monat]")
      .card-mb-2
        b-link(:to="`${veranst.fullyQualifiedUrl}/presse`")
          .card-header.p-0
            h6 {{ veranst.datumForDisplayShort }}
            h6 {{ veranst.kopf.presseInEcht }}
            h5 {{ veranst.kopf.titelMitPrefix }}
        div(v-html="renderedPressetext(veranst)")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Kalender, { Event } from "jc-shared/programmheft/kalender";
import groupBy from "lodash/groupBy";
import { marked } from "marked";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { kalenderFor, saveProgrammheft, veranstaltungenBetween } from "../../commons/loader";
import HeftCalendar from "../calendar/HeftCalendar.vue";
import Markdown from "../../widgets/Markdown.vue";

@Component({ components: { HeftCalendar, Markdown } })
export default class Programmheft extends Vue {
  @Prop() year!: string;
  @Prop() month!: string;
  kalender = new Kalender({ id: this.start.fuerKalenderViews, text: "" });
  veranstaltungen: Veranstaltung[] = [];

  get start(): DatumUhrzeit {
    return (DatumUhrzeit.forYYYYMM(`${this.year}${this.month}`) || new DatumUhrzeit()).vorigerOderAktuellerUngeraderMonat;
  }

  get events(): Event[] {
    return this.kalender.asEvents();
  }

  get unbestaetigte(): Veranstaltung[] {
    return this.veranstaltungen.filter((v) => !v.kopf.confirmed);
  }

  get veranstaltungenNachMonat(): { [index: string]: Veranstaltung[] } {
    const filteredVeranstaltungen = this.veranstaltungen.filter((v) => v.kopf.confirmed);
    return groupBy(filteredVeranstaltungen, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
  }

  get monate(): string[] {
    return Object.keys(this.veranstaltungenNachMonat);
  }

  renderedPressetext(veranstaltung: Veranstaltung): string {
    return marked.parse(veranstaltung.presse.text || "", { gfm: true, breaks: true, smartLists: true, pedantic: false });
  }

  async save() {
    await saveProgrammheft(this.kalender);
  }

  @Watch("$route")
  async mounted() {
    document.title = "Programmheft";
    this.kalender = (await kalenderFor(this.start.fuerKalenderViews)) || new Kalender({ id: this.start.fuerKalenderViews, text: "" });
    this.veranstaltungen = (await veranstaltungenBetween(this.start, this.start.plus({ monate: 2 }))) || [];
  }
}
</script>
