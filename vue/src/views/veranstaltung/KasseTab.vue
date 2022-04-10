<template lang="pug">
#modals
  b-modal#aufhebenDialog(v-model="showAufheben", no-close-on-backdrop, @ok="freigabeAufheben")
    p Bist Du sicher?
    template(v-slot:modal-header)
      h3 Kassenfreigabe rückgängig
    template(v-slot:modal-footer="{ ok, cancel }")
      .row: .col-12: .btn-group.float-right
        b-button.btn.btn-light(@click="cancel()") Abbrechen
        b-button.btn.btn-danger.text(@click="ok()")
          b-icon-lock
          | &nbsp;Kassenfreigabe rückgängig
  b-modal#freigebenDialog(v-model="showFreigeben", no-close-on-backdrop, @ok="freigeben")
    p
      b-icon-exclamation-circle-fill(variant="danger")
      span #{ " " } Nach dem Freigeben ist keine Änderung mehr möglich!
    p: b Die Freigabe sendet den Kassenzettel an die Buchhaltung.
    p: b Du musst natürlich noch "Speichern".
    template(v-slot:modal-header)
      h3 Kasse freigeben
    template(v-slot:modal-footer="{ ok, cancel }")
      .row: .col-12: .btn-group.float-right
        b-button.btn.btn-light(@click="cancel()") Abbrechen
        b-button.btn.btn-success.text(@click="ok()")
          b-icon-unlock
          | &nbsp;Kasse freigeben
  .row
    .col-md-6
      legend-card(
        v-if="!kasse.istFreigegeben",
        section="kasse",
        title="Einnahmen Abendkasse",
        hasMoney="true",
        :money="kasse.einnahmeTotalEUR"
      )
        .row
          .col-4
            jazz-currency(
              label="Tickets (AK)",
              v-model="kasse.einnahmeTicketsEUR",
              tooltip="Alles hier eingegebene gilt als Einnahme für \"Deal\""
            )
          .col-4
            jazz-number(label="Besucher gesamt", v-model="kasse.anzahlBesucherAK", tooltip="Anzahl der bar bezahlten Tickets")
          .col-4
            jazz-currency(label="Bareinlage", v-model="kasse.einnahmeBankEUR", tooltip="z.B. Gage")
        .row
          .col-8
            jazz-text(label="Sonstiges", v-model="kasse.einnahmeSonstiges1Text", tooltip="Spende, Mitgliedsbeitrag, etc.")
          .col-4
            jazz-currency(label="Betrag", v-model="kasse.einnahmeSonstiges1EUR")
        .row
          .col-8
            jazz-text(label="Sonstiges", v-model="kasse.einnahmeSonstiges2Text", tooltip="Spende, Mitgliedsbeitrag, etc.")
          .col-4
            jazz-currency(label="Betrag", v-model="kasse.einnahmeSonstiges2EUR")
      legend-card(v-else, section="kasse", title="Einnahmen Abendkasse", hasMoney="true", :money="kasse.einnahmeTotalEUR")
        .row
          .col-4
            jazz-currency-display(label="Tickets (AK)", :value="kasse.einnahmeTicketsEUR")
          .col-4
            label.float-right Anzahl (AK):
            b: span.text-right.form-control-plaintext.float-right {{ kasse.anzahlBesucherAK }}
          .col-4
            jazz-currency-display(label="Bareinlage", :value="kasse.einnahmeBankEUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{ kasse.einnahmeSonstiges1Text }}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.einnahmeSonstiges1EUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{ kasse.einnahmeSonstiges2Text }}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.einnahmeSonstiges2EUR")
      .row
        .col-12.mb-2
          b-button.btn.btn-kasse(@click="kassenzettel")
            b-icon-printer-fill
            | #{ ' ' } Kassenzettel
          b-button.btn.btn-danger.float-right(:disabled="!darfFreigabeAufheben", v-if="kasse.istFreigegeben", @click="showAufheben = true")
            b-icon-lock
            | &nbsp;Kasse ist freigegeben

          b-button.btn.btn-success.float-right(v-else-if="darfKasseFreigeben", @click="showFreigeben = true")
            b-icon-unlock
            | &nbsp;Kasse freigeben
    .col-md-6
      legend-card(
        v-if="!kasse.istFreigegeben",
        section="kasse",
        title="Ausgaben (Bar und mit Beleg)",
        hasMoney="true",
        :money="kasse.ausgabenTotalEUR"
      )
        .row
          .col-sm-4.col-6
            jazz-currency(label="Catering", v-model="kasse.ausgabeCateringEUR")
          .col-sm-4.col-6
            jazz-currency(label="Personal", v-model="kasse.ausgabeHelferEUR")
        .row
          .col-8
            jazz-text(label="Sonstiges", v-model="kasse.ausgabeSonstiges1Text")
          .col-4
            jazz-currency(label="Betrag", v-model="kasse.ausgabeSonstiges1EUR")
        .row
          .col-8
            jazz-text(label="Sonstiges", v-model="kasse.ausgabeSonstiges2Text")
          .col-4
            jazz-currency(label="Betrag", v-model="kasse.ausgabeSonstiges2EUR")
        .row
          .col-8
            jazz-text(label="Sonstiges", v-model="kasse.ausgabeSonstiges3Text")
          .col-4
            jazz-currency(label="Betrag", v-model="kasse.ausgabeSonstiges3EUR")
        .row
          .col-sm-8.col-6
          .col-sm-4.col-6
            jazz-currency(label="An Bank", v-model="kasse.ausgabeBankEUR")
      legend-card(v-else, section="kasse", title="Ausgaben (Bar und mit Beleg)", hasMoney="true", :money="kasse.ausgabenTotalEUR")
        .row
          .col-sm-4.col-6
            jazz-currency-display(label="Catering", :value="kasse.ausgabeCateringEUR")
          .col-sm-4.col-6
            jazz-currency-display(label="Personal", :value="kasse.ausgabeHelferEUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{ kasse.ausgabeSonstiges1Text }}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.ausgabeSonstiges1EUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{ kasse.ausgabeSonstiges2Text }}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.ausgabeSonstiges2EUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{ kasse.ausgabeSonstiges3Text }}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.ausgabeSonstiges3EUR")
        .row
          .col-sm-8.col-6
          .col-sm-4.col-6
            jazz-currency-display(label="An Bank", :value="kasse.ausgabeBankEUR")
  .row
    .col-md-3.col-6
      jazz-currency(v-if="!kasse.istFreigegeben", label="Anfangsbestand Kasse", v-model="kasse.anfangsbestandEUR")
      jazz-currency-display(v-else, label="Anfangsbestand Kasse", :value="kasse.anfangsbestandEUR")
    .col-md-3.col-6
      jazz-currency(v-if="!kasse.istFreigegeben", label="Endbestand Kasse", v-model="kasse.endbestandEUR")
      jazz-currency-display(v-else, label="Endbestand Kasse", :value="kasse.endbestandEUR")
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "jc-shared/user/user";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Kasse from "jc-shared/veranstaltung/kasse";
import JazzCurrencyDisplay from "../../widgets/JazzCurrencyDisplay.vue";
import Kosten from "jc-shared/veranstaltung/kosten";
import JazzCurrencyPure from "../../widgets/JazzCurrencyPure.vue";
import JazzText from "../../widgets/JazzText.vue";
import JazzCurrency from "../../widgets/JazzCurrency.vue";
import JazzNumber from "../../widgets/JazzNumber.vue";
import LegendCard from "../../widgets/LegendCard.vue";
import { openPayload } from "@/commons/loader";

@Component({
  components: {
    JazzCurrencyPure,
    JazzCurrencyDisplay,
    JazzNumber,
    JazzText,
    JazzCurrency,
    LegendCard,
  },
})
export default class KasseTab extends Vue {
  @Prop() veranstaltung!: Veranstaltung;
  @Prop() user!: User;

  showAufheben = false;
  showFreigeben = false;

  get kasse(): Kasse {
    return this.veranstaltung.kasse;
  }

  get darfKasseFreigeben(): boolean {
    return !!this.user?.accessrights?.darfKasseFreigeben;
  }

  get darfFreigabeAufheben(): boolean {
    return !!this.user?.accessrights?.isSuperuser;
  }

  get kosten(): Kosten {
    return this.veranstaltung.kosten;
  }

  freigeben(): void {
    this.kasse.freigabeErfolgtDurch(this.user.name);
  }

  freigabeAufheben(): void {
    this.kasse.freigabeRueckgaengig();
  }

  kassenzettel(): void {
    openPayload({ url: "kassenzettel", params: { url: this.veranstaltung.url } });
  }
}
</script>
