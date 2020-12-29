<template lang="pug">
.col-xl-4.col-md-6
  .card.mb-2(:class="'border-' + colorCode")
    .card-header.p-0(:class="'color-' + colorCode")
      table(v-if="!veranstaltung.kopf.confirmed", width="100%")
        tr: td.p-0(colspan=2)
          h5.m-0.alert-danger.text-center
            b-icon-exclamation-circle-fill
            | #{' '} UNBESTÄTIGT #{' '}
            b-icon-exclamation-circle-fill
      table(width="100%", v-if="expanded")
        tr.align-top
          td.text-left: a(@click="toggleExpanded")
            b-icon-caret-down
          td: a(@click="toggleExpanded")
            h6 {{ veranstaltung.datumForDisplayShort }}

          td.text-right: .btn-group
            .btn.py-0.px-1.color-reservix(v-if="veranstaltung.reservixID")
              i.logo-reservix
              | &nbsp; {{ veranstaltung.salesreport.anzahl }}
            b-button.btn-secondary.py-0.px-1(:to="veranstaltung.fullyQualifiedUrl + '/preview'"): b-icon-eye-fill
      table(width="100%", v-else)
        tr.align-top
          td.text-left: a(@click="toggleExpanded")
            b-icon-caret-right
          td.text-left: a(@click="toggleExpanded")
            h5 {{ veranstaltung.startDatumUhrzeit.tagNumerisch }}
          td: a(@click="toggleExpanded")
            h5 {{ kopf.titelMitPrefix }} &nbsp;
              small(style="color: inherit") {{ kopf.presseIn }}

          td.text-right: .btn-group
            .btn.py-0.px-1.color-reservix(v-if="veranstaltung.reservixID")
              i.logo-reservix
              | &nbsp; {{ veranstaltung.salesreport.anzahl }}
            b-button.btn-secondary.py-0.px-1(:to="veranstaltung.fullyQualifiedUrl + '/preview'"): b-icon-eye-fill
      table.position-relative(width="100%", v-if="expanded")
        tr
          td
          td(colspan=2): a.stretched-link.inherit-color(@click="toggleExpanded"): h6 {{ kopf.presseIn }}
        tr
          td
          td(colspan=2): a.stretched-link.inherit-color(@click="toggleExpanded"): h5 {{ kopf.titelMitPrefix }}
      table(width="100%")
        tr
          td.p-0(width="33%"): checked-button(:veranstaltung="veranstaltung", name="presse")
          td.p-0(width="33%"): checked-button(:veranstaltung="veranstaltung", name="technik")
          td.p-0(v-if="veranstaltung.artist.brauchtHotel", width="33%"): checked-button(:veranstaltung="veranstaltung", name="hotel")
    b-collapse(v-model="expanded")
      .btn-group.btn-group-sm.float-right.m-1
        b-button.btn-allgemeines(:to="veranstaltung.fullyQualifiedUrl + '/allgemeines'", title="Allgemeines"): b-icon-keyboard(scale=1.2)
        b-button.btn-technik(:to="veranstaltung.fullyQualifiedUrl + '/technik'", title="Technik"): b-icon-headphones(scale=1.2)
        b-button.btn-ausgaben(:to="veranstaltung.fullyQualifiedUrl + '/kalkulation'", title="Ausgaben"): b-icon-graph-up
        b-button.btn-hotel(v-if="veranstaltung.artist.brauchtHotel", :to="veranstaltung.fullyQualifiedUrl + '/hotel'", title="Hotel"): b-icon-house-door(
          scale=1.2
        )
        b-button.btn-kasse(:to="veranstaltung.fullyQualifiedUrl + '/kasse'", title="Kasse"): b-icon-cash-stack(scale=1.2)
        b-button.btn-presse(:to="veranstaltung.fullyQualifiedUrl + '/presse'", title="Presse"): b-icon-newspaper(scale=1.2)
        b-button.btn.btn-light(v-if="!veranstaltung.kopf.confirmed", v-b-modal="`dialog-${veranstaltung.id}`")
          b-icon-trash.text-danger
          b-modal(:id="`dialog-${veranstaltung.id}`", no-close-on-backdrop, @ok="deleteVeranstaltung")
            p Bist Du sicher, dass Du {{ veranstaltung.kopf.titel }} löschen willst?
            template(v-slot:modal-header)
              h3.modal-title Veranstaltung löschen
            template(v-slot:modal-footer="{ ok, cancel }")
              .row: .col-12: .btn-group.float-right
                b-button.btn.btn-light(@click="cancel()") Abbrechen
                b-button.btn.btn-danger.text(@click="deleteVeranstaltung")
                  b-icon-trash
                  | &nbsp;Löschen
        b-button.btn-copy(:to="veranstaltung.fullyQualifiedUrl + '/copy'", title="Kopieren"): b-icon-files
        b-button.btn.btn-success(title="Speichern", @click="saveVeranstaltung"): b-icon-check-square
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
import { Component, Prop, Vue } from "vue-property-decorator";
import fieldHelpers from "../../../../shared/commons/fieldHelpers";
import User from "../../../../shared/user/user";
import Veranstaltung from "../../../../shared/veranstaltung/veranstaltung";
import { deleteVeranstaltungWithId, saveVeranstaltung } from "@/commons/loader";
import StaffRowAdmin from "./StaffRowAdmin.vue";
import Staff from "../../../../shared/veranstaltung/staff";
import Kopf from "../../../../shared/veranstaltung/kopf";
import CheckedButton from "./CheckedButton.vue";

@Component({ components: { StaffRowAdmin, CheckedButton } })
export default class TeamPanelAdmin extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() users!: User[];
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

  get colorCode(): string {
    return fieldHelpers.cssColorCode(this.kopf.eventTyp);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  deleteVeranstaltung(): void {
    if (this.veranstaltung.id) {
      deleteVeranstaltungWithId(this.veranstaltung.id, (err?: Error) => {
        if (!err) {
          this.$emit("deleted");
        }
      });
    }
  }

  saveVeranstaltung(): void {
    saveVeranstaltung(this.veranstaltung, () => {
      // empty by design
    });
  }
}
</script>
