<template lang="pug">
.col-xl-4.col-md-6
  .card.mb-2(:class="'border-' + colorCode")
    .card-header.p-0(:class="'color-' + colorCode")
      table(width="100%")
        tr.align-top
          td.text-left: a(v-if="!nobodyNeeded", @click="toggleExpanded")
            b-icon-caret-down(v-if="expanded")
            b-icon-caret-right(v-else)
          td: a(@click="toggleExpanded")
            h6 {{ veranstaltung.datumForDisplayShort }}

          td.text-right: .btn-group
            .btn.py-0.px-1.color-reservix(v-if="veranstaltung.reservixID")
              i.logo-reservix
              | &nbsp; {{ veranstaltung.salesreport.anzahl }}
            b-button.btn-secondary.py-0.px-1(:to="veranstaltung.fullyQualifiedUrl + '/preview'"): b-icon-eye-fill
      table.position-relative(width="100%")
        tr
          td
          td(colspan=2): a.stretched-link.inherit-color(@click="toggleExpanded"): h6 {{ kopf.presseIn }}
        tr
          td
          td(colspan=2): a.stretched-link.inherit-color(@click="toggleExpanded"): h5 {{ kopf.titelMitPrefix }}
      h5.alert-danger.p-1.mb-0(v-if="kasseFehlt")
        b-icon-exclamation-circle-fill
        | #{' '} Kasse gesucht!
      h5.alert-success.p-1.mb-0(v-if="nobodyNeeded")
        b-icon-check2-circle(scale=1.1)
        | #{' '} Niemand benötigt
    b-collapse(v-if="!nobodyNeeded", v-model="expanded")
      table.table.table-striped.table-sm
        tbody
          tr(v-if="!staff.kasseVNotNeeded || !staff.kasseNotNeeded")
            td(colspan=3): h5.mb-0 Kasse
          staff-row(v-if="!staff.kasseVNotNeeded", label="Eins:", sectionName="kasseV", :user="user", :veranstaltung="veranstaltung")
          staff-row(v-if="!staff.kasseNotNeeded", label="Zwei:", sectionName="kasse", :user="user", :veranstaltung="veranstaltung")
          tr(v-if="!staff.technikerVNotNeeded || !staff.technikerNotNeeded")
            td(colspan=3): h5.mb-0 Techniker
          staff-row(
            v-if="!staff.technikerVNotNeeded",
            label="Eins:",
            sectionName="technikerV",
            :user="user",
            :veranstaltung="veranstaltung"
          )
          staff-row(v-if="!staff.technikerNotNeeded", label="Zwei:", sectionName="techniker", :user="user", :veranstaltung="veranstaltung")
          tr(v-if="!staff.modNotNeeded")
            td(colspan=3): h5.mb-0 Master
          staff-row(v-if="!staff.modNotNeeded", label="", sectionName="mod", :user="user", :veranstaltung="veranstaltung")
          tr(v-if="!staff.merchandiseNotNeeded")
            td(colspan=3): h5.mb-0 Merchandise
          staff-row(v-if="!staff.merchandiseNotNeeded", label="", sectionName="merchandise", :user="user", :veranstaltung="veranstaltung")
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import fieldHelpers from "../../../../shared/commons/fieldHelpers";
import User from "../../../../shared/user/user";
import Veranstaltung from "../../../../shared/veranstaltung/veranstaltung";
import Staff from "../../../../shared/veranstaltung/staff";
import Kopf from "../../../../shared/veranstaltung/kopf";
import StaffRow from "./StaffRow.vue";

@Component({ components: { StaffRow } })
export default class TeamPanelUser extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() user!: User;
  @Prop() initiallyExpanded!: boolean;

  private expanded = this.initiallyExpanded;

  close(): void {
    this.expanded = false;
  }

  expand(): void {
    this.expanded = true;
  }

  get kopf(): Kopf {
    return this.veranstaltung.kopf;
  }

  get staff(): Staff {
    return this.veranstaltung.staff;
  }

  get kasseFehlt(): boolean {
    return (!this.staff.kasseNotNeeded && this.staff.kasse.length === 0) || (!this.staff.kasseVNotNeeded && this.staff.kasseV.length === 0);
  }

  get nobodyNeeded(): boolean {
    return (
      this.staff.technikerNotNeeded &&
      this.staff.technikerVNotNeeded &&
      this.staff.kasseNotNeeded &&
      this.staff.kasseVNotNeeded &&
      this.staff.merchandiseNotNeeded &&
      this.staff.modNotNeeded
    );
  }

  get colorCode(): string {
    return fieldHelpers.cssColorCode(this.kopf.eventTyp);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }
}
</script>
