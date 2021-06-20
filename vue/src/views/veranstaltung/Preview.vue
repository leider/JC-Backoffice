<template lang="pug">
.col-12
  .btn-group.float-right
    delete-button-with-dialog(
      v-if="isOrgaTeam",
      :id="veranstaltung.id",
      :name="veranstaltung.kopf.titel",
      objecttype="Veranstaltung",
      :callback="loeschen",
      :dirty="kopf.confirmed",
      show-text="true"
    )
    b-button.btn-copy(v-if="isOrgaTeam", :to="`${veranstaltung.fullyQualifiedUrl}/copy`", title="Kopieren")
      b-icon-files
      | #{ " " }Kopieren
  h2
    span(:class="iconClass", style="font-weight: normal")
    span(:class="colorClass") &nbsp; {{ kopf.titelMitPrefix }} {{ kopf.presseInEcht }}
    br
    small am {{ veranstaltung.datumForDisplayShort }}
  h3(v-if="kooperation && kooperation.length > 1") Kooperation mit {{ kooperation }}
  .row
    .col-md-6
      legend-card(section="staff", title="Staff")
        table.table.table-striped.table-sm
          tbody(v-if="staff.noStaffNeeded")
            tr: th(colspan=2) Niemand benötigt
          tbody(v-else)
            tr: th(colspan=2) MoD
            preview-user-row(v-for="name in staff.mod", :key="name", :name="name", :users="users", :verantwortlich="true")
            tr: th(colspan=2) Kasse
            preview-user-row(v-for="name in staff.kasseV", :key="name", :name="name", :users="users", :verantwortlich="true")
            preview-user-row(v-for="name in staff.kasse", :key="name", :name="name", :users="users", :verantwortlich="false")
            tr: th(colspan=2) Technik
            preview-user-row(v-for="name in staff.technikerV", :key="name", :name="name", :users="users", :verantwortlich="true")
            preview-user-row(v-for="name in staff.techniker", :key="name", :name="name", :users="users", :verantwortlich="false")
            tr(v-if="staff && staff.merchandise.length > 0"): th(colspan=2) Merchandising
            preview-user-row(v-for="name in staff.merchandise", :key="name", :name="name", :users="users", :verantwortlich="false")

      legend-card(section="kasse", title="Eintritt und Abendkasse")
        table.table.table-striped.table-sm
          tbody(v-if="eintrittspreise.frei")
            tr: th(align="right") Freier Eintritt (Sammelbox)
          tbody(v-else)
            tr
              th.text-right: jazz-currency-display(:value="eintrittspreise.regulaer")
              th.text-right: jazz-currency-display(:value="eintrittspreise.ermaessigt")
              th.text-right: jazz-currency-display(:value="eintrittspreise.mitglied")
            tr(v-if="veranstaltung.reservixID")
              th: .form-control-plaintext
                | Reservix &nbsp;
                img(src="/img/rex_14x14.png")
              th.text-right: .form-control-plaintext {{ veranstaltung.salesreport.anzahl }}
              th.text-right: jazz-currency-display(:value="veranstaltung.salesreport.netto")
            tr(v-if="isAbendkasse"): td.text-right(colspan=3): b-button.btn-kasse(
              :to="`${veranstaltung.fullyQualifiedUrl}/kasse`",
              title="Abendkasse"
            ) Abendkasse

      legend-card(v-if="kopf.beschreibung && kopf.beschreibung.trim()", section="allgemeines", title="Informationen")
        div(v-html="previewBeschreibung")

      legend-card(section="technik", title="Technik")
        table.table.table-sm.table-striped
          tbody
            tr(v-if="technik.fluegel"): th(colspan=2) Flügel stimmen!
            tr(v-if="technik.backlineJazzclub.length > 0"): th(colspan=2) Backline Jazzclub
            tr(v-for="item in technik.backlineJazzclub", :key="item")
              td(width="2%")
              td(width="98%") {{ item }}
            tr(v-if="technik.backlineRockshop.length > 0"): th(colspan=2) Backline Rockshop
            tr(v-for="item in technik.backlineRockshop", :key="item")
              td(width="2%")
              td(width="98%") {{ item }}
            tr(v-if="technik.dateirider.length > 0"): th(colspan=2) Dateien
            tr(v-for="item in technik.dateirider", :key="item")
              td.text-right(colspan=2): a.btn.btn-ausgaben(:href="`/files/${item}`") {{ item }}

    .col-md-6
      legend-card(section="presse", title="Pressetext")
        div(v-html="preview")

      legend-card(v-if="agentur.name", section="allgemeines", title="Agentur")
        address
          strong {{ agentur.ansprechpartner }} <br>
          | {{ agentur.adresse }} <br>
          | Tel.: {{ agentur.telefon }} <br>
          | E-Mail: &nbsp;
          a(:href="`mailto:${agentur.email}`") {{ agentur.email }}

      legend-card(v-if="veranstaltung.unterkunft.anzahlZimmer > 0", section="hotel", :title="hoteltitel")
        address
          strong {{ hotel.ansprechpartner }} <br>
          | {{ hotel.adresse }} <br>
          | Tel.: {{ hotel.telefon }} <br>
          | E-Mail: &nbsp;
          a(:href="`mailto:${hotel.email}`") {{ hotel.email }}
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import User from "jc-shared/user/user";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import renderer from "jc-shared/commons/renderer";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Eintrittspreise from "jc-shared/veranstaltung/eintrittspreise";
import PreviewUserRow from "./PreviewUserRow.vue";
import Kontakt from "jc-shared/veranstaltung/kontakt";
import { allUsers, currentUser, deleteVeranstaltungWithId, veranstaltungForUrl } from "../../commons/loader";
import Staff from "jc-shared/veranstaltung/staff";
import LegendCard from "../../widgets/LegendCard.vue";
import JazzCurrencyDisplay from "../../widgets/JazzCurrencyDisplay.vue";
import Technik from "jc-shared/veranstaltung/technik";
import DeleteButtonWithDialog from "../../widgets/DeleteButtonWithDialog.vue";
import Kopf from "jc-shared/veranstaltung/kopf";
import Presse from "jc-shared/veranstaltung/presse";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";

@Component({
  components: { DeleteButtonWithDialog, JazzCurrencyDisplay, PreviewUserRow, LegendCard },
})
export default class Preview extends Vue {
  @Prop() url!: string;
  @Prop() tab!: string;

  private veranstaltung = new Veranstaltung();
  private user = new User({});
  private users: User[] = [];

  created(): void {
    allUsers((users: User[]) => {
      this.users = users;
    });
    currentUser((user: User) => {
      this.user = user;
    });
  }

  get isOrgaTeam(): boolean {
    const accessrights = this.user.accessrights;
    return !!accessrights && accessrights.isOrgaTeam;
  }

  get isAbendkasse(): boolean {
    const accessrights = this.user.accessrights;
    return !!accessrights && accessrights.isAbendkasse;
  }

  get kooperation(): string {
    return this.kopf.kooperation;
  }

  get kopf(): Kopf {
    return this.veranstaltung.kopf;
  }

  get staff(): Staff {
    return this.veranstaltung.staff;
  }

  get technik(): Technik {
    return this.veranstaltung.technik;
  }

  get presse(): Presse {
    return this.veranstaltung.presse;
  }

  get eintrittspreise(): Eintrittspreise {
    return this.veranstaltung.eintrittspreise;
  }

  get agentur(): Kontakt {
    return this.veranstaltung.agentur;
  }

  get hotel(): Kontakt {
    return this.veranstaltung.hotel;
  }

  get previewBeschreibung(): string {
    return renderer.render(this.kopf.beschreibung);
  }

  get preview(): string {
    return (
      renderer.render(`${new VeranstaltungFormatter(this.veranstaltung).presseTemplate + this.presse.text}
${this.presse.fullyQualifiedJazzclubURL}`) +
      `<h4>Bilder:</h4>${this.presse.image
        .map((i) => `<p><img src="/imagepreview/${i}" width="100%"></p>`)
        .reverse()
        .join("")}`
    );
  }

  get hoteltitel(): string {
    return `${this.hotel.name}: ${this.veranstaltung.unterkunft.anzahlZimmer} Zimmer / ${this.veranstaltung.unterkunft.anzNacht}`;
  }

  @Watch("$url")
  mounted(): void {
    veranstaltungForUrl(this.url, (v: Veranstaltung) => {
      this.veranstaltung = v;
      document.title = this.veranstaltung.kopf.titelMitPrefix;
    });
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

  get iconClass(): string {
    return fieldHelpers.cssIconClass(this.veranstaltung.kopf.eventTyp);
  }
}
</script>
