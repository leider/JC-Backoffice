<template lang="pug">
.card.mb-2(:class="`border-${this.section}`")
  h5.card-header.p-2.position-relative(:class="`color-${this.section}`")
    a.stretched-link.inherit-color(@click="toggleExpanded"): b
      b-icon-caret-down(v-if="expanded")
      b-icon-caret-right(v-else)
      | &nbsp;{{ title }}
      b(v-if="hasMoney")
        .float-right {{ moneyFormatted }} €
  b-collapse.p-1(v-model="expanded")
    slot
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { formatToGermanNumberString } from "../commons/utilityFunctions";

@Component
export default class LegendCard extends Vue {
  @Prop() section!: string;
  @Prop() title!: string;
  @Prop() money!: number;
  @Prop() hasMoney!: boolean;

  private expanded = true;

  get moneyFormatted(): string {
    return formatToGermanNumberString(this.money || 0);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }
}
</script>
