import Konzert from "../konzert/konzert.js";
import Veranstaltung from "./veranstaltung.js";

export default class VeranstaltungFormatter {
  private veranstaltung: Veranstaltung;

  constructor(veranstaltung: Veranstaltung) {
    this.veranstaltung = veranstaltung;
  }

  get presseTemplate(): string {
    if (this.veranstaltung.isVermietung) {
      return `### ${this.veranstaltung.kopf.titelMitPrefix}
#### ${this.veranstaltung.startDatumUhrzeit.fuerPresse} ${this.veranstaltung.kopf.presseInEcht}

`;
    }

    const eintrittspreise = (this.veranstaltung as Konzert).eintrittspreise;
    let eintrittspreiseText: string;
    if (eintrittspreise.istKooperation) {
      eintrittspreiseText = `Gemäß Kooperationspartner (${this.veranstaltung.kopf.kooperationspartnerText})`;
    } else {
      eintrittspreiseText = eintrittspreise.frei
        ? "freier Eintritt"
        : `${eintrittspreise.regulaer},- (Ermässigt: ${eintrittspreise.ermaessigt},-, Mitglieder: ${eintrittspreise.mitglied},-) €`;
    }

    return `### ${this.veranstaltung.kopf.titelMitPrefix}
#### ${this.veranstaltung.startDatumUhrzeit.fuerPresse} ${this.veranstaltung.kopf.presseInEcht}
**Eintritt:** ${eintrittspreiseText}

`;
  }

  presseTextForMail(prefix: string): string {
    const presse = this.veranstaltung.presse;
    return (
      this.presseTemplate +
      presse.text +
      "\n\n" +
      (presse.firstImage ? presse.imageURL(prefix) : "") +
      "\n\n" +
      (presse.jazzclubURL ? `**URL:** ${presse.fullyQualifiedJazzclubURL}` : "")
    );
  }

  get description(): string {
    return `${this.veranstaltung.startDatumUhrzeit.tagMonatJahrLangMitKW} ${this.veranstaltung.kopf.titelMitPrefix}`;
  }
}
