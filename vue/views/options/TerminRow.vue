<template lang="pug">
tr
  td: jazz-date-pure(v-model="termin.startDate")
  td: jazz-date-pure(v-model="termin.endDate")
  td: b-form-input(v-model="termin.beschreibung")
  td: single-select-pure(v-model="termin.typ", :options="['Sonstiges', 'Feiertag', 'Ferien', 'Vermietung']")
  td: delete-button-with-dialog(
    :id="termin.originalBeschreibung",
    :name="termin.beschreibung",
    objecttype="Termin",
    :callback="loeschen",
    :dirty="dirty"
  )
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { saveTermin } from "@/commons/loader";
import JazzDatePure from "@/widgets/JazzDatePure.vue";
import Termin from "../../../lib/optionen/termin";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import DeleteButtonWithDialog from "@/widgets/DeleteButtonWithDialog.vue";

@Component({ components: { DeleteButtonWithDialog, SingleSelectPure, JazzDatePure } })
export default class TerminRow extends Vue {
  private originaltermin: Termin = new Termin();
  @Prop() termin!: Termin;

  private dirty = false;

  created(): void {
    this.terminChanged();
  }

  loeschen(): void {
    this.$emit("loeschen");
  }

  save(): void {
    saveTermin(this.termin, () => {
      this.termin.originalBeschreibung = this.termin.beschreibung;
      this.terminChanged();
      this.somethingChanged();
    });
  }

  @Watch("termin")
  terminChanged() {
    this.originaltermin = new Termin(this.termin);
  }

  @Watch("termin", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: object): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }

    this.dirty = normCrLf(this.originaltermin.toJSON()) !== normCrLf(this.termin.toJSON());
  }
}
</script>
