<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  b-form-input.text-right(:value="valueString", type="number", :min="min", :max="max", :state="state")
  b-form-invalid-feedback Muss ausgefüllt werden
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
@Component({
  components: { JazzLabel },
})
export default class JazzNumber extends Vue {
  @Prop() label!: string;
  @Prop() value!: number;
  @Prop() min!: string;
  @Prop() max!: string;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;

  get valueString(): string {
    return this.value.toString(10);
  }

  set valueString(s: string) {
    this.$emit("input", parseInt(s, 10));
  }

  get state(): boolean | null {
    if (!this.required) {
      return null;
    }
    return !!this.value && this.valueString.length > 0 ? null : false;
  }
}
</script>
