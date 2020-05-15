<template lang="pug">
.row
  .col-md-6
    legend-card(section="allgemeines", title="Event")
      .row
        .col-4.col-xl-3
          jazz-check(v-if="isBookingTeam", v-model="kopf.confirmed", label="Ist bestätigt")
        .col-4.col-xl-3
          jazz-check(v-model="veranstaltung.artist.brauchtHotel", label="Braucht Hotel")
        .col-4.col-xl-3
          jazz-text(label="Reservix-ID", tooltip="Falls bei Reservix", v-model="veranstaltung.reservixID")
      .row
        .col-sm-6
          jazz-text(label="Titel", tooltip="Titel für die Veranstaltung", required="true", v-model="kopf.titel")
        .col-sm-6
          event-typ-select(label="Typ", required="true", v-model="kopf.eventTyp", :options="eventTypen")
      jazz-interval(:veranstaltung="veranstaltung", :minimumStart="minimumStart")
      .row
        .col-4
          single-select(label="Ort", v-model="kopf.ort", :options="orte.alleNamen()")
        .col-4
          jazz-number(label="Fläche", v-model="kopf.flaeche", min="0", max="1000")
        .col-4
          jazz-currency(label="Saalmiete", v-model="kosten.saalmiete")
      .row
        .col-4
          koop-select(:kopf="kopf", :options="optionen.kooperationen")
        .col-4
          preis-select(v-model="veranstaltung.eintrittspreise.preisprofil", :options="optionen.preisprofile()")
        .col-4
          single-select(label="Genre", v-model="kopf.genre", :options="optionen.genres")
    legend-card(section="allgemeines", title="Künstler")
      .row
        .col-6
          jazz-text(label="Bandname", tooltip="Wird für den Vertrag benötigt", v-model="artist.bandname")
        .col-3
          jazz-number(label="Musiker", min="1", max="30", v-model="artist.numMusiker")
        .col-3
          jazz-number(label="Crew", min="0", max="30", v-model="artist.numCrew")
      .row
        .col-sm-6
          .form-group
            jazz-label(label="Namen")
            multi-select(v-model="artist.name", :allowNewTags="true", :options="optionen.artists")
        .col-6.col-sm-3
          jazz-currency(label="Gage (Netto)", v-model="kosten.gagenEUR")
        .col-6.col-sm-3
          single-select(label="Deal", v-model="kosten.deal", :options="kosten.deals()")
      .row
        .col-6.col-sm-4
          jazz-check(v-model="artist.isBawue", label="BaWü-Förderung", :inline="true")
        .col-6.col-sm-4
          jazz-check(v-model="artist.isAusland", label="aus dem Ausland", :inline="true")
    legend-card(section="allgemeines", title="Kommentar")
      .row
        .col-sm-12
          .form-group
            jazz-label(label="Zusätzliche Infos", tooltip="Notizen / Gäste / Reservierung, etc.")
            markdown(v-model="kopf.beschreibung")
  .col-md-6
    kontakt-card(section="allgemeines", title="Agentur / Verantwortlicher", :kontakt="veranstaltung.agentur",
      :options="optionen.agenturen")
    legend-card(section="allgemeines", title="Vertrag")
      .row
        .col-md-6
          single-select(label="Art", v-model="vertrag.art", :options="vertragArten")
        .col-md-6
          single-select(label="Sprache", v-model="vertrag.sprache", :options="vertragSprachen")
      .row(v-if="isBookingTeam")
        .col-12
          a.btn.btn-primary.float-right(:href="`${veranstaltung.fullyQualifiedUrlForVertrag()}/${vertrag.sprache}`") Vertrag generieren
      .row
        .col-12
          b-form-file
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import User from "../../../lib/users/user";
import Kopf from "../../../lib/veranstaltungen/object/kopf";
import LegendCard from "@/widgets/LegendCard.vue";
import JazzText from "@/widgets/JazzText.vue";
import EventTypSelect from "@/widgets/EventTypSelect.vue";
import OptionValues from "../../../lib/optionen/optionValues";
import JazzCheck from "@/widgets/JazzCheck.vue";
import JazzLabel from "@/widgets/JazzLabel.vue";
import DatumUhrzeit from "../../../lib/commons/DatumUhrzeit";
import JazzInterval from "@/widgets/JazzInterval.vue";
import Orte from "../../../lib/optionen/orte";
import SingleSelect from "@/widgets/SingleSelect.vue";
import JazzNumber from "@/widgets/JazzNumber.vue";
import JazzCurrency from "@/widgets/JazzCurrency.vue";
import SingleSelectPure from "@/widgets/SingleSelectPure.vue";
import KoopSelect from "@/views/veranstaltung/KoopSelect.vue";
import PreisSelect from "@/views/veranstaltung/PreisSelect.vue";
import Artist from "../../../lib/veranstaltungen/object/artist";
import MultiSelect from "@/widgets/MultiSelect.vue";
import Kosten from "../../../lib/veranstaltungen/object/kosten";
import Markdown from "@/widgets/Markdown.vue";
import KontaktCard from "@/views/veranstaltung/KontaktCard.vue";
import Vertrag, { Sprache, Vertragsart } from "../../../lib/veranstaltungen/object/vertrag";
@Component({
  components: {
    KontaktCard,
    Markdown,
    MultiSelect,
    PreisSelect,
    KoopSelect,
    SingleSelectPure,
    JazzCurrency,
    JazzNumber,
    SingleSelect,
    JazzInterval,
    JazzLabel,
    JazzCheck,
    EventTypSelect,
    JazzText,
    LegendCard,
  },
})
export default class AllgemeinesEvent extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() user!: User;
  @Prop() optionen!: OptionValues;
  @Prop() orte!: Orte;
  @Prop() minimumStart!: DatumUhrzeit;

  get artist(): Artist {
    return this.veranstaltung.artist;
  }

  get kopf(): Kopf {
    return this.veranstaltung.kopf;
  }

  get kosten(): Kosten {
    return this.veranstaltung.kosten;
  }

  get vertrag(): Vertrag {
    return this.veranstaltung.vertrag;
  }

  get vertragArten(): Vertragsart[] {
    return Vertrag.arten();
  }

  get vertragSprachen(): Sprache[] {
    return Vertrag.sprachen();
  }

  get isBookingTeam(): boolean {
    return this.user?.accessrights?.isBookingTeam;
  }

  get eventTypen(): string[] {
    return this.optionen.typen;
  }

  @Watch("kopf.ort")
  ortChanged(ort: string): void {
    const derOrt = this.orte.orte.find((o) => o.name === ort);
    if (derOrt) {
      this.kopf.pressename = derOrt.pressename || ort;
      this.kopf.presseIn = derOrt.presseIn || this.kopf.pressename;
      this.kopf.flaeche = derOrt.flaeche;
    }
  }
}
</script>
