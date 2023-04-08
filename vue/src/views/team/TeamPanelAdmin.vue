<template lang="pug">
.col-xl-4.col-md-6
  .card.mb-2(:class="'border-' + colorCode")
    .card-header.p-0(:class="'color-' + colorCode")
      table(v-if="!veranstaltung.kopf.confirmed", width="100%")
        tr: td.p-0(colspan=2)
          h5.m-0.alert-danger.text-center
            b-icon-exclamation-circle-fill
            | #{ ' ' } UNBESTÄTIGT #{ ' ' }
            b-icon-exclamation-circle-fill
      table(width="100%", v-if="expanded")
        tr.align-top
          td.text-left: a(@click="toggleExpanded")
            b-icon-caret-down
          td: a(@click="toggleExpanded")
            h6 {{ veranstaltung.datumForDisplayShort }}

          td.text-right: .btn-group
            b-button.btn-secondary.py-0.px-1(:to="veranstaltung.fullyQualifiedUrl + '/preview'"): b-icon-eye-fill
        tr
          td
          td(colspan=2): a.stretched-link.inherit-color(@click="toggleExpanded"): h6 {{ kopf.presseIn }}
        tr
          td
          td(colspan=2): a.stretched-link.inherit-color(@click="toggleExpanded"): h5 {{ kopf.titelMitPrefix }}
      table(width="100%", v-else)
        tr.align-top
          td.text-left: a(@click="toggleExpanded")
            b-icon-caret-right
          td.text-left: a(@click="toggleExpanded")
            h5
              small(style="color: inherit") {{ veranstaltung.startDatumUhrzeit.wochentagTagMonat }}
              | &nbsp; {{ kopf.titelMitPrefix }} &nbsp;
              small(style="color: inherit") {{ kopf.ort }}

          td.text-right: .btn-group
            b-button.btn-secondary.py-0.px-1(:to="veranstaltung.fullyQualifiedUrl + '/preview'"): b-icon-eye-fill
      table(width="100%")
        tr
          td.p-0(width="33%"): checked-button(:veranstaltung="veranstaltung", name="presse")
          td.p-0(width="33%"): checked-button(:veranstaltung="veranstaltung", name="technik")
          td.p-0(v-if="veranstaltung.artist.brauchtHotel", width="33%"): checked-button(:veranstaltung="veranstaltung", name="hotel")
    b-collapse(v-model="expanded")
      .btn-group.btn-group-sm.float-right.m-1(v-if="!dirty")
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
      .btn-group.btn-group-sm.float-right.m-1(v-else)
        b-button.btn.btn-success(title="Speichern", @click="saveVeranstaltung")
          b-icon-check-square
          | &nbsp;Speichern
      table.table.table-striped.table-sm
        tbody
          tr: td(colspan=3): h5.mb-0 Kasse
          staff-row-admin(label="Eins:", sectionName="kasseV", :users="userIds", :staff="staff")
          staff-row-admin(label="Zwei:", sectionName="kasse", :users="userIds", :staff="staff")
          tr: td(colspan=3): h5.mb-0 Techniker
          staff-row-admin(label="Eins:", sectionName="technikerV", :users="userIds", :staff="staff")
          staff-row-admin(label="Zwei:", sectionName="techniker", :users="userIds", :staff="staff")
          tr: td(colspan=3): h5.mb-0 Master
          staff-row-admin(label="", sectionName="mod", :users="userIds", :staff="staff")
          tr: td(colspan=3): h5.mb-0 Merchandise
          staff-row-admin(label="", sectionName="merchandise", :users="userIds", :staff="staff")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import User from "jc-shared/user/user";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { deleteVeranstaltungWithId, saveVeranstaltung } from "@/commons/loader";
import StaffRowAdmin from "./StaffRowAdmin.vue";
import Staff from "jc-shared/veranstaltung/staff";
import Kopf from "jc-shared/veranstaltung/kopf";
import CheckedButton from "./CheckedButton.vue";
import { feedbackMessages } from "@/views/general/FeedbackMessages";
import { normCrLf } from "@/commons/utilityFunctions";

@Component({ components: { StaffRowAdmin, CheckedButton } })
export default class TeamPanelAdmin extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() users!: User[];
  @Prop() initiallyExpanded!: boolean;

  @Prop() expanded!: boolean;
  private dirty = false;
  private originalVeranstaltung!: Veranstaltung;

  close(): void {
    this.expanded = false;
  }

  expand(): void {
    this.expanded = true;
  }
  mounted() {
    this.originalVeranstaltung = new Veranstaltung(this.veranstaltung);
  }

  @Watch("veranstaltung", { deep: true })
  somethingChanged(): void {
    const dirtybefore = this.dirty;
    this.dirty = normCrLf(this.originalVeranstaltung.toJSON()) !== normCrLf(this.veranstaltung.toJSON());
    if (this.dirty && !dirtybefore) {
      feedbackMessages.addWarning("Achtung", "Du musst die Veranstaltung speichern!");
    }
  }

  get kopf(): Kopf {
    return this.veranstaltung.kopf;
  }

  get staff(): Staff {
    return this.veranstaltung.staff;
  }

  get userIds() {
    return this.users.map((u) => u.id);
  }

  get colorCode(): string {
    return fieldHelpers.cssColorCode(this.kopf.eventTyp);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  async deleteVeranstaltung() {
    if (this.veranstaltung.id) {
      await deleteVeranstaltungWithId(this.veranstaltung.id);
      this.$emit("deleted");
    }
  }

  async saveVeranstaltung() {
    const result = await saveVeranstaltung(this.veranstaltung);
    if (result) {
      this.originalVeranstaltung = new Veranstaltung(this.veranstaltung.toJSON());
      this.dirty = false;
    }
  }
}
</script>
