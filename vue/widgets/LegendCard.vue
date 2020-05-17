<template lang="pug">
.card.mb-2(:class="`border-${this.section}`")
  h5.card-header.p-2.position-relative(:class="`color-${this.section}`")
    a.inherit-color.stretched-link(@click="toggleExpanded"): b
      i.far.fa-fw(:class="{'fa-caret-square-right': !expanded, 'fa-caret-square-down': expanded}")
      | &nbsp;{{title}}
    if optionalCurrencySpan
      b: +currencySpan(optionalMoney, optionalCurrencySpan, 'float-right')
  b-collapse.p-1(v-model="expanded")
    slot

</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LegendCard extends Vue {
  @Prop() section!: string;
  @Prop() title!: string;
  private expanded = true;

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }
}
</script>
