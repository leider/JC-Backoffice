<template lang="pug">
.col-12
  .btn-group.float-right
    a.btn.btn-primary(:href="`/veranstaltungen/imgzip/${monat}`")
      b-icon-download
      | &nbsp;Alle Bilder als ZIP
  h1 Infos für {{ start.monatJahrKompakt }}
  b-tabs(active-nav-item-class="font-weight-bold text-uppercase")
    b-tab(title="Pressetexte", :active="'pressetexte' === tab", @click="tabActivated('pressetexte')")
      .row
        .col-lg-6(v-for="veran in veranstaltungen", :key="veran.id")
          div(v-html="preview(veran)")
          hr
    b-tab(title="Übersicht", :active="'uebersicht' === tab", @click="tabActivated('uebersicht')", lazy)
      .row: .col-12
        p(v-for="veran in veranstaltungen", :key="veran.id")
          b {{ veran.kopf.titelMitPrefix }}<br>
          b: i {{ veran.startDatumUhrzeit().wochentagTagMonat }}
          b #{' '} // {{ veran.startDatumUhrzeit().uhrzeitKompakt }} Uhr<br>
          | {{ veran.kopf.presseInEcht() }}
      .row: .col-12
        h3 Bilder
      .row
        .col-lg-6(v-for="veran in veranstaltungenMitBildern", :key="veran.id")
          p &nbsp;
          p: b {{ veran.kopf.titelMitPrefix }}
          span(v-for="bild in veran.presse.image", :key="bild")
            img(:src="`/upload/${encodeURIComponent(bild)}`", width="100%")
            br
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Renderer from "../../../shared/commons/renderer";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import { veranstaltungenBetween } from "../../commons/loader";

@Component
export default class Monatsinfos extends Vue {
  @Prop() monat!: string; // yymm
  @Prop() tab!: string;
  private veranstaltungen: Veranstaltung[] = [];

  preview(veranstaltung: Veranstaltung): string {
    return Renderer.render(`${veranstaltung.presseTemplate() + veranstaltung.presse.text}

${veranstaltung.presse.fullyQualifiedJazzclubURL()}`);
  }

  get start(): DatumUhrzeit {
    return DatumUhrzeit.forYYMM(this.monat);
  }

  get veranstaltungenMitBildern(): Veranstaltung[] {
    return this.veranstaltungen.filter((v) => v.presse.image.length > 0);
  }

  @Watch("$url")
  mounted(): void {
    document.title = "Monatsinfos";
    veranstaltungenBetween(this.start, this.start.plus({ monate: 1 }), (veranstaltungen: Veranstaltung[]) => {
      this.veranstaltungen = veranstaltungen;
    });
  }

  tabActivated(section: string): void {
    if (this.tab !== section) {
      this.$router.replace(`/infos/${this.monat}/${section}`);
    }
  }
}
</script>
