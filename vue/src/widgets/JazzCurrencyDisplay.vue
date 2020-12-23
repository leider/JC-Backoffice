<template lang="pug">
div
  label.float-right(v-if="label") {{ label }}:
  b: span.text-right.form-control-plaintext.float-right {{ formattedValue }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { formatToGermanNumberString } from "../commons/utilityFunctions";

@Component
export default class JazzCurrencyDisplay extends Vue {
  @Prop() value!: number;
  @Prop() label!: string;

  get formattedValue(): string {
    return `${formatToGermanNumberString(this.value)} €`;
  }
}
</script>
