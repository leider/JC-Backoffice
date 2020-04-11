<template lang="pug">
.col-xl-4.col-md-6
  .card.mb-2(:class="'border-' + colorCode")
    .card-header.p-0(:class="'color-' + colorCode")
      table(v-if="!veranstaltung.kopf.confirmed", width="100%")
        tr: td.p-0(colspan=2)
          h5.m-0.alert-danger.text-center
            i.fas.fa-exclamation-circle.fa-fw
            | #{' '} UNBESTÄTIGT #{' '}
            i.fas.fa-exclamation-circle.fa-fw
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
      table(width="100%")
        tr
          td.p-0(width="33%"): checked-button(:veranstaltung="veranstaltung", name="presse")
          td.p-0(width="33%"): checked-button(:veranstaltung="veranstaltung", name="technik")
          td.p-0(v-if="veranstaltung.artist.brauchtHotel", width="33%"): checked-button(:veranstaltung="veranstaltung", name="hotel")
    b-collapse(v-model="expanded")
      .btn-group.btn-group-sm.float-right.m-1
        a.btn.btn-allgemeines(:href="veranstaltung.fullyQualifiedUrl() + '/allgemeines'", title="Allgemeines"): i.fas.fa-fw.fa-keyboard
        a.btn.btn-technik(:href="veranstaltung.fullyQualifiedUrl() + '/technik'", title="Technik"): i.fas.fa-fw.fa-microphone-alt
        a.btn.btn-ausgaben(:href="veranstaltung.fullyQualifiedUrl() + '/ausgaben'", title="Ausgaben"): i.fas.fa-fw.fa-euro-sign
        a.btn.btn-hotel(v-if="veranstaltung.artist.brauchtHotel", :href="veranstaltung.fullyQualifiedUrl() + '/hotel'", title="Hotel"): i.fas.fa-fw.fa-bed
        a.btn.btn-kasse(:href="veranstaltung.fullyQualifiedUrl() + '/kasse'", title="Kasse"): i.fas.fa-fw.fa-money-bill-alt
        a.btn.btn-presse(:href="veranstaltung.fullyQualifiedUrl() + '/presse'", title="Presse"): i.fas.fa-fw.fa-newspaper
        span.btn.btn-light(v-if="!veranstaltung.kopf.confirmed")
          i.fas.fa-fw.fa-trash-alt.text-danger
        a.btn.btn-copy(:href="veranstaltung.fullyQualifiedUrl() + '/copy'", title="Kopieren"): i.fas.fa-fw.fa-copy
        b-button.btn.btn-sm.btn-success(title="Speichern", @click="saveVeranstaltung"): i.fas.fa-fw.fa-save
      table.table.table-striped.table-sm
        tbody
          tr: td(colspan=3): h5.mb-0 Kasse
          staff-row-admin(label="Eins:", sectionName="kasseV", :users="users", :veranstaltung="veranstaltung")
          staff-row-admin(label="Zwei:", sectionName="kasse", :users="users", :veranstaltung="veranstaltung")
          tr: td(colspan=3): h5.mb-0 Techniker
          staff-row-admin(label="Eins:", sectionName="technikerV", :users="users", :veranstaltung="veranstaltung")
          staff-row-admin(label="Zwei:", sectionName="techniker", :users="users", :veranstaltung="veranstaltung")
          tr: td(colspan=3): h5.mb-0 Master
          staff-row-admin(label="", sectionName="mod", :users="users", :veranstaltung="veranstaltung")
          tr: td(colspan=3): h5.mb-0 Merchandise
          staff-row-admin(label="", sectionName="merchandise", :users="users", :veranstaltung="veranstaltung")
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import fieldHelpers from "../../../lib/commons/fieldHelpers";
import { saveVeranstaltung } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import User from "../../../lib/users/user";
import Kopf from "../../../lib/veranstaltungen/object/kopf";
import Staff from "../../../lib/veranstaltungen/object/staff";
import CheckedButton from "@/views/team/CheckedButton.vue";
import StaffRowAdmin from "@/views/team/StaffRowAdmin.vue";

@Component({ components: { StaffRowAdmin, CheckedButton } })
export default class TeamPanelAdmin extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() users!: User[];
  @Prop() initiallyExpanded?: boolean;

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

  saveVeranstaltung(): void {
    saveVeranstaltung(this.veranstaltung, (err: Error) => {
      if (err) {
        console.log(err);
      }
    });
  }
}
</script>
