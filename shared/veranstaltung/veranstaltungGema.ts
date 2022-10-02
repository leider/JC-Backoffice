import Veranstaltung from "./veranstaltung";
import fieldHelpers from "../commons/fieldHelpers";

export default class VeranstaltungGema {
  private veranstaltung: Veranstaltung;

  constructor(veranstaltung: Veranstaltung) {
    this.veranstaltung = veranstaltung;
  }

  private get kasse() {
    return this.veranstaltung.kasse;
  }

  private get eintrittspreise() {
    return this.veranstaltung.eintrittspreise;
  }

  private get kooperation(): boolean {
    return this.veranstaltung.kopf.rechnungAnKooperationspartner;
  }

  get preisAusweis(): string {
    if (this.eintrittspreise.frei || this.kooperation) {
      return "-";
    }
    return `${fieldHelpers.formatNumberTwoDigits(this.eintrittspreise.regulaer)} €`;
  }

  get eintritt(): string {
    if (this.eintrittspreise.frei || this.kooperation) {
      return "-";
    }
    return `${fieldHelpers.formatNumberTwoDigits(this.kasse.einnahmeTicketsEUR)} €`;
  }

  get anzahlBesucher(): number {
    return this.kasse.anzahlBesucherAK;
  }
}
