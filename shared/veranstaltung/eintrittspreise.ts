import { Preisprofil } from "../optionen/optionValues";

const standardRabattErmaessigt = 2;
const standardRabattMitglied = 5;

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

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
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

  get frei(): boolean {
    return this.preisprofil.regulaer === 0;
  }

  get istKooperation(): boolean {
    return this.preisprofil.name === "Kooperation";
  }

  get regulaer(): number {
    return this.preisprofil.regulaer;
  }

  private get rabattErmaessigt(): number {
    return this.preisprofil.rabattErmaessigt || standardRabattErmaessigt;
  }

  private get rabattMitglied(): number {
    return this.preisprofil.rabattMitglied || standardRabattMitglied;
  }

  get ermaessigt(): number {
    return Math.max(this.regulaer - Math.abs(this.rabattErmaessigt), 0);
  }

  get mitglied(): number {
    return Math.max(this.regulaer - Math.abs(this.rabattMitglied), 0);
  }

  get erwarteterEintritt(): number {
    return this.erwarteteBesucher * (0.8 * this.regulaer + 0.1 * this.ermaessigt + 0.1 * this.mitglied);
  }
}
