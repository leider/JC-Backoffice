<template lang="pug">
  b-input-group(append="€")
    b-form-input.text-right(v-model="wert", type="number")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { formatToEnglishNumberString } from "@/commons/utilityFunctions";

@Component
export default class JazzCurrencyPure extends Vue {
  @Prop() label!: string;
  @Prop() value!: number;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;

  get wert(): string {
    return formatToEnglishNumberString(this.value || 0);
  }

  set wert(wert: string) {
    let result = Number.parseFloat(wert.replace(",", "."));
    if (isNaN(result)) {
      result = 0;
    }
    this.$emit("input", result);
  }
}
</script>
