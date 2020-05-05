<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-input-group(append="€")
    b-form-input.text-right(v-model="wert", type="number", step="0.01", :state="state")
  b-form-invalid-feedback Bitte eine deutsche Zahl eingeben
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
@Component({
  components: { JazzLabel },
})
export default class JazzCurrency extends Vue {
  @Prop() label!: string;
  @Prop() value!: number;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;

  get wert(): string {
    return this.value.toString();
  }

  set wert(wert: string) {
    console.log("Hallo" + wert);
    this.$emit("input", Number.parseFloat(wert));
  }

  get state(): boolean | null {
    if (!this.required) {
      return null;
    }
    return this.value ? null : false;
  }
}
</script>
