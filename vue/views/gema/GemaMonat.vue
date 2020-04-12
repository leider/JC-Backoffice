<template lang="pug">
table.table.table-sm.table-striped
  tbody
    tr: th.bg-secondary.text-white
      b-checkbox(@change="monatClicked") {{monat}}
    tr(v-for="veranst in veranstaltungen", :key="veranst.id"): td
      b-checkbox(v-model="veranst.selected") {{veranst.description}}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { VeranstaltungZeileMitCheck } from "@/views/gema/SharedGemaTypes";

@Component
export default class GemaMonat extends Vue {
  @Prop() veranstaltungen!: VeranstaltungZeileMitCheck[];
  @Prop() monat!: string;

  monatClicked(check: boolean): void {
    this.veranstaltungen.forEach((v) => (v.selected = check));
  }
}
</script>
