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
import JazzMail from "../../widgets/JazzMail.vue";
import Veranstaltung from "../../../../shared/veranstaltung/veranstaltung";
import SingleSelect from "../../widgets/SingleSelect.vue";
import Kontakt from "../../../../shared/veranstaltung/kontakt";
import JazzText from "../../widgets/JazzText.vue";
import { EditVariables } from "./VeranstaltungView.vue";
import JazzTextarea from "../../widgets/JazzTextarea.vue";
import LegendCard from "../../widgets/LegendCard.vue";

@Component({
  components: { JazzMail, JazzTextarea, JazzText, SingleSelect, LegendCard },
})
export default class KontaktCard extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() section!: string;
  @Prop() title!: string;
  @Prop() options!: Kontakt[];
  @Prop() singular!: string;
  @Prop() editVariables!: EditVariables;
  private auswahl = "[temporär]";

  @Watch("veranstaltung")
  @Watch("singular")
  @Watch("section")
  veranstaltungChanged(): void {
    const name = this.kontakt?.name;
    if (name && this.isHotel) {
      this.editVariables.selectedHotel = name;
    }
    if (name && this.isAgentur) {
      this.editVariables.selectedAgentur = name;
    }
  }

  get auswahlName(): string {
    return this.isAgentur ? this.editVariables.selectedAgentur : this.editVariables.selectedHotel;
  }

  set auswahlName(name: string) {
    const kontakt = this.options.find((o) => o.name === name);
    if (kontakt) {
      this.kontakt = new Kontakt(kontakt);
    }
    if (!this.kontakt || name === "[neu]") {
      this.kontakt = new Kontakt();
    }
    if (this.isHotel) {
      this.editVariables.selectedHotel = name;
    }
    if (this.isAgentur) {
      this.editVariables.selectedAgentur = name;
    }
  }

  get auswahlOptions(): string[] {
    const names = this.options.map((o) => o.name).sort();
    return ["[temporär]", "[neu]"].concat(names);
  }

  get kontakt(): Kontakt | null {
    if (this.isHotel) {
      return this.veranstaltung.hotel;
    }
    if (this.isAgentur) {
      return this.veranstaltung.agentur;
    }
    return null;
  }

  set kontakt(kontakt: Kontakt | null) {
    if (kontakt === null) {
      return;
    }
    if (this.isHotel) {
      this.veranstaltung.hotel = kontakt;
    }
    if (this.isAgentur) {
      this.veranstaltung.agentur = kontakt;
    }
  }

  get isAgentur(): boolean {
    return this.singular === "agentur";
  }

  get isHotel(): boolean {
    return this.singular === "hotel";
  }
}
</script>
