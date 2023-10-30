import Vermietung from "./vermietung.js";

export default class VermietungFormatter {
  private vermietung: Vermietung;

  constructor(vermietung: Vermietung) {
    this.vermietung = vermietung;
  }

  get presseTemplate(): string {
    return `### ${this.vermietung.kopf.titelMitPrefix}
#### ${this.vermietung.startDatumUhrzeit.fuerPresse} ${this.vermietung.kopf.presseInEcht}

`;
  }

  presseTextForMail(prefix: string): string {
    const presse = this.vermietung.presse;
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
    return `${this.vermietung.startDatumUhrzeit.tagMonatJahrLangMitKW} ${this.vermietung.kopf.titelMitPrefix}`;
  }
}
