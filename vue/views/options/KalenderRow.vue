<template lang="pug">
tr
  td: b-form-input(v-model="kalender.name")
  td: b-form-input(v-model="kalender.url")
  td: single-select-pure(v-model="kalender.typ", :options="['Sonstiges', 'Feiertag', 'Ferien', 'Vermietung']")
  td: delete-button-with-dialog(:id="kalender.name", :name="kalender.name", objecttype="Kalender", :callback="loeschen", :dirty="dirty")
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Ical } from "../../../shared/optionen/ferienIcals";
import DeleteButtonWithDialog from "../../widgets/DeleteButtonWithDialog.vue";
import SingleSelectPure from "../../widgets/SingleSelectPure.vue";
import JazzDatePure from "../../widgets/JazzDatePure.vue";

@Component({ components: { DeleteButtonWithDialog, SingleSelectPure, JazzDatePure } })
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
