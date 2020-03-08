<template lang="pug">
.col-xl-4.col-md-6
  .card.mb-2(:class="'border-' + colorCode")
    .card-header.p-0(:class="'color-' + colorCode")
      table(width='100%')
        tr.align-top
          td.text-left: a(@click="toggleExpanded")
            i.far.fa-fw.fa-lg(:class="{'fa-caret-square-right': !expanded, 'fa-caret-square-down': expanded}")
          td: a(@click="toggleExpanded")
            h6 {{veranstaltung.datumForDisplayShort()}}

          td.text-right: .btn-group
            .btn.py-0.px-1.color-reservix(v-if="veranstaltung.reservixID")
              i.logo-reservix
              | &nbsp; {{veranstaltung.salesreport.anzahl}}
            a.btn.btn-secondary.py-0.px-1(:href="`${veranstaltung.fullyQualifiedUrl()}/preview`"): i.fas.fa-eye.fa-lg
        tr
          td
          td(colspan=2): a(@click="toggleExpanded"): h6 {{kopf.presseIn}}
        tr
          td
          td(colspan=2): a(@click="toggleExpanded"): h5 {{kopf.titel}}
      h5.alert-danger.p-1.mb-0(v-if="kasseFehlt")
        i.fas.fa-exclamation-circle
        | #{' '} Kasse gesucht!
      h5.alert-success.p-1.mb-0(v-if="nobodyNeeded")
        i.fas.fa-check-circle
        | #{' '} Kooperation
    b-collapse(v-if="!nobodyNeeded", v-model="expanded")
      table.table.table-striped.table-sm
        tbody
          tr(v-if="!staff.kasseVNotNeeded || !staff.kasseNotNeeded")
            td(colspan=3): h5.mb-0 Kasse
          StaffRow(v-if="!staff.kasseVNotNeeded", label="Eins:", :section="staff.kasseV", :user="user", v-on:saveVeranstaltung="saveVeranstaltung")
          StaffRow(v-if="!staff.kasseNotNeeded", label="Zwei:", :section="staff.kasse", :user="user", v-on:saveVeranstaltung="saveVeranstaltung")
          tr(v-if="!staff.technikerVNotNeeded || !staff.technikerNotNeeded")
            td(colspan=3): h5.mb-0 Techniker
          StaffRow(v-if="!staff.technikerVNotNeeded", label="Eins:", :section="staff.technikerV", :user="user", v-on:saveVeranstaltung="saveVeranstaltung")
          StaffRow(v-if="!staff.technikerNotNeeded", label="Zwei:", :section="staff.techniker", :user="user", v-on:saveVeranstaltung="saveVeranstaltung")
          tr(v-if="!staff.modNotNeeded")
            td(colspan=3): h5.mb-0 Master
          StaffRow(v-if="!staff.modNotNeeded", label="", :section="staff.mod", :user="user", v-on:saveVeranstaltung="saveVeranstaltung")
          tr(v-if="!staff.merchandiseNotNeeded")
            td(colspan=3): h5.mb-0 Merchandise
          StaffRow(v-if="!staff.merchandiseNotNeeded", label="", :section="staff.merchandise", :user="user", v-on:saveVeranstaltung="saveVeranstaltung")
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import fieldHelpers from "../../../lib/commons/fieldHelpers";
import { saveVeranstaltung } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import StaffRow from "@/views/team/StaffRow.vue";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import User from "../../../lib/users/user";

@Component({ components: { StaffRow } })
export default class Panel extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() nearFuture!: DatumUhrzeit;
  @Prop() user!: User;

  private expanded = this.veranstaltung.startDatumUhrzeit().istVor(this.nearFuture);

  private id = "ID";

  get collapseId() {
    return `collapse${this.veranstaltung.id}`;
  }

  close() {
    this.expanded = false;
  }

  expand() {
    this.expanded = true;
  }

  get kopf() {
    return this.veranstaltung.kopf;
  }

  get staff() {
    return this.veranstaltung.staff;
  }

  get kasseFehlt() {
    return (!this.staff.kasseNotNeeded && this.staff.kasse.length === 0) || (!this.staff.kasseVNotNeeded && this.staff.kasseV.length === 0);
  }

  get nobodyNeeded() {
    return (
      this.staff.technikerNotNeeded &&
      this.staff.technikerVNotNeeded &&
      this.staff.kasseNotNeeded &&
      this.staff.kasseVNotNeeded &&
      this.staff.merchandiseNotNeeded &&
      this.staff.modNotNeeded
    );
  }

  get colorCode() {
    return fieldHelpers.cssColorCode(this.kopf.eventTyp);
  }

  saveVeranstaltung() {
    saveVeranstaltung(this.veranstaltung, (res: any) => {
      this.$emit("veranstaltungSaved", new Veranstaltung(res));
    });
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
  }
}
</script>

<style></style>
