<template lang="pug">
.form-group.row
  .col-sm-3
  label.col-6.col-form-label {{ label }}
  .col-6.col-sm-3
    jazz-currency-pure(v-model="val")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import JazzLabel from "@/widgets/JazzLabel.vue";
import JazzCurrencyPure from "@/widgets/JazzCurrencyPure.vue";

@Component({ components: { JazzCurrencyPure, JazzLabel } })
export default class LabelCurrencyRow extends Vue {
  @Prop() value!: number;
  @Prop() label!: string;

  get val(): number {
    return this.value;
  }

  set val(val: number) {
    this.$emit("input", val);
  }
}
</script>
