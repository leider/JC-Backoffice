<template lang="pug">
.row
  .col-md-6
    kontakt-card(
      section="hotel",
      title="Hotel",
      singular="hotel",
      :options="optionen.hotels",
      :veranstaltung="veranstaltung",
      :editVariables="editVariables"
    )

    legend-card(section="hotel", title="Zimmer", hasMoney="true", :money="unterkunft.roomsTotalEUR")
      .row
        .col-4
          jazz-date(
            label="Anreise",
            v-model="unterkunft.anreiseDate",
            :min="minDate",
            tooltip="Diese Werte haben Einfluß auf den berechneten Preis"
          )
          jazz-date(label="Abreise", v-model="unterkunft.abreiseDate", :min="minDateAbreise")
          label.float-right {{ unterkunft.anzNacht }}
        .col-8
          jazz-textarea(label="Kommentar", v-model="unterkunft.kommentar", tooltip="Namen der Gäste")
      .row
        .col-sm-4
          .row
            .col-4
              jazz-number(label="Einzel", v-model="unterkunft.einzelNum")
            .col-8
              jazz-currency(label="Preis", v-model="unterkunft.einzelEUR")
        .col-sm-4
          .row
            .col-4
              jazz-number(label="Doppel", v-model="unterkunft.doppelNum")
            .col-8
              jazz-currency(label="Preis", v-model="unterkunft.doppelEUR")
        .col-sm-4
          .row
            .col-4
              jazz-number(label="Suite", v-model="unterkunft.suiteNum")
            .col-8
              jazz-currency(label="Preis", v-model="unterkunft.suiteEUR")
      .row
        .col-12
          jazz-check(label="Preise als Default übernehmen", v-model="editVariables.hotelpreiseAlsDefault", inline="true")
  .col-md-6
    legend-card(section="hotel", title="Transport", has-money="true", :money="unterkunft.transportEUR")
      .row
        .col-12
          jazz-textarea(label="Anmerkungen", v-model="unterkunft.transportText", tooltip="Wer, wann, wo abholen, hinbringen?")
      .row
        .col-6
          label Bus / Sonstiges:
          multi-select(v-model="unterkunft.sonstiges", :options="['Parkgenehmigung', 'Stromanschluss']")
        .col-6
          jazz-currency(label="Summe", v-model="unterkunft.transportEUR")
    .row
      .col-6
        jazz-check(label="Hotel Angefragt", v-model="unterkunft.angefragt", inline="true")
      .col-6
        jazz-check(label="Hotel Bestätigt", v-model="unterkunft.bestaetigt", inline="true")
    .row.mt-3
      .col-12
        b-button.btn.btn-success(@click="sendMail")
          b-icon-envelope-open(scale="0.8")
          | #{" "} Reservierungsmail
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import OptionValues, { Hotelpreise } from "../../../../shared/optionen/optionValues";
import User from "../../../../shared/user/user";
import Veranstaltung from "../../../../shared/veranstaltung/veranstaltung";
import MultiSelect from "../../widgets/MultiSelect.vue";
import Unterkunft from "../../../../shared/veranstaltung/unterkunft";
import Kosten from "../../../../shared/veranstaltung/kosten";
import JazzText from "../../widgets/JazzText.vue";
import LabelCurrencyRow from "./LabelCurrencyRow.vue";
import JazzCurrency from "../../widgets/JazzCurrency.vue";
import KontaktCard from "./KontaktCard.vue";
import JazzNumber from "../../widgets/JazzNumber.vue";
import LegendCard from "../../widgets/LegendCard.vue";
import SingleSelect from "../../widgets/SingleSelect.vue";
import PreisSelect from "./PreisSelect.vue";
import JazzCurrencyDisplay from "../../widgets/JazzCurrencyDisplay.vue";
import JazzCheck from "../../widgets/JazzCheck.vue";
import { EditVariables } from "./VeranstaltungView.vue";
import JazzTextarea from "../../widgets/JazzTextarea.vue";
import JazzDate from "../../widgets/JazzDate.vue";

@Component({
  components: {
    JazzTextarea,
    JazzDate,
    KontaktCard,
    JazzCurrencyDisplay,
    LabelCurrencyRow,
    SingleSelect,
    JazzNumber,
    PreisSelect,
    JazzText,
    MultiSelect,
    JazzCurrency,
    JazzCheck,
    LegendCard,
  },
})
export default class HotelTab extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() optionen!: OptionValues;
  @Prop() user!: User;
  @Prop() editVariables!: EditVariables;

  get minDate(): Date | null {
    return this.veranstaltung.startDatumUhrzeit.minus({ tage: 7 }).toJSDate;
  }

  get minDateAbreise(): Date {
    return this.unterkunft.anreiseDate;
  }

  get unterkunft(): Unterkunft {
    return this.veranstaltung.unterkunft;
  }

  get kosten(): Kosten {
    return this.veranstaltung.kosten;
  }

  @Watch("editVariables.selectedHotel")
  selectedHotelChanged(): void {
    const selectedPreise = this.optionen.hotelpreise.find((p: Hotelpreise) => p.name === this.editVariables.selectedHotel) || {
      einzelEUR: 0,
      doppelEUR: 0,
      suiteEUR: 0,
    };
    this.unterkunft.einzelEUR = selectedPreise.einzelEUR;
    this.unterkunft.doppelEUR = selectedPreise.doppelEUR;
    this.unterkunft.suiteEUR = selectedPreise.suiteEUR;
  }

  sendMail(): void {
    const email = encodeURIComponent(`${this.veranstaltung.hotel.name}<${this.veranstaltung.hotel.email}>`);
    const subject = encodeURIComponent(`Jazzclub Reservierungsanfrage für ${this.unterkunft.anreiseDisplayDate}`);
    const einzel = this.unterkunft.einzelNum;
    const einzelText = einzel > 0 ? `${einzel} Einzelzimmer, ` : "";
    const doppel = this.unterkunft.doppelNum;
    const doppelText = doppel > 0 ? `${doppel} Doppelzimmer, ` : "";
    const suite = this.unterkunft.suiteNum;
    const suiteText = suite > 0 ? `${suite} Suite(n), ` : "";

    const text = encodeURIComponent(`Sehr geehrte Damen und Herren,

bitte reservieren Sie für den Jazzclub Karlsruhe e.V.:
${einzelText}${doppelText}${suiteText} für ${this.unterkunft.anzNacht}.
Anreise: ${this.unterkunft.anreiseDisplayDate}, Abreise: ${this.unterkunft.abreiseDisplayDate}

Die Namen der Gäste lauten:
${this.unterkunft.kommentar}

Mit freundlichen Grüßen,
${this.user.name}`);

    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + text;
  }
}
</script>
