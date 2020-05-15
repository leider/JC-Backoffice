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
import { Component, Prop, Vue } from "vue-property-decorator";
import Kontakt from "../../../lib/veranstaltungen/object/kontakt";
import LegendCard from "@/widgets/LegendCard.vue";
import SingleSelect from "@/widgets/SingleSelect.vue";
import JazzText from "@/widgets/JazzText.vue";
import JazzTextarea from "@/widgets/JazzTextarea.vue";
import JazzMail from "@/widgets/JazzMail.vue";
@Component({
  components: { JazzMail, JazzTextarea, JazzText, SingleSelect, LegendCard },
})
export default class KontaktCard extends Vue {
  @Prop() section!: string;
  @Prop() title!: string;
  @Prop() kontakt!: Kontakt;
  @Prop() options!: Kontakt[];
  private auswahl = "[temporär]]";

  get auswahlName(): string {
    return this.auswahl;
  }

  set auswahlName(name: string) {
    this.auswahl = name;
    const kontakt = this.options.find((o) => o.name === name);
    if (kontakt) {
      this.kontakt = kontakt;
    }
  }

  get auswahlOptions(): string[] {
    return ["[temporär]", "[neu]"].concat(this.options.map((o) => o.name));
  }
}
</script>
