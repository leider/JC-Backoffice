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
    b-tab(title="Übersicht", :active="'uebersicht' === tab", @click="tabActivated('uebersicht')")
      .row: .col-12
        p(v-for="veran in veranstaltungen", :key="veran.id")
          b {{ veran.kopf.titel }}<br>
          b: i {{ veran.startDatumUhrzeit().wochentagTagMonat }}
          b #{' '} // {{ veran.startDatumUhrzeit().uhrzeitKompakt }} Uhr<br>
          | {{ veran.kopf.presseInEcht() }}
      .row: .col-12
        h3 Bilder
      .row
        .col-lg-6(v-for="veran in veranstaltungenMitBildern", :key="veran.id")
          p &nbsp;
          p: b {{ veran.kopf.titel }}
          span(v-for="bild in veran.presse.image", :key="bild")
            img(:src="`/upload/${encodeURIComponent(bild)}`", width="100%")
            br
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import Renderer from "../../../lib/commons/renderer";
import { veranstaltungenBetween } from "@/commons/loader";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";

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
    this.$router.replace(`/infos/${this.monat}/${section}`);
  }
}
</script>
