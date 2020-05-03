<template lang="pug">
.col-12
  .page-header
    .btn-group.float-right
      button.btn.btn-success(@click="save", title="Speichern"): i.far.fa-save.fa-fw
    h2(:class="`text-${activeSection}`") {{veranstaltung.kopf.titel}}<br>
      small(:class="`text-${activeSection}`") am {{veranstaltung.datumForDisplayShort()}}
    b-tabs
      section-tab(v-model="activeSection", section="allgemeines", title="Allgemeines", icon="fa-keyboard", @clicked="tabActivated")
        p Hallo
      section-tab(v-model="activeSection", section="technik", title="Technik", icon="fa-microphone-alt", @clicked="tabActivated")
        p Holla
      section-tab(v-model="activeSection", section="ausgaben", title="Kalkulation", icon="fa-euro-sign", @clicked="tabActivated")
      section-tab(v-if="veranstaltung.artist.brauchtHotel", v-model="activeSection", section="hotel", title="Hotel", icon="fa-bed", @clicked="tabActivated")
      section-tab(v-model="activeSection", section="kasse", title="Abendkasse", icon="fa-money-bill-alt", @clicked="tabActivated")
      section-tab(v-model="activeSection", section="presse", title="Presse", icon="fa-newspaper", @clicked="tabActivated")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { veranstaltungForUrl } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import SectionTab from "@/views/veranstaltung/SectionTab.vue";

@Component({
  components: { SectionTab },
})
export default class VeranstaltungView extends Vue {
  @Prop() url!: string;

  private originalVeranstaltung = new Veranstaltung();
  private veranstaltung = new Veranstaltung();
  private activeSection = "allgemeines";

  @Watch("originalVeranstaltung")
  copyForBearbeiten(): void {
    this.veranstaltung = new Veranstaltung(this.originalVeranstaltung.toJSON());
  }

  @Watch("$route")
  mounted(): void {
    document.title = "Veranstaltung";
    veranstaltungForUrl(this.url, (v: Veranstaltung) => {
      this.originalVeranstaltung = v;
    });
  }

  titlelinkclass(section: string): string {
    return `${this.activeSection === section ? "color" : "tab"}-${section}`;
  }

  tabActivated(section: string): void {
    this.activeSection = section;
  }

  save(): void {
    console.log("Hallo");
  }
}
</script>
