import Konzert from "../konzert/konzert.js";
import Vermietung from "../vermietung/vermietung.js";

export default class VeranstaltungVermietungFormatter {
  private veranstVermiet: Konzert | Vermietung;

  constructor(veranstVermiet: Konzert | Vermietung) {
    this.veranstVermiet = veranstVermiet;
  }

  get presseTemplate(): string {
    if (this.veranstVermiet.isVermietung) {
      return `### ${this.veranstVermiet.kopf.titelMitPrefix}
#### ${this.veranstVermiet.startDatumUhrzeit.fuerPresse} ${this.veranstVermiet.kopf.presseInEcht}

`;
    }
    const eintrittspreise = (this.veranstVermiet as Konzert).eintrittspreise;
    const eintrittspreiseText = eintrittspreise.istKooperation
      ? `Gemäß Kooperationspartner (${this.veranstVermiet.kopf.kooperationspartnerText})`
      : eintrittspreise.frei
        ? "freier Eintritt"
        : `${eintrittspreise.regulaer},- (Ermässigt: ${eintrittspreise.ermaessigt},-, Mitglieder: ${eintrittspreise.mitglied},-) €`;

    return `### ${this.veranstVermiet.kopf.titelMitPrefix}
#### ${this.veranstVermiet.startDatumUhrzeit.fuerPresse} ${this.veranstVermiet.kopf.presseInEcht}
**Eintritt:** ${eintrittspreiseText}

`;
  }

  presseTextForMail(prefix: string): string {
    const presse = this.veranstVermiet.presse;
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
    return `${this.veranstVermiet.startDatumUhrzeit.tagMonatJahrLangMitKW} ${this.veranstVermiet.kopf.titelMitPrefix}`;
  }
}
