import { Preisprofil } from "../optionen/optionValues";
import Kasse from "./kasse";

export default class Eintrittspreise {
  preisprofil: Preisprofil = { name: "Freier Eintritt", regulaer: 0, rabattErmaessigt: 0, rabattMitglied: 0 };
  erwarteteBesucher = 0;
  zuschuss = 0;

  static preisprofilAlt(object: any): any {
    if (object.frei) {
      return { name: "Freier Eintritt", regulaer: 0, rabattErmaessigt: 0, rabattMitglied: 0 };
    }
    return {
      name: "Individuell (Alt)",
      regulaer: object.regulaer || 0,
      rabattErmaessigt: object.rabattErmaessigt || 0,
      rabattMitglied: object.rabattMitglied || 0,
    };
  }

  toJSON(): any {
    return Object.assign({}, this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      if (!object.preisprofil) {
        this.preisprofil = Eintrittspreise.preisprofilAlt(object);
      } else {
        this.preisprofil = Object.assign({}, object.preisprofil);
      }
      this.erwarteteBesucher = object.erwarteteBesucher || 0;
      this.zuschuss = object.zuschuss || 0;
    }
  }

  standardRabattErmaessigt(): number {
    return 2;
  }

  standardRabattMitglied(): number {
    return 5;
  }

  frei(): boolean {
    return this.preisprofil.regulaer === 0;
  }

  istKooperation(): boolean {
    return this.preisprofil.name === "Kooperation";
  }

  regulaer(): number {
    return this.preisprofil.regulaer;
  }

  rabattErmaessigt(): number {
    return this.preisprofil.rabattErmaessigt || this.standardRabattErmaessigt();
  }

  rabattMitglied(): number {
    return this.preisprofil.rabattMitglied || this.standardRabattMitglied();
  }

  ermaessigt(): number {
    return Math.max(this.regulaer() - Math.abs(this.rabattErmaessigt()), 0);
  }

  mitglied(): number {
    return Math.max(this.regulaer() - Math.abs(this.rabattMitglied()), 0);
  }

  erwarteteEinnahmen(kasse: Kasse): number {
    return this.zuschuss + this.erwarteterOderEchterEintritt(kasse);
  }

  erwarteterOderEchterEintritt(kasse: Kasse): number {
    return kasse.istFreigegeben()
      ? kasse.einnahmeTicketsEUR
      : this.erwarteteBesucher * (0.8 * this.regulaer() + 0.1 * this.ermaessigt() + 0.1 * this.mitglied());
  }

  alsPressetext(kooperationspartner: string): string {
    return this.istKooperation()
      ? `Gemäß Kooperationspartner (${kooperationspartner})`
      : this.frei()
      ? "freier Eintritt"
      : `${this.regulaer()},- (Ermässigt: ${this.ermaessigt()},-, Mitglieder: ${this.mitglied()},-) €`;
  }
}
