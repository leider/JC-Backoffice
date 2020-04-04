<template lang="pug">
.row
  .col-12
    PanelsForMonat(v-for="monat in monate", :key="monat", :monat="monat", :veranstaltungen="veranstaltungenNachMonat[monat]", :user="user")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import { groupBy } from "ramda";
import PanelsForMonat from "@/views/team/PanelsForMonat.vue";
import User from "../../../lib/users/user";

@Component({ components: { PanelsForMonat } })
export default class PanelsForUsers extends Vue {
  @Prop() veranstaltungen!: Veranstaltung[];
  @Prop() user!: User;

  get veranstaltungenNachMonat(): { [index: string]: Veranstaltung[] } {
    const filteredVeranstaltungen = this.veranstaltungen.filter((v) => v.kopf.confirmed);
    return groupBy((veranst) => veranst.startDatumUhrzeit().monatLangJahrKompakt, filteredVeranstaltungen);
  }

  get monate(): string[] {
    return Object.keys(this.veranstaltungenNachMonat);
  }
}
</script>
