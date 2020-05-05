<template lang="pug">
.col-12
  .page-header
    .btn-group.float-right
      b-button.btn.btn-success(:disabled="!dirty", @click="save", title="Speichern"): i.far.fa-save.fa-fw
    h2(:class="colorClass") {{veranstaltung.kopf.titel}}<br>
      small(:class="colorClass") am {{veranstaltung.datumForDisplayShort()}}
  b-tabs
    section-tab(v-model="activeSection", section="allgemeines", title="Allgemeines", icon="fa-keyboard", @clicked="tabActivated")
      allgemeines-event(:veranstaltung="veranstaltung", :user="user", :optionen="optionen", :orte="orte", :minimumStart="minimumStart")
    section-tab(v-model="activeSection", section="technik", title="Technik", icon="fa-microphone-alt", @clicked="tabActivated")
      p Holla
    section-tab(v-model="activeSection", section="ausgaben", title="Kalkulation", icon="fa-euro-sign", @clicked="tabActivated")
    section-tab(v-if="veranstaltung.artist.brauchtHotel", v-model="activeSection", section="hotel", title="Hotel", icon="fa-bed", @clicked="tabActivated")
    section-tab(v-model="activeSection", section="kasse", title="Abendkasse", icon="fa-money-bill-alt", @clicked="tabActivated")
    section-tab(v-model="activeSection", section="presse", title="Presse", icon="fa-newspaper", @clicked="tabActivated")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { currentUser, optionen, orte, veranstaltungForUrl } from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import SectionTab from "@/views/veranstaltung/SectionTab.vue";
import AllgemeinesEvent from "@/views/veranstaltung/AllgemeinesEvent.vue";
import User from "../../../lib/users/user";
import Accessrights from "../../../lib/commons/accessrights";
import OptionValues from "../../../lib/optionen/optionValues";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import fieldHelpers from "../../../lib/commons/fieldHelpers";
import Orte from "../../../lib/optionen/orte";

@Component({
  components: { AllgemeinesEvent, SectionTab },
})
export default class VeranstaltungView extends Vue {
  @Prop() url!: string;

  private originalVeranstaltung = new Veranstaltung();
  private veranstaltung = new Veranstaltung();
  private activeSection = "allgemeines";
  private user = new User({});
  private optionen = new OptionValues();
  private orte = new Orte();
  private dirty = false;
  private minimumStart = new DatumUhrzeit();

  created(): void {
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });
    optionen((opts: OptionValues) => {
      this.optionen = opts;
    });
    orte((orte: Orte) => {
      this.orte = orte;
    });
  }

  @Watch("originalVeranstaltung")
  copyForBearbeiten(): void {
    this.veranstaltung = new Veranstaltung(this.originalVeranstaltung.toJSON());
    this.minimumStart = this.veranstaltung.minimalStartForEdit();
  }

  @Watch("veranstaltung", { deep: true })
  somethingChanged(): void {
    this.dirty = JSON.stringify(this.originalVeranstaltung.toJSON()) !== JSON.stringify(this.veranstaltung.toJSON());
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

  get colorClass(): string {
    return `text-${fieldHelpers.cssColorCode(this.veranstaltung.kopf.eventTyp)}`;
  }
}
</script>
