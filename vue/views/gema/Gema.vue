<template lang="pug">
.col-12
  .row
    .col-12
      .float-right.row
        label.col-form-label.mr-1 Format:
        single-select-pure(v-model="format", :options="['PDF', 'CSV']", size="sm", style="width: 150px")
      h2 Gema
  .row
    gema-section(vorNach="zukuenftige", :veranstaltungen="zukuenftige", :format="format")
    gema-section(vorNach="vergangene", :veranstaltungen="vergangene", :format="format")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { veranstaltungenForTeam } from "../../commons/loader";
import sortBy from "lodash/sortBy";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";
import { renderart, VeranstaltungZeileMitCheck } from "./SharedGemaTypes";
import GemaMonat from "./GemaMonat.vue";
import GemaSection from "./GemaSection.vue";
import SingleSelectPure from "../../widgets/SingleSelectPure.vue";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";

@Component({ components: { GemaSection, GemaMonat, SingleSelectPure } })
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
