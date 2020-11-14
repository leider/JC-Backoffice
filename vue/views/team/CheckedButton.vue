<template lang="pug">
.text-capitalize(:class="section.checked ? 'alert-success' : 'alert-danger'"): b-link.inherit-color(
  :to="`${veranstaltung.fullyQualifiedUrl()}/${name}`"
)
  b-icon-check2-circle(v-if="section.checked", scale=1.1)
  b-icon-exclamation-circle-fill(v-else)
  | #{" "} {{ name }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../../backend/lib/veranstaltungen/object/veranstaltung";
import Unterkunft from "../../../backend/lib/veranstaltungen/object/unterkunft";
import Technik from "../../../backend/lib/veranstaltungen/object/technik";
import Presse from "../../../backend/lib/veranstaltungen/object/presse";

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
