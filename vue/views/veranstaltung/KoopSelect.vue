<template lang="pug">
.form-group
  jazz-label(label="Koop (Rechnung)", tooltip="Anhaken, wenn die Rechnung an den Kooperationspartner gehen soll")
  .input-group
    single-select-pure(v-model="kopf.kooperation", :options="options")
    .input-group-append
      .input-group-text.pl-1.pr-0
        b-form-checkbox(v-model="kopf.rechnungAnKooperation", :disabled="disableCheck")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import Kopf from "../../../backend/lib/veranstaltungen/object/kopf";

@Component({ components: { SingleSelectPure, JazzLabel } })
export default class KoopSelect extends Vue {
  @Prop() kopf!: Kopf;
  @Prop() options!: string[];
  private disableCheck = false;

  @Watch("kopf.kooperation")
  @Watch("kopf")
  koopChanged(koop: string): void {
    this.disableCheck = koop.length < 2;
    if (this.disableCheck) {
      this.kopf.rechnungAnKooperation = false;
    }
  }
}
</script>
<style lang="scss" scoped>
.multiselect {
  width: calc(100% - 29px) !important;
}
</style>
