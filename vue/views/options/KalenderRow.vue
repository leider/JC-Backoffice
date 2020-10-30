<template lang="pug">
tr
  td: b-form-input(v-model="kalender.name")
  td: b-form-input(v-model="kalender.url")
  td: single-select-pure(v-model="kalender.typ", :options="['Sonstiges', 'Feiertag', 'Ferien', 'Vermietung']")
  td: b-button.btn.btn-danger.float-right(v-b-modal="`dialog-${kalender.name}`")
    b-icon-trash
    b-modal(:id="`dialog-${kalender.name}`", no-close-on-backdrop, @ok="loeschen")
      p Bist Du sicher, dass Du {{ kalender.name }} löschen willst?
      template(v-slot:modal-header)
        h3.modal-title Kalender löschen
      template(v-slot:modal-footer="{ ok, cancel }")
        .row: .col-12: .btn-group.float-right
          b-button.btn.btn-light(@click="cancel()") Abbrechen
          b-button.btn.btn-danger.text(@click="ok()")
            b-icon-trash
            | &nbsp;Löschen
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import JazzDatePure from "@/widgets/JazzDatePure.vue";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import { Ical } from "../../../lib/optionen/ferienIcals";

@Component({ components: { SingleSelectPure, JazzDatePure } })
export default class KalenderRow extends Vue {
  private originalkalender: Ical = new Ical();
  @Prop() kalender!: Ical;

  private dirty = false;

  created(): void {
    this.kalenderChanged();
  }

  loeschen(): void {
    this.$emit("loeschen");
  }

  save(): void {
    this.$emit("speichern");
    this.kalenderChanged();
    this.somethingChanged();
  }

  @Watch("kalender")
  kalenderChanged() {
    this.originalkalender = new Ical(this.kalender);
  }

  @Watch("kalender", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: object): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }

    this.dirty = normCrLf(this.originalkalender) !== normCrLf(this.kalender);
  }
}
</script>
