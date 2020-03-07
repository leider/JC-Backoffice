<template lang="pug">
.row
  .col-12
    PanelsForMonat(v-for="monat in monate", :key="monat", :monat="monat", :veranstaltungen="veranstaltungenNachMonat[monat]")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import { groupBy } from "ramda";
import PanelsForMonat from "@/views/team/PanelsForMonat.vue";

@Component({ components: { PanelsForMonat } })
export default class PanelsForUsers extends Vue {
  @Prop() veranstaltungen!: Veranstaltung[];

  get veranstaltungenNachMonat() {
    const filteredVeranstaltungen = this.veranstaltungen.filter(v => v.kopf.confirmed);
    return groupBy(veranst => veranst.startDatumUhrzeit().monatLangJahrKompakt, filteredVeranstaltungen);
  }

  get monate() {
    return Object.keys(this.veranstaltungenNachMonat);
  }
}
</script>

<style></style>
