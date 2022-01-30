<template lang="pug">
.row
  .col-md-6
    legend-card(section="allgemeines", title="Event")
      .row
        .col-4.col-xl-6
        .col-4.col-xl-3
          jazz-text(label="Reservix-ID", tooltip="Falls bei Reservix", v-model="veranstaltung.reservixID")
        .col-4.col-xl-3
          .form-group
            label &nbsp;
            b-button.form-control.d-block(v-if="!kopf.abgesagt", variant="warning", @click="absagen()") Absagen
            b-button.form-control.d-block(v-else, variant="warning", @click="absagenAufheben") Absage Rückgängig
      .row
        .col-4.col-xl-3
          jazz-check(v-if="isBookingTeam", v-model="kopf.confirmed", label="Ist bestätigt", inline="true")
        .col-4.col-xl-3
          jazz-check(v-model="veranstaltung.artist.brauchtHotel", label="Braucht Hotel", inline="true")
        .col-4.col-xl-3
          jazz-check(v-model="veranstaltung.kopf.fotografBestellen", label="Fotograf Einladen", inline="true")
      .row
        hr
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
          single-select(label="Deal", v-model="kosten.deal", :options="deals")
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
    kontakt-card(
      section="allgemeines",
      title="Agentur / Verantwortlicher",
      singular="agentur",
      :options="optionen.agenturen",
      :veranstaltung="veranstaltung",
      :editVariables="editVariables"
    )
    legend-card(section="allgemeines", title="Vertrag")
      .row
        .col-md-5
          single-select(label="Art", v-model="vertrag.art", :options="vertragArten")
        .col-md-7
          .form-group
            label Variante:
            .input-group
              single-select-pure(label="Sprache", v-model="vertrag.sprache", :options="vertragSprachen")
              .input-group-append
                b-button(@click="generateVertrag", :disabled="!veranstaltung.id || !isBookingTeam", variant="primary") Generieren
      .row
        .col-12
          .form-group
            label Dateien:
            .input-group
              b-form-file(v-model="filesForUpload", multiple, placeholder="Dateien auswählen", browse-text="Auswählen")
              .input-group-append
                b-button(@click="saveFiles", variant="primary", :disabled="filesForUpload.length === 0") Hochladen
            .row.mt-3
              .col-6(v-for="datei in vertrag.datei", :key="datei")
                .form-inline
                  a(:href="`/files/${datei}`", v-b-tooltip.hover, title="Klick zum Anzeigen") {{ datei }}
                  a.ml-1(@click="vertrag.removeDatei(datei)", v-b-tooltip.hover, title="Aus Dateien enfernen")
                    b-icon-file-earmark-x(font-scale="1.2")
    legend-card(section="allgemeines", title="Bearbeiter")
      .row(v-for="item in veranstaltung.changelist")
        .col
          details.mx-2
            summary {{ item.zeitpunkt }} {{ item.bearbeiter }}
            pre {{ item.diff }}
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import OptionValues from "jc-shared/optionen/optionValues";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Orte from "jc-shared/optionen/orte";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Artist from "jc-shared/veranstaltung/artist";
import MultiSelect from "../../widgets/MultiSelect.vue";
import { openPayload, uploadFile } from "../../commons/loader";
import EventTypSelect from "../../widgets/EventTypSelect.vue";
import JazzLabel from "../../widgets/JazzLabel.vue";
import Kosten from "jc-shared/veranstaltung/kosten";
import JazzInterval from "./JazzInterval.vue";
import JazzText from "../../widgets/JazzText.vue";
import Vertrag, { Sprache, Vertragsart } from "jc-shared/veranstaltung/vertrag";
import SingleSelectPure from "../../widgets/SingleSelectPure.vue";
import JazzCurrency from "../../widgets/JazzCurrency.vue";
import KontaktCard from "./KontaktCard.vue";
import JazzNumber from "../../widgets/JazzNumber.vue";
import LegendCard from "../../widgets/LegendCard.vue";
import PreisSelect from "./PreisSelect.vue";
import KoopSelect from "./KoopSelect.vue";
import SingleSelect from "../../widgets/SingleSelect.vue";
import JazzCheck from "../../widgets/JazzCheck.vue";
import Kopf from "jc-shared/veranstaltung/kopf";
import { EditVariables } from "./VeranstaltungView.vue";
import Markdown from "../../widgets/Markdown.vue";

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
export default class AllgemeinesTab extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() optionen!: OptionValues;
  @Prop() orte!: Orte;
  @Prop() minimumStart!: DatumUhrzeit;
  @Prop() isBookingTeam!: boolean;
  @Prop() editVariables!: EditVariables;

  private filesForUpload: File[] = [];

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

  get eventTypen(): string[] {
    return this.optionen.typen;
  }

  get deals(): string[] {
    return Kosten.deals;
  }

  get bearbeiter(): string {
    return (
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n" +
      "01.01.2020 12:23 Andreas\n"
    );
  }

  get changelist(): { title: string; details: string }[] {
    return [
      {
        title: "01.01.2020 12:23 Andreas",
        details: JSON.stringify(
          {
            hinzu: {},
            gelöscht: { id: undefined },
            geändert: { unterkunft: { angefragt: true } },
          },
          null,
          2
        ),
      },
    ];
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

  absagen(): void {
    this.kopf.abgesagt = true;
  }

  absagenAufheben(): void {
    this.kopf.abgesagt = false;
  }

  saveFiles(): void {
    const formData = new FormData();
    formData.append("id", this.veranstaltung.id || "");
    formData.append("typ", "vertrag");
    this.filesForUpload.forEach((file) => {
      formData.append("datei", file, file.name);
    });
    uploadFile(formData, (err?: Error, veranstaltung?: any) => {
      if (!err) {
        this.filesForUpload = [];
        const strings = this.vertrag.datei;
        strings.splice(0, strings.length);
        const newStrings = new Veranstaltung(veranstaltung).vertrag.datei;
        newStrings.forEach((s) => strings.push(s));
      }
    });
  }

  generateVertrag(): void {
    openPayload({ url: "vertrag", params: { url: this.veranstaltung.url, language: this.vertrag.sprache.toLowerCase() } });
  }
}
</script>
<style lang="scss" scoped>
.multiselect {
  width: calc(100% - 99px) !important;
}
</style>
