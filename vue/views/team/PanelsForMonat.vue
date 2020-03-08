<template lang="pug">
.row
  .col-12
    h4.pt-1.pb-2.px-1.bg-primary.text-white {{monat}} &nbsp;
      a.btn.btn-secondary(v-if="expanded", @click="aufZu")
        i.far.fa-minus-square.fa-fw-fw-sm
        | #{' '} Alle Zu
      a.btn.btn-secondary(v-if="!expanded", @click="aufZu")
        i.far.fa-plus-square.fa-fw-fw-sm
        | #{' '} Alle Auf
      .btn-group.btn-group-sm.float-right
        a.btn.btn-secondary.btn-sm(href="/veranstaltungen/texte/")
          i.far.fa-file-alt.fa-fw
          | #{' '} Presseexte
        a.btn.btn-secondary.btn-sm(href="/veranstaltungen/monat/")
          i.fas.fa-align-justify.fa-fw
          | #{' '} Übersicht
  Panel(v-for="veranstaltung in veranstaltungen", :key="veranstaltung.id", :ref="veranstaltung.id", :veranstaltung="veranstaltung", :nearFuture="nearFuture", :user="user")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Panel from "@/views/team/Panel.vue";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import User from "../../../lib/users/user";

@Component({ components: { Panel } })
export default class PanelsForMonat extends Vue {
  @Prop() monat!: string;
  @Prop() veranstaltungen!: Veranstaltung[];
  @Prop() user!: User;
  private nearFuture = new DatumUhrzeit().plus({ monate: 1 });
  private expanded = this.veranstaltungen[0].startDatumUhrzeit().istVor(this.nearFuture);

  doWithAllPanels(action: string): void {
    this.veranstaltungen.forEach(v => {
      (this.$refs[v.id || ""] as any)[0][action]();
    });
  }

  aufZu() {
    this.doWithAllPanels(this.expanded ? "close" : "expand");
    this.expanded = !this.expanded;
  }
}
</script>

<style></style>
