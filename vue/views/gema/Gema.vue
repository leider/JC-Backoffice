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
    gema-section(vorNach="zukuenftige", :veranstaltungen="zukuenftige", :format="format")
    gema-section(vorNach="vergangene", :veranstaltungen="vergangene", :format="format")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { veranstaltungenForTeam } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import { sortBy } from "lodash";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import { renderart, VeranstaltungZeileMitCheck } from "@/views/gema/SharedGemaTypes";
import GemaMonat from "@/views/gema/GemaMonat.vue";
import GemaSection from "@/views/gema/GemaSection.vue";

@Component({ components: { GemaSection, GemaMonat } })
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
}
</script>
