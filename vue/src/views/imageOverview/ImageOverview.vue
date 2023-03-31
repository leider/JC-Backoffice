<template lang="pug">
.col-12
  .row
    .col-12
      .btn-group.float-right
        b-button.btn.btn-success(:disabled="!dirty", @click="save", title="Speichern")
          b-icon-check-square
          | &nbsp; Speichern
      h2 Bilder bearbeiten
  .row
    .col-12
      image-overview-section(title="Bilder ohne Probleme", :rows="imagesWithVeranstaltungen")
      image-overview-section(title="Unbenutzte Bilder", :rows="imagesWithVeranstaltungenUnused")
      image-overview-section(title="Nicht gefundene Bilder", :rows="imagesWithVeranstaltungenNotFound")
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { imagenames, saveImagenames, veranstaltungenForTeam } from "@/commons/loader";
import differenceBy from "lodash/differenceBy";
import intersection from "lodash/intersection";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import { ImageOverviewRow, ImageOverviewVeranstaltung } from "jc-shared/veranstaltung/veranstaltung";
import ImageOverviewSection from "./ImageOverviewSection.vue";

@Component({
  components: { ImageOverviewSection },
})
export default class ImageOverview extends Vue {
  private veranstaltungen: ImageOverviewVeranstaltung[] = [];
  private imagenames: string[] = [];
  private imagesWithVeranstaltungen: ImageOverviewRow[] = [];
  private imagesWithVeranstaltungenUnused: ImageOverviewRow[] = [];
  private imagesWithVeranstaltungenNotFound: ImageOverviewRow[] = [];

  async mounted() {
    document.title = "Bilder bearbeiten";
    this.imagenames = await imagenames();
    this.initObjects();
  }

  private async initObjects() {
    const veranstaltungen = (await veranstaltungenForTeam("alle")) || [];
    const elementsWithImage = (imageName: string): ImageOverviewVeranstaltung[] => {
      return this.veranstaltungen.filter((each) => each.images.find((i) => i.localeCompare(imageName) === 0));
    };

    function convertString(a: string): string {
      return a.replace(/\s/g, "_");
    }

    this.veranstaltungen = veranstaltungen.map((v) => v.suitableForImageOverview);
    const imagenamesOfVeranstaltungen = uniq(flatten(this.veranstaltungen.map((each) => each.images))).sort();
    this.imagesWithVeranstaltungen = intersection(this.imagenames, imagenamesOfVeranstaltungen).map((im) => {
      return { image: im, newname: im, veranstaltungen: elementsWithImage(im) };
    });
    this.imagesWithVeranstaltungenUnused = differenceBy(this.imagenames, imagenamesOfVeranstaltungen, convertString).map((im) => {
      return { image: im, newname: im, veranstaltungen: elementsWithImage(im) };
    });
    this.imagesWithVeranstaltungenNotFound = differenceBy(imagenamesOfVeranstaltungen, this.imagenames, convertString).map((im) => {
      return { image: im, newname: im, veranstaltungen: elementsWithImage(im) };
    });
  }

  get changedRows(): ImageOverviewRow[] {
    return this.imagesWithVeranstaltungen
      .filter((v) => v.newname !== v.image)
      .concat(this.imagesWithVeranstaltungenNotFound.filter((v) => v.newname !== v.image))
      .concat(this.imagesWithVeranstaltungenUnused.filter((v) => v.newname !== v.image));
  }

  get dirty(): boolean {
    return this.changedRows.length > 0;
  }

  async save() {
    const newNames = await saveImagenames(this.changedRows);
    this.imagenames = newNames?.names || [];
    this.initObjects();
  }
}
</script>
