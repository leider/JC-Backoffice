<template lang="pug">
.col-12
  .btn-group.float-right
    delete-button-with-dialog(
      v-if="showAllTabs",
      :id="veranstaltung.id",
      :name="veranstaltung.kopf.titel",
      objecttype="Veranstaltung",
      :callback="loeschen",
      :dirty="isNew || veranstaltung.kopf.confirmed",
      show-text="true"
    )
    b-button.btn-copy(v-if="showAllTabs", :disabled="isNew", @click="copy", title="Kopieren")
      b-icon-files
      .d-none.d.d-sm-inline #{ " " }Kopieren
    b-button.btn.btn-success(:disabled="!dirtyAndValid", @click="save", title="Speichern")
      b-icon-check-square
      .d-none.d.d-sm-inline #{ " " }Speichern
  h2.text-danger(v-if="isNew") Neue oder kopierte Veranstaltung <br>
    small.text-danger Denk daran, alle Felder zu überprüfen und auszufüllen
  h2(v-else, :class="colorClass") {{ veranstaltung.kopf.titelMitPrefix }}<br>
    small(:class="colorClass") am {{ veranstaltung.datumForDisplayShort }}
  b-tabs(v-if="showAllTabs")
    section-tab(v-model="activeSection", section="allgemeines", title="Allgemeines", icon="keyboard", @clicked="tabActivated")
      allgemeines-tab(
        :veranstaltung="veranstaltung",
        :optionen="optionen",
        :orte="orte",
        :minimumStart="minimumStart",
        :isBookingTeam="isBookingTeam",
        :editVariables="editVariables"
      )
    section-tab(v-model="activeSection", section="technik", title="Technik", icon="headphones", @clicked="tabActivated")
      technik-tab(:veranstaltung="veranstaltung", :optionen="optionen")
    section-tab(v-model="activeSection", section="kalkulation", title="Kalkulation", icon="graph-up", @clicked="tabActivated")
      kalkulation-tab(:veranstaltung="veranstaltung", :optionen="optionen")
    section-tab(
      v-if="veranstaltung.artist.brauchtHotel",
      v-model="activeSection",
      section="hotel",
      title="Hotel",
      icon="house-door",
      @clicked="tabActivated"
    )
      hotel-tab(:veranstaltung="veranstaltung", :optionen="optionen", :user="user", :editVariables="editVariables")
    section-tab(v-model="activeSection", section="kasse", title="Abendkasse", icon="cash-stack", @clicked="tabActivated")
      kasse-tab(:veranstaltung="veranstaltung", :user="user")
    section-tab(v-model="activeSection", section="presse", title="Presse", icon="newspaper", @clicked="tabActivated")
      presse-tab(:veranstaltung="veranstaltung", :allImageNames="allImageNames")
  kasse-tab(v-else-if="showKasse", :veranstaltung="veranstaltung", :user="user")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import User from "jc-shared/user/user";
import OptionValues from "jc-shared/optionen/optionValues";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import Orte from "jc-shared/optionen/orte";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import {
  currentUser,
  deleteVeranstaltungWithId,
  imagenames,
  optionen,
  orte,
  saveOptionenQuiet,
  saveVeranstaltung,
  veranstaltungForUrl,
} from "../../commons/loader";
import SectionTab from "./SectionTab.vue";
import AllgemeinesTab from "./AllgemeinesTab.vue";
import PresseTab from "./PresseTab.vue";
import KasseTab from "./KasseTab.vue";
import DeleteButtonWithDialog from "../../widgets/DeleteButtonWithDialog.vue";
import KalkulationTab from "./KalkulationTab.vue";
import TechnikTab from "./TechnikTab.vue";
import HotelTab from "./HotelTab.vue";

export interface EditVariables {
  hotelpreiseAlsDefault: boolean;
  selectedHotel: string;
  selectedAgentur: string;
}

@Component({
  components: { DeleteButtonWithDialog, PresseTab, HotelTab, KasseTab, KalkulationTab, TechnikTab, AllgemeinesTab, SectionTab },
})
export default class VeranstaltungView extends Vue {
  @Prop() url!: string;
  @Prop() tab!: string;

  private originalVeranstaltung = new Veranstaltung();
  private veranstaltung = new Veranstaltung();
  private activeSection = "allgemeines";
  private user = new User({});
  private optionen = new OptionValues();
  private orte = new Orte();
  private dirty = false;
  private minimumStart = new DatumUhrzeit();
  private allImageNames: string[] = [];
  private editVariables: EditVariables = { hotelpreiseAlsDefault: false, selectedAgentur: "[temporär]", selectedHotel: "[temporär]" };

  created(): void {
    currentUser((user: User) => {
      this.user = user;
    });
    optionen((opts: OptionValues) => {
      this.optionen = opts;
    });
    orte((orte: Orte) => {
      this.orte = orte;
    });
    imagenames((names: string[]) => {
      this.allImageNames = names;
    });
  }

  get showAllTabs(): boolean {
    const accessrights = this.user.accessrights;
    return !!accessrights && accessrights.isOrgaTeam;
  }

  get showKasse(): boolean {
    const accessrights = this.user.accessrights;
    return !!accessrights && accessrights.isAbendkasse;
  }

  get isBookingTeam(): boolean {
    const accessrights = this.user.accessrights;
    return !!accessrights && accessrights.isBookingTeam;
  }

  @Watch("originalVeranstaltung")
  copyForBearbeiten(): void {
    this.veranstaltung = new Veranstaltung(this.originalVeranstaltung.toJSON());
    this.minimumStart = this.veranstaltung.minimalStartForEdit;
    this.editVariables.selectedHotel = this.veranstaltung.hotel.name;
    this.editVariables.selectedAgentur = this.veranstaltung.agentur.name;
  }

  @Watch("veranstaltung", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: any): string {
      return JSON.stringify(json).replace(/\\r\\n/g, "\\n");
    }
    this.dirty = normCrLf(this.originalVeranstaltung.toJSON()) !== normCrLf(this.veranstaltung.toJSON());
  }

  @Watch("$url")
  mounted(): void {
    if (this.url === "new") {
      this.activeSection = "allgemeines";
      this.originalVeranstaltung = new Veranstaltung();
      document.title = "Neue Veranstaltung";
    } else {
      this.originalVeranstaltung = new Veranstaltung({ id: "dummy" });
      veranstaltungForUrl(this.url, (v: Veranstaltung) => {
        this.originalVeranstaltung = v;
        this.activeSection = this.tab;
        if (this.tab === "copy") {
          return this.copy();
        }
        document.title = this.originalVeranstaltung.kopf.titel;
      });
    }
  }

  tabActivated(section: string): void {
    if (this.activeSection === section) {
      return;
    }
    this.activeSection = section;
    if (this.veranstaltung.url) {
      const url = encodeURIComponent(this.veranstaltung.url);
      this.$router.replace(`/veranstaltungen/${url}/${section}`);
    }
  }

  save(): void {
    if (this.isNew) {
      this.veranstaltung.initializeIdAndUrl();
    }
    this.optionen.addOrUpdateKontakt("agenturen", this.veranstaltung.agentur, this.editVariables.selectedAgentur);
    if (this.veranstaltung.artist.brauchtHotel) {
      this.optionen.addOrUpdateKontakt("hotels", this.veranstaltung.hotel, this.editVariables.selectedHotel);
      if (this.editVariables.hotelpreiseAlsDefault) {
        this.optionen.updateHotelpreise(this.veranstaltung.hotel, this.veranstaltung.unterkunft.zimmerPreise);
      }
    }
    this.optionen.updateBackline("Jazzclub", this.veranstaltung.technik.backlineJazzclub);
    this.optionen.updateBackline("Rockshop", this.veranstaltung.technik.backlineRockshop);
    this.optionen.updateCollection("artists", this.veranstaltung.artist.name);
    saveOptionenQuiet(this.optionen, (err?: Error, optionen?: any) => {
      if (!err) {
        this.optionen = new OptionValues(optionen);
        saveVeranstaltung(this.veranstaltung, (err?: Error, veranstaltung?: Veranstaltung) => {
          if (!err) {
            this.originalVeranstaltung = new Veranstaltung(veranstaltung);
            if (this.isNew) {
              const url = encodeURIComponent(this.originalVeranstaltung.url || "");
              this.$router.replace(`/veranstaltungen/${url}/${this.activeSection}`);
              document.title = this.originalVeranstaltung.kopf.titel;
            }
          }
        });
      }
    });
  }

  get isNew(): boolean {
    return !this.veranstaltung.id;
  }

  copy(): void {
    const copied = new Veranstaltung(this.originalVeranstaltung.toJSON());
    copied.reset();
    this.originalVeranstaltung = copied;
    this.activeSection = "allgemeines";
    document.title = `Kopie von ${this.originalVeranstaltung.kopf.titel}`;
    this.$router.replace(`/veranstaltungen/new/${this.activeSection}`);
  }

  loeschen(): void {
    if (this.veranstaltung.id) {
      deleteVeranstaltungWithId(this.veranstaltung.id, (err?: Error) => {
        if (!err) {
          this.$router.push("/veranstaltungen/");
        }
      });
    }
  }

  get colorClass(): string {
    return `text-${fieldHelpers.cssColorCode(this.veranstaltung.kopf.eventTyp)}`;
  }

  get dirtyAndValid(): boolean {
    return this.dirty && this.veranstaltung.isValid;
  }
}
</script>
