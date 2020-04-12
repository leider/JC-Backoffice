<template lang="pug">
.col-12
  .row
    .col-12
      .page-header
        .float-right
          label 'PDF / CSV'
          b-form-select(v-model="format", :options="['PDF', 'CSV']", size="sm")
        h2 Gema
  .row
    .col-lg-6
      .card.mb-2.border-allgemeines
        h3.card-header.p-2.color-allgemeines Vorabmeldung
          button.btn.btn-secondary.float-right(@click="meldungClicked(zukuenftige, 'zukuenftige')") Erzeugen
        .p-1
          gema-monat(v-for="monat in monate(zukuenftigeGrouped)", :key="monat", :veranstaltungen = "zukuenftigeGrouped[monat]", :monat="monat")
    .col-lg-6
      .card.mb-2.border-allgemeines
        h3.card-header.p-2.color-allgemeines Nachmeldung
          button.btn.btn-secondary.float-right(@click="meldungClicked(vergangene, 'vergangene')") Erzeugen
        .p-1
          gema-monat(v-for="monat in monate(vergangeneGrouped)", :key="monat", :veranstaltungen = "vergangeneGrouped[monat]", :monat="monat")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { veranstaltungenForTeam } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import { groupBy, sortBy } from "lodash";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { renderart, TransferObject, VeranstaltungZeileMitCheck, vorNach } from "@/views/gema/SharedGemaTypes";
import GemaMonat from "@/views/gema/GemaMonat.vue";

@Component({ components: { GemaMonat } })
export default class Gema extends Vue {
  private veranstaltungen: VeranstaltungZeileMitCheck[] = [];
  private format: renderart = "PDF";
  private heute = new DatumUhrzeit();

  created(): void {
    this.reloadVeranstaltungen();
  }

  reloadVeranstaltungen(): void {
    document.title = "Gema";
    veranstaltungenForTeam("alle", (veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen.map((v) => {
        return { id: v.id || "", description: v.description(), startDatumUhrzeit: v.startDatumUhrzeit(), selected: false };
      });
    });
  }

  monate(groupedVeranst: { [index: string]: Veranstaltung[] }): string[] {
    return Object.keys(groupedVeranst);
  }

  get zukuenftige(): VeranstaltungZeileMitCheck[] {
    return sortBy(
      this.veranstaltungen.filter((v) => v.startDatumUhrzeit.istNach(this.heute)),
      (v) => v.startDatumUhrzeit
    );
  }

  get vergangene(): VeranstaltungZeileMitCheck[] {
    const result = sortBy(
      this.veranstaltungen.filter((v) => v.startDatumUhrzeit.istVor(this.heute)),
      (v) => v.startDatumUhrzeit
    );
    result.reverse();
    return result;
  }

  get zukuenftigeGrouped(): { [index: string]: VeranstaltungZeileMitCheck[] } {
    return groupBy(this.zukuenftige, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
  }

  get vergangeneGrouped(): { [index: string]: VeranstaltungZeileMitCheck[] } {
    return groupBy(this.vergangene, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
  }

  meldungClicked(veranstaltungen: VeranstaltungZeileMitCheck[], vorNach: vorNach): void {
    const selectedIds: string[] = veranstaltungen.filter((v) => v.selected).map((v) => v.id);

    const transferObject: TransferObject = { selectedIds, renderart: this.format, vorNach };
    window.open(`/gema/meldung?transferObject=${encodeURIComponent(JSON.stringify(transferObject))}`);
  }
}
</script>
