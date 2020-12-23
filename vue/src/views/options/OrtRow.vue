<template lang="pug">
tr
  td: b-form-input(v-model="ort.name")
  td: b-form-input(v-model="ort.flaeche")
  td: b-form-input(v-model="ort.pressename")
  td: b-form-input(v-model="ort.presseIn")
  td: delete-button-with-dialog.float-right(:id="ort.name", :name="ort.name", objecttype="Ort", :callback="loeschen", :dirty="dirty")
  td: b-button.btn.btn-success.float-right(@click="save", :disabled="!dirty"): b-icon-check-square
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Ort } from "jc-shared/optionen/orte";
import DeleteButtonWithDialog from "../../widgets/DeleteButtonWithDialog.vue";

@Component({ components: { DeleteButtonWithDialog } })
export default class OrtRow extends Vue {
  private originalort: Ort = new Ort();
  @Prop() ort!: Ort;

  private dirty = false;

  created(): void {
    this.ortChanged();
  }

  loeschen(): void {
    this.$emit("loeschen");
  }

  save(): void {
    this.$emit("speichern");
    this.ortChanged();
    this.somethingChanged();
  }

  @Watch("ort")
  ortChanged(): void {
    this.originalort = new Ort(this.ort);
  }

  @Watch("ort", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: any): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }

    this.dirty = normCrLf(this.originalort) !== normCrLf(this.ort);
  }
}
</script>
