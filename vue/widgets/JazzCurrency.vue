<template lang="pug">
.form-group
  jazz-label(:label="label", :tooltip="tooltip")
  jazz-currency-pure(v-model="val")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "./JazzLabel.vue";
import JazzCurrencyPure from "./JazzCurrencyPure.vue";

@Component({ components: { JazzCurrencyPure, JazzLabel } })
export default class JazzCurrency extends Vue {
  @Prop() label!: string;
  @Prop() value!: number;
  @Prop() tooltip!: string | undefined;

  get val(): number {
    return this.value;
  }

  set val(val: number) {
    this.$emit("input", val);
  }
}
</script>
