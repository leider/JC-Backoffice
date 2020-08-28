<template lang="pug">
.col-lg-6
  .card.border-allgemeines
    h3.card-header.p-2.color-allgemeines {{ title }}
      button.btn.btn-secondary.float-right(:disabled="!isSomeSelected" @click="meldungClicked") Erzeugen
    div
      gema-monat(v-for="monat in monate", :key="monat", :veranstaltungen="veranstaltungenGrouped[monat]", :monat="monat")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import groupBy = require("lodash/groupBy");
import { renderart, TransferObject, VeranstaltungZeileMitCheck, vorNach } from "@/views/gema/SharedGemaTypes";
import GemaMonat from "@/views/gema/GemaMonat.vue";

@Component({ components: { GemaMonat } })
export default class GemaSection extends Vue {
  @Prop() vorNach!: vorNach;
  @Prop() veranstaltungen!: VeranstaltungZeileMitCheck[];
  @Prop() format!: renderart;

  get title(): string {
    return this.vorNach === "zukuenftige" ? "Vorabmeldung" : "Nachmeldung";
  }

  get monate(): string[] {
    return Object.keys(this.veranstaltungenGrouped);
  }

  get veranstaltungenGrouped(): { [index: string]: VeranstaltungZeileMitCheck[] } {
    return groupBy(this.veranstaltungen, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
  }

  get isSomeSelected(): boolean {
    return !!this.veranstaltungen.find((v) => v.selected);
  }

  meldungClicked(): void {
    const selectedIds: string[] = this.veranstaltungen.filter((v) => v.selected).map((v) => v.id);

    const transferObject: TransferObject = { selectedIds, renderart: this.format, vorNach: this.vorNach };
    window.open(`/gema/meldung?transferObject=${encodeURIComponent(JSON.stringify(transferObject))}`);
  }
}
</script>
