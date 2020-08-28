<template lang="pug">
.col-12
  .page-header
    .btn-group.float-right
      b-button.btn.btn-danger(
        v-if="showAllTabs",
        :disabled="isNew || veranstaltung.kopf.confirmed",
        v-b-modal="`dialog-${veranstaltung.id}`"
      )
        i.fas.fa-fw.fa-trash-alt
        .d-none.d-md-inline  #{" "}Löschen
        b-modal(:id="`dialog-${veranstaltung.id}`", no-close-on-backdrop, @ok="loeschen")
          p Bist Du sicher, dass Du {{ veranstaltung.kopf.titel }} löschen willst?
          template(v-slot:modal-header)
            h3.modal-title Veranstaltung löschen
          template(v-slot:modal-footer="{ ok, cancel }")
            .row
              .col-12
                .btn-group.float-right
                  b-button.btn.btn-light(@click="cancel()") Abbrechen
                  b-button.btn.btn-danger.text(@click="ok()")
                    i.fas.fa-trash.fa-fw.fa-lg
                    | &nbsp;Löschen
      b-button.btn-copy(v-if="showAllTabs", :disabled="isNew", @click="copy", title="Kopieren")
        i.fas.fa-fw.fa-copy
        .d-none.d-md-inline #{" "}Kopieren
      b-button.btn.btn-success(:disabled="!dirtyAndValid", @click="save", title="Speichern")
        i.far.fa-save.fa-fw
        .d-none.d-md-inline #{" "}Speichern
    h2.text-danger(v-if="isNew") Neue oder kopierte Veranstaltung <br>
      small.text-danger Denk daran, alle Felder zu überprüfen und auszufüllen
    h2(v-else, :class="colorClass") {{ veranstaltung.kopf.titel }}<br>
      small(:class="colorClass") am {{ veranstaltung.datumForDisplayShort() }}
  b-tabs(v-if="showAllTabs")
    section-tab(v-model="activeSection", section="allgemeines", title="Allgemeines", icon="fa-keyboard", @clicked="tabActivated")
      allgemeines-tab(
        :veranstaltung="veranstaltung",
        :optionen="optionen",
        :orte="orte",
        :minimumStart="minimumStart",
        :isBookingTeam="isBookingTeam",
        :editVariables="editVariables"
      )
    section-tab(v-model="activeSection", section="technik", title="Technik", icon="fa-microphone-alt", @clicked="tabActivated")
      technik-tab(:veranstaltung="veranstaltung", :optionen="optionen")
    section-tab(v-model="activeSection", section="kalkulation", title="Kalkulation", icon="fa-euro-sign", @clicked="tabActivated")
      kalkulation-tab(:veranstaltung="veranstaltung", :optionen="optionen")
    section-tab(
      v-if="veranstaltung.artist.brauchtHotel",
      v-model="activeSection",
      section="hotel",
      title="Hotel",
      icon="fa-bed",
      @clicked="tabActivated"
    )
      hotel-tab(:veranstaltung="veranstaltung", :optionen="optionen", :user="user", :editVariables="editVariables")
    section-tab(v-model="activeSection", section="kasse", title="Abendkasse", icon="fa-money-bill-alt", @clicked="tabActivated")
      kasse-tab(:veranstaltung="veranstaltung", :user="user")
    section-tab(v-model="activeSection", section="presse", title="Presse", icon="fa-newspaper", @clicked="tabActivated")
      presse-tab(:veranstaltung="veranstaltung", :allImageNames="allImageNames")
  kasse-tab(v-else-if="showKasse", :veranstaltung="veranstaltung", :user="user")
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  currentUser,
  optionen,
  orte,
  veranstaltungForUrl,
  imagenames,
  saveVeranstaltung,
  deleteVeranstaltungWithId,
  saveOptionen,
} from "@/commons/loader";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import SectionTab from "@/views/veranstaltung/SectionTab.vue";
import User from "../../../lib/users/user";
import Accessrights from "../../../lib/commons/accessrights";
import OptionValues from "../../../lib/optionen/optionValues";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import fieldHelpers from "../../../lib/commons/fieldHelpers";
import Orte from "../../../lib/optionen/orte";
import AllgemeinesTab from "@/views/veranstaltung/AllgemeinesTab.vue";
import TechnikTab from "@/views/veranstaltung/TechnikTab.vue";
import KalkulationTab from "@/views/veranstaltung/KalkulationTab.vue";
import KasseTab from "@/views/veranstaltung/KasseTab.vue";
import HotelTab from "@/views/veranstaltung/HotelTab.vue";
import PresseTab from "@/views/veranstaltung/PresseTab.vue";

export interface EditVariables {
  hotelpreiseAlsDefault: boolean;
  selectedHotel: string;
  selectedAgentur: string;
}

@Component({
  components: { PresseTab, HotelTab, KasseTab, KalkulationTab, TechnikTab, AllgemeinesTab, SectionTab },
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
      user.accessrights = new Accessrights(user);
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
    this.minimumStart = this.veranstaltung.minimalStartForEdit();
    this.editVariables.selectedHotel = this.veranstaltung.hotel.name;
    this.editVariables.selectedAgentur = this.veranstaltung.agentur.name;
  }

  @Watch("veranstaltung", { deep: true })
  somethingChanged(): void {
    function normCrLf(json: object): string {
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
      this.activeSection = this.tab;
      veranstaltungForUrl(this.url, (v: Veranstaltung) => {
        this.originalVeranstaltung = v;
        if (this.tab === "copy") {
          return this.copy();
        }
        document.title = this.originalVeranstaltung.kopf.titel;
      });
    }
  }

  tabActivated(section: string): void {
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
    saveOptionen(this.optionen, (err: Error, json: any) => {
      if (err) {
        console.log(err);
      }
      this.optionen = new OptionValues(json);
      saveVeranstaltung(this.veranstaltung, (err: Error, json: any) => {
        if (err) {
          console.log(err);
        }
        this.originalVeranstaltung = new Veranstaltung(json);
        if (this.isNew) {
          const url = encodeURIComponent(this.originalVeranstaltung.url || "");
          this.$router.replace(`/veranstaltungen/${url}/${this.activeSection}`);
          document.title = this.originalVeranstaltung.kopf.titel;
        }
      });
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
      deleteVeranstaltungWithId(this.veranstaltung.id, (err: Error) => {
        if (err) {
          return console.log(err);
        }
        this.$router.push("/veranstaltungen/");
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
