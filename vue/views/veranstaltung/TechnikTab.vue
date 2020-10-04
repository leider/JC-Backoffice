<template lang="pug">
.row
  .col-12
    legend-card(section="technik", title="Rider und Backline", hasMoney="true", :money="kosten.backlineUndTechnikEUR()")
      .row.mb-3
        .col-12.col-md-3
          jazz-check(v-model="technik.checked", label="Technik ist geklärt")
        .col-12.col-md-3
          jazz-check(v-model="technik.fluegel", label="Flügel stimmen")
      .row
        .col-xl-6
          .form-group
            label Rider:
            .input-group
              b-form-file(v-model="filesForUpload", multiple, placeholder="Dateien auswählen", browse-text="Auswählen")
              .input-group-append
                b-button(@click="saveFiles", variant="primary", :disabled="filesForUpload.length === 0") Hochladen
            .row.mt-3
              .col-6(v-for="datei in technik.dateirider", :key="datei")
                .form-inline
                  a(:href="`/files/${datei}`", v-b-tooltip.hover, title="Klick zum Anzeigen") {{ datei }}
                  a.ml-1(@click="technik.removeDateirider(datei)", v-b-tooltip.hover, title="Aus Dateien enfernen")
                    i.fas.fa-fw.fa-times.fa-sm
        .col-xl-6
          .row
            .col-sm-9
              .form-group
                jazz-label(label="Backline Jazzclub")
                multi-select(v-model="technik.backlineJazzclub", :allowNewTags="true", :options="optionen.backlineJazzclub")
            .col-sm-9
              .form-group
                jazz-label(label="Backline Rockshop")
                multi-select(v-model="technik.backlineRockshop", :allowNewTags="true", :options="optionen.backlineRockshop")
            .col-sm-3
              jazz-currency(label="Betrag", v-model="kosten.backlineEUR")
            .col-sm-9
              jazz-text(label="Technik Zumietung", v-model="technik.technikAngebot1")
            .col-sm-3
              jazz-currency(label="Betrag", v-model="kosten.technikAngebot1EUR")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import LegendCard from "@/widgets/LegendCard.vue";
import OptionValues from "../../../lib/optionen/optionValues";
import JazzCheck from "@/widgets/JazzCheck.vue";
import JazzCurrency from "@/widgets/JazzCurrency.vue";
import MultiSelect from "@/widgets/MultiSelect.vue";
import { uploadFile } from "@/commons/loader";
import Technik from "../../../lib/veranstaltungen/object/technik";
import JazzLabel from "@/widgets/JazzLabel.vue";
import Kosten from "../../../lib/veranstaltungen/object/kosten";
import JazzText from "@/widgets/JazzText.vue";

@Component({
  components: {
    JazzText,
    JazzLabel,
    MultiSelect,
    JazzCurrency,
    JazzCheck,
    LegendCard,
  },
})
export default class TechnikTab extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() optionen!: OptionValues;

  private filesForUpload: File[] = [];

  get technik(): Technik {
    return this.veranstaltung.technik;
  }

  get kosten(): Kosten {
    return this.veranstaltung.kosten;
  }

  saveFiles(): void {
    const formData = new FormData();
    formData.append("id", this.veranstaltung.id || "");
    formData.append("typ", "rider");
    this.filesForUpload.forEach((file) => {
      formData.append("datei", file, file.name);
    });
    uploadFile(formData, (json: { error?: string; veranstaltung?: any }) => {
      if (!json.error) {
        this.filesForUpload = [];
        const strings = this.technik.dateirider;
        strings.splice(0, strings.length);
        const newStrings = new Veranstaltung(json.veranstaltung).technik.dateirider;
        newStrings.forEach((s) => strings.push(s));
      }
    });
  }
}
</script>
<style lang="scss" scoped>
.multiselect {
  width: calc(100% - 99px) !important;
}
.multiselect__tags {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
</style>
