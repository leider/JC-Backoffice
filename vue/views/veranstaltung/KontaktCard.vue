<template lang="pug">
legend-card(:section="section", :title="title")
  .row
    .col-sm-6
      single-select(label="Auswahl", v-model="auswahlName", :options="auswahlOptions")
      jazz-text(label="Name", v-model="kontakt.name")
    .col-sm-6
      jazz-textarea(label="Adresse", v-model="kontakt.adresse")
  .row
    .col-sm-6
      jazz-text(label="Telefon", v-model="kontakt.telefon")
    .col-sm-6
      jazz-mail(label="E-Mail", v-model="kontakt.email")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Kontakt from "../../../lib/veranstaltungen/object/kontakt";
import LegendCard from "@/widgets/LegendCard.vue";
import SingleSelect from "@/widgets/SingleSelect.vue";
import JazzText from "@/widgets/JazzText.vue";
import JazzTextarea from "@/widgets/JazzTextarea.vue";
import JazzMail from "@/widgets/JazzMail.vue";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
@Component({
  components: { JazzMail, JazzTextarea, JazzText, SingleSelect, LegendCard },
})
export default class KontaktCard extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() section!: string;
  @Prop() title!: string;
  @Prop() options!: Kontakt[];
  @Prop() singular!: string;
  private auswahl = "[temporär]";

  @Watch("veranstaltung")
  veranstaltungChanged(): void {
    this.auswahl = this.kontakt?.name ? this.kontakt.name : this.auswahl;
  }

  get auswahlName(): string {
    return this.auswahl;
  }

  set auswahlName(name: string) {
    this.auswahl = name;
    const kontakt = this.options.find((o) => o.name === name);
    if (kontakt) {
      this.kontakt = kontakt;
    }
    if (!this.kontakt) {
      this.kontakt = new Kontakt();
    }
    this.kontakt.auswahl = name;
  }

  get auswahlOptions(): string[] {
    return ["[temporär]", "[neu]"].concat(this.options.map((o) => o.name));
  }

  get kontakt(): Kontakt | null {
    if (this.singular === "hotel") {
      return this.veranstaltung.hotel;
    }
    if (this.singular === "agentur") {
      return this.veranstaltung.agentur;
    }
    return null;
  }

  set kontakt(kontakt: Kontakt | null) {
    if (kontakt === null) {
      return;
    }
    if (this.singular === "hotel") {
      this.veranstaltung.hotel = kontakt;
    }
    if (this.singular === "agentur") {
      this.veranstaltung.agentur = kontakt;
    }
  }
}
</script>
