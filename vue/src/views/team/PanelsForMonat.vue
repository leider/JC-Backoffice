<template lang="pug">
div
  h4.pt-1.pb-2.px-1.bg-primary.text-white.position-relative
    a.stretched-link.inherit-color(@click="aufZu")
      b-icon-caret-down(v-if="expanded")
      b-icon-caret-right(v-else)
      | #{ " " } {{ monat }} &nbsp;
    .btn-group.btn-group-sm.float-right
      b-link.btn.btn-secondary.btn-sm(:to="`/infos/${datumErsteVeranstaltung.fuerUnterseiten}/pressetexte`")
        b-icon-file-text
        | #{ ' ' } Presseexte
      b-link.btn.btn-secondary.btn-sm(:to="`/infos/${datumErsteVeranstaltung.fuerUnterseiten}/uebersicht`")
        b-icon-file-spreadsheet
        | #{ ' ' } Übersicht
  .row
    team-panel-user(
      v-if="!admin",
      v-for="veranstaltung in veranstaltungen",
      :key="veranstaltung.id",
      :ref="veranstaltung.id",
      :veranstaltung="veranstaltung",
      :initiallyExpanded="expanded",
      :expanded="expanded",
      :user="user"
    )
    team-panel-admin(
      v-if="admin",
      v-for="veranstaltung in veranstaltungen",
      :key="veranstaltung.id",
      :ref="veranstaltung.id",
      :veranstaltung="veranstaltung",
      :initiallyExpanded="expanded",
      :expanded="expanded",
      :users="users",
      v-on:deleted="deleted(veranstaltung)"
    )
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import User from "jc-shared/user/user";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import TeamPanelUser from "./TeamPanelUser.vue";
import TeamPanelAdmin from "./TeamPanelAdmin.vue";

@Component({ components: { TeamPanelAdmin, TeamPanelUser } })
class PanelsForMonat extends Vue {
  @Prop() monat!: string;
  @Prop() veranstaltungen!: Veranstaltung[];
  @Prop() user!: User;
  @Prop() users!: User[];
  @Prop() admin!: boolean;
  @Prop() datumErsteVeranstaltung!: DatumUhrzeit;
  @Prop() expanded!: boolean;

  deepCopy(veranstaltung: Veranstaltung) {
    console.log("deepCopy");
    return new Veranstaltung(veranstaltung.toJSON());
  }
  doWithAllPanels(action: string): void {
    this.veranstaltungen.forEach((v) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$refs[v.id || ""] as any[])[0][action]();
    });
  }

  aufZu(): void {
    this.doWithAllPanels(this.expanded ? "close" : "expand");
    this.expanded = !this.expanded;
  }

  deleted(veranstaltung: Veranstaltung): void {
    this.$emit("deleted", veranstaltung);
  }
}
export default PanelsForMonat;
</script>
