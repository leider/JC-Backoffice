<template lang="pug">
  .text-capitalize(:class="section.checked ? 'alert-success' : 'alert-danger'"): a.inherit-color(:href="`${veranstaltung.fullyQualifiedUrl()}/${name}`")
    i.fas.fa-fw(:class="section.checked ? 'fa-check' : 'fa-exclamation-circle'")
    | {{name}}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import Unterkunft from "../../../lib/veranstaltungen/object/unterkunft";
import Technik from "../../../lib/veranstaltungen/object/technik";
import Presse from "../../../lib/veranstaltungen/object/presse";

@Component
export default class StaffRow extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() name!: string;

  get section(): Unterkunft | Technik | Presse {
    switch (this.name) {
      case "hotel":
        return this.veranstaltung.unterkunft;
      case "technik":
        return this.veranstaltung.technik;
      default:
        return this.veranstaltung.presse;
    }
  }
}
</script>
