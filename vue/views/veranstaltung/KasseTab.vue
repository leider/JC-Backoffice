<template lang="pug">
#modals
  b-modal#aufhebenDialog(v-model="showAufheben", no-close-on-backdrop=true, @ok="freigabeAufheben")
    p Bist Du sicher?
    template(v-slot:modal-header)
      h3 Kassenfreigabe rückgängig
    template(v-slot:modal-footer="{ ok, cancel }")
      .row
        .col-12
          .btn-group.float-right
            b-button.btn.btn-light(@click="cancel()") Abbrechen
            b-button.btn.btn-danger.text(@click="ok()")
              i.fas.fa-unlock.fa-fw.fa-lg
              | &nbsp;Kassenfreigabe rückgängig
  b-modal#freigebenDialog(v-model="showFreigeben", no-close-on-backdrop=true, @ok="freigeben")
    p Nach dem Freigeben ist keine Änderung mehr möglich!
    template(v-slot:modal-header)
      h3 Kasse freigeben
    template(v-slot:modal-footer="{ ok, cancel }")
      .row
        .col-12
          .btn-group.float-right
            b-button.btn.btn-light(@click="cancel()") Abbrechen
            b-button.btn.btn-success.text(@click="ok()")
              i.fas.fa-lock.fa-fw.fa-lg

              | &nbsp;Kasse freigeben
  .row
    .col-md-6
      legend-card(v-if="!kasse.istFreigegeben()", section="kasse", title="Einnahmen Abendkasse", hasMoney="true", :money="kasse.einnahmeTotalEUR()")
        .row
          .col-4
            jazz-currency(label="Tickets (AK)", v-model="kasse.einnahmeTicketsEUR", tooltip="Alles hier eingegebene gilt als Einnahme für \"Deal\"")
          .col-4
            jazz-number(label="Anzahl (AK)", v-model="kasse.anzahlBesucherAK", tooltip="Anzahl der bar bezahlten Tickets")
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
      legend-card(v-else, section="kasse", title="Einnahmen Abendkasse", hasMoney="true", :money="kasse.einnahmeTotalEUR()")
        .row
          .col-4
            jazz-currency-display(label="Tickets (AK)", :value="kasse.einnahmeTicketsEUR")
          .col-4
            label.float-right Anzahl (AK):
            b: span.text-right.form-control-plaintext.float-right {{kasse.anzahlBesucherAK}}
          .col-4
            jazz-currency-display(label="Bareinlage", :value="kasse.einnahmeBankEUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{kasse.einnahmeSonstiges1Text}}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.einnahmeSonstiges1EUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{kasse.einnahmeSonstiges2Text}}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.einnahmeSonstiges2EUR")
      .row
        .col-12.mb-2
          a.btn.btn-kasse(:href="veranstaltung.fullyQualifiedUrl() + '/kassenzettel'", title="Abendkasse")
            i.fas.fa-fw.fa-print
            | #{' '} Kassenzettel
          b-button.btn.btn-danger.float-right(v-if="kasse.istFreigegeben()", :class="darfKasseFreigeben ? '' : 'disabled'", @click="showAufheben = true")
            i.fas.fa-lock.fa-fw.fa-lg
            | &nbsp;Kasse ist freigegeben

          b-button.btn.btn-success.float-right(v-else-if="darfKasseFreigeben", @click="showFreigeben = true")
            i.fas.fa-unlock.fa-fw.fa-lg
            | &nbsp;Kasse freigeben
    .col-md-6
      legend-card(v-if="!kasse.istFreigegeben()", section="kasse", title="Ausgaben (Bar und mit Beleg)", hasMoney="true", :money="kasse.ausgabenTotalEUR()")
        .row
          .col-sm-4.col-6
            jazz-currency(v-if="!kosten.gageBAR", label="Gage", v-model="kasse.ausgabeGageEUR")
            .form-group(v-else)
              label.control-label.text-danger
                i.fas.fa-exclamation-triangle
                | &nbsp; Gage BAR &nbsp;
                i.fas.fa-exclamation-triangle :
              jazz-currency-pure(v-model="kasse.ausgabeGageEUR")
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
      legend-card(v-else, section="kasse", title="Ausgaben (Bar und mit Beleg)", hasMoney="true", :money="kasse.ausgabenTotalEUR()")
        .row
          .col-sm-4.col-6
            jazz-currency-display(label="Gage", :value="kasse.ausgabeGageEUR")
          .col-sm-4.col-6
            jazz-currency-display(label="Catering", :value="kasse.ausgabeCateringEUR")
          .col-sm-4.col-6
            jazz-currency-display(label="Personal", :value="kasse.ausgabeHelferEUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{kasse.ausgabeSonstiges1Text}}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.ausgabeSonstiges1EUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{kasse.ausgabeSonstiges2Text}}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.ausgabeSonstiges2EUR")
        .row
          .col-8
            label Sonstiges:
            b: span.text-right.form-control-plaintext.float-right {{kasse.ausgabeSonstiges3Text}}
          .col-4
            jazz-currency-display(label="Betrag", :value="kasse.ausgabeSonstiges3EUR")
        .row
          .col-sm-8.col-6
          .col-sm-4.col-6
            jazz-currency-display(label="An Bank", :value="kasse.ausgabeBankEUR")
  .row
    .col-sm-3.col-6
      jazz-currency(v-if="!kasse.istFreigegeben()", label="Anfangsbestand", v-model="kasse.anfangsbestandEUR")
      jazz-currency-display(v-else, label="Anfangsbestand", :value="kasse.anfangsbestandEUR")
    .col-sm-3.col-6
      jazz-currency(v-if="!kasse.istFreigegeben()", label="Endbestand", v-model="kasse.endbestandEUR()")
      jazz-currency-display(v-else, label="Anfangsbestand", :value="kasse.endbestandEUR()")

</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Veranstaltung from "../../../lib/veranstaltungen/object/veranstaltung";
import LegendCard from "@/widgets/LegendCard.vue";
import JazzCurrency from "@/widgets/JazzCurrency.vue";
import Kosten from "../../../lib/veranstaltungen/object/kosten";
import JazzText from "@/widgets/JazzText.vue";
import Kasse from "../../../lib/veranstaltungen/object/kasse";
import JazzNumber from "@/widgets/JazzNumber.vue";
import User from "../../../lib/users/user";
import JazzCurrencyDisplay from "@/widgets/JazzCurrencyDisplay.vue";
import JazzCurrencyPure from "@/widgets/JazzCurrencyPure.vue";

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
    return this.user?.accessrights?.darfKasseFreigeben;
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
}
</script>
