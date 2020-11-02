<template lang="pug">
.col-12
  .btn-group.float-right
    b-button.btn.btn-light(@click="neu", title="Neuer Ort", :disabled="tab !== 'orte'")
      b-icon-file-earmark
      | #{" "} Neuer Ort
    b-button.btn.btn-success(:disabled="!dirty", @click="saveOptionen", title="Speichern")
      b-icon-check-square
      | #{" "}Speichern
  h1 Optionen
  b-tabs.optionen(active-nav-item-class="font-weight-bold text-uppercase")
    b-tab(title="Optionen", :active="'optionen' === tab", @click="tabActivated('optionen')")
      legend-card(section="allgemeines", title="Allgemein")
        .form-group
          jazz-label(label="Veranstaltungstypen")
          multi-select(v-model="optionen.typen", :options="alleTypen", :allowNewTags="true")
        .form-group
          jazz-label(label="Kooperationen")
          multi-select(v-model="optionen.kooperationen", :options="alleKooperationen", :allowNewTags="true")
        .form-group
          jazz-label(label="Genres")
          multi-select(v-model="optionen.genres", :options="alleGenres", :allowNewTags="true")
      legend-card(section="technik", title="Backlines")
        .form-group
          jazz-label(label="Jazzclub")
          multi-select(v-model="optionen.backlineJazzclub", :options="alleJCbacklines", :allowNewTags="true")
        .form-group
          jazz-label(label="Rockshop")
          multi-select(v-model="optionen.backlineRockshop", :options="alleRockshopBacklines", :allowNewTags="true")
    b-tab(title="Künstler", :active="'kuenstler' === tab", @click="tabActivated('kuenstler')")
      legend-card(section="allgemeines", title="Künstler")
        multi-select(v-model="optionen.artists", :options="allArtists", :allowNewTags="true", open-direction="below")
    b-tab(title="Orte", :active="'orte' === tab", @click="tabActivated('orte')")
      .row
        .col-12
          .table-responsive(style="min-height:500px")
            table.table.table-sm.table-striped
              tbody
                tr
                  th(style="width:25%") Name
                  th(style="width:25%") Fläche
                  th(style="width:25%") Für Presse
                  th(style="width:25%") Für Presse mit "in"
                  th
                  th
                ort-row(v-for="(ort, index) in orte.orte", :key="index", :ort="ort", @loeschen="deleteOrt(ort)", @speichern="saveOrt()")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { optionen, orte, saveOptionen, saveOrte } from "@/commons/loader";
import Orte, { Ort } from "../../../lib/optionen/orte";
import OrtRow from "@/views/options/OrtRow.vue";
import OptionValues from "../../../lib/optionen/optionValues";
import MultiSelect from "@/widgets/MultiSelect.vue";
import LegendCard from "@/widgets/LegendCard.vue";
import JazzLabel from "@/widgets/JazzLabel.vue";

@Component({
  components: { JazzLabel, LegendCard, MultiSelect, OrtRow },
})
export default class Optionen extends Vue {
  @Prop() tab!: string;

  private orte: Orte = new Orte();
  private optionen: OptionValues = new OptionValues();
  private allArtists: string[] = [];
  private alleTypen: string[] = [];
  private alleKooperationen: string[] = [];
  private alleGenres: string[] = [];
  private alleJCbacklines: string[] = [];
  private alleRockshopBacklines: string[] = [];
  private dirty = false;
  private originalOptionen = new OptionValues();

  @Watch("$url")
  mounted(): void {
    document.title = "Optionen";
    orte((orte: Orte) => {
      this.orte = orte;
    });
    optionen(this.initOptionen);
  }

  private initOptionen(optionen: OptionValues) {
    this.optionen = optionen;
    this.allArtists = [...optionen.artists];
    this.alleTypen = [...optionen.typen];
    this.alleKooperationen = [...optionen.kooperationen];
    this.alleGenres = [...optionen.genres];
    this.alleJCbacklines = [...optionen.backlineJazzclub];
    this.alleRockshopBacklines = [...optionen.backlineRockshop];
  }

  tabActivated(section: string): void {
    if (this.tab !== section) {
      this.$router.replace(`/optionen/${section}`);
    }
  }

  @Watch("optionen")
  optionenChanged(): void {
    this.originalOptionen = new OptionValues(this.optionen);
  }

  @Watch("optionen", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: object): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }

    this.dirty = normCrLf(this.originalOptionen) !== normCrLf(this.optionen);
  }

  neu(): void {
    if (this.tab === "orte") {
      this.orte.orte.unshift(new Ort());
    }
  }

  saveOrt(): void {
    saveOrte(this.orte, () => {
      // empty by design
    });
  }

  saveOptionen(): void {
    saveOptionen(this.optionen, (err?: Error, optionen?: OptionValues) => {
      if (!err && optionen) {
        this.initOptionen(optionen);
        this.optionenChanged();
        this.somethingChanged();
      }
    });
  }

  deleteOrt(ort: Ort): void {
    const index = this.orte.orte.indexOf(ort);
    this.orte.orte.splice(index, 1);
    this.saveOrt();
  }
}
</script>

<style lang="scss">
.optionen .multiselect__tag {
  font-size: 100%;
}
</style>
