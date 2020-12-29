<template lang="pug">
.row
  .col-md-6
    legend-card(section="kalkulation", title="Einnahmen / Eintritt / Zuschuss", hasMoney="true", :money="einnahmenTotal")
      .row
        .col-3.col-sm-6
          preis-select(v-model="veranstaltung.eintrittspreise.preisprofil", :options="optionen.preisprofile()")
        .col-3.col-sm-2
          .form-group
            jazz-currency-display(label="Reg.", :value="eintrittspreise.regulaer")
        .col-3.col-sm-2
          .form-group
            jazz-currency-display(label="Erm.", :value="eintrittspreise.ermaessigt")
        .col-3.col-sm-2
          .form-group
            jazz-currency-display(label="Mitgl", :value="eintrittspreise.mitglied")
      .row
        .col-4
          jazz-currency(label="Zuschüsse", v-model="eintrittspreise.zuschuss")
        .col-4
          .form-group
            jazz-currency-display(v-if="kasse.istFreigegeben", label="Abendkasse (Tickets)", :value="kasse.einnahmeTicketsEUR")
            jazz-number(v-else, label="Gäste (erw.)", v-model="eintrittspreise.erwarteteBesucher")
        .col-4
          .form-group
            jazz-currency-display(label="Total", :value="erwarteteEinnahmen")
      .row(v-if="veranstaltung.reservixID")
        .col-4
          .form-group
            label.float-right Besucher (Reservix):
            b: span.text-right.form-control-plaintext.float-right {{ salesreport.anzahl }}
        .col-4
          .form-group
            jazz-currency-display(label="Tickets Brutto (Reservix)", :value="salesreport.brutto")
        .col-4
          .form-group
            jazz-currency-display(label="Tickets Netto (Reservix)", :value="salesreport.netto")
    legend-card(section="concert", title="Kostenübersicht / Break-Even", hasMoney="true", :money="kalkulation.dealUeberschussTotal")
      table.table.table-sm.table-striped
        tbody
          tr
            th(style="text-align: right") Einnahmen
            th(style="text-align: right") Kosten
            th(style="text-align: right") Überschuss
          tr
            td(style="text-align: right"): span.text-right {{ format(kalkulation.einnahmenGesamtEUR) }}
            td(style="text-align: right"): span.text-right {{ format(kalkulation.kostenGesamtEUR) }}
            td(style="text-align: right"): b: span.text-right {{ format(kalkulation.bruttoUeberschussEUR) }}
          tr
            th Anteilig an Band:
            td
            td(style="text-align: right"): b: span.text-right {{ format(kalkulation.dealAbsolutEUR) }}
  .col-md-6
    legend-card(section="kalkulation", title="Kosten / Ausgaben", hasMoney="true", :money="ausgabenTotal")
      .row
        .col-3(style="padding-right: 5px")
          jazz-currency(label="Gagen", v-model="kosten.gagenEUR")
        .col-3(style="padding-left: 2px; padding-right: 2px")
          single-select(label="Steuer", v-model="kosten.gagenSteuer", :options="steuerSaetze")
        .col-3(style="padding-left: 2px; padding-right: 2px")
          single-select(label="Deal", v-model="kosten.deal", :options="deals")
        .col-3(style="padding-left: 5px")
          .form-group
            label.control-label Total:
            b: span.text-right.form-control-plaintext.float-right.text-success {{ format(kosten.gagenTotalEUR) }}
      label-currency-row(label="Backline Rockshop", v-model="kosten.backlineEUR")
      label-currency-row(label="Technik Zumietung", v-model="kosten.technikAngebot1EUR")
      label-currency-row(label="Saalmiete", v-model="kosten.saalmiete")
      label-currency-row(label="Werbung 1", v-model="kosten.werbung1")
      label-currency-row(label="Werbung 2", v-model="kosten.werbung2")
      label-currency-row(label="Werbung 3", v-model="kosten.werbung3")
      label-currency-row(label="Personal (unbar)", v-model="kosten.personal")
      .form-group.row(v-if="kasse.istFreigegeben")
        .col-sm-3
        label.col-6.col-form-label Abendkasse (ohne Gage)
        .col-6.col-sm-3
          b: span.text-right.form-control-plaintext.float-right {{ format(kasse.ausgabenOhneGage) }}
      .row
        .col-12
          jazz-check(label="Gage in BAR an der Abendkasse", v-model="kosten.gageBAR", inline="true")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import OptionValues from "../../../../shared/optionen/optionValues";
import Salesreport from "../../../../shared/veranstaltung/salesreport";
import Veranstaltung from "../../../../shared/veranstaltung/veranstaltung";
import Eintrittspreise from "../../../../shared/veranstaltung/eintrittspreise";
import MultiSelect from "../../widgets/MultiSelect.vue";
import Kasse from "../../../../shared/veranstaltung/kasse";
import Kosten from "../../../../shared/veranstaltung/kosten";
import JazzText from "../../widgets/JazzText.vue";
import { formatToGermanNumberString } from "../../commons/utilityFunctions";
import LabelCurrencyRow from "./LabelCurrencyRow.vue";
import JazzCurrency from "../../widgets/JazzCurrency.vue";
import JazzNumber from "../../widgets/JazzNumber.vue";
import LegendCard from "../../widgets/LegendCard.vue";
import SingleSelect from "../../widgets/SingleSelect.vue";
import PreisSelect from "./PreisSelect.vue";
import JazzCurrencyDisplay from "../../widgets/JazzCurrencyDisplay.vue";
import JazzCheck from "../../widgets/JazzCheck.vue";
import VeranstaltungKalkulation from "../../../../shared/veranstaltung/veranstaltungKalkulation";

@Component({
  components: {
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
export default class KalkulationTab extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() optionen!: OptionValues;

  private steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

  get kasse(): Kasse {
    return this.veranstaltung.kasse;
  }

  get kosten(): Kosten {
    return this.veranstaltung.kosten;
  }

  get eintrittspreise(): Eintrittspreise {
    return this.veranstaltung.eintrittspreise;
  }

  get salesreport(): Salesreport {
    return this.veranstaltung.salesreport;
  }

  get kalkulation(): VeranstaltungKalkulation {
    return new VeranstaltungKalkulation(this.veranstaltung);
  }

  get ausgabenTotal(): number {
    return this.kasse.ausgabenOhneGage + this.kosten.totalEUR;
  }

  get einnahmenTotal(): number {
    return this.erwarteteEinnahmen + this.salesreport.netto;
  }

  get erwarteteEinnahmen(): number {
    return this.eintrittspreise.zuschuss + this.kalkulation.erwarteterOderEchterEintritt;
  }

  get deals(): string[] {
    return Kosten.deals;
  }

  format(amount: number): string {
    return `${formatToGermanNumberString(amount)} €`;
  }
}
</script>
