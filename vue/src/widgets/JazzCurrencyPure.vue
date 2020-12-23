<template lang="pug">
b-input-group(append="€")
  b-form-input.text-right(v-model="wert", type="number", :formatter="formatter", lazy-formatter, lazy)
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

function formatTwoDigits(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(num);
}

@Component
export default class JazzCurrencyPure extends Vue {
  @Prop() label!: string;
  @Prop() value!: number;
  @Prop() tooltip!: string | undefined;
  @Prop() required!: boolean;

  get wert(): string {
    return formatTwoDigits(this.value);
  }

  set wert(wert: string) {
    this.$emit("input", parseFloat(wert));
  }

  formatter(value: string): string {
    return formatTwoDigits(parseFloat(value));
  }
}
</script>
