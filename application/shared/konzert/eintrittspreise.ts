import { Preisprofil } from "../optionen/optionValues.js";
import isNil from "lodash/isNil.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import keys from "lodash/keys.js";

const standardRabattErmaessigt = 2;
const standardRabattMitglied = 5;

export default class Eintrittspreise {
  preisprofil: Preisprofil = { name: "Freier Eintritt", regulaer: 0, rabattErmaessigt: 0, rabattMitglied: 0 };
  erwarteteBesucher = 0;
  zuschuss = 0;

  static preisprofilAlt(object: Partial<Preisprofil> & { frei?: boolean }): Preisprofil {
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

  constructor(object?: RecursivePartial<Eintrittspreise>) {
    if (object && keys(object).length !== 0) {
      if (!object.preisprofil) {
        this.preisprofil = Eintrittspreise.preisprofilAlt(object);
      } else {
        this.preisprofil = Object.assign({}, object.preisprofil) as Preisprofil;
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
    return isNil(this.preisprofil.rabattErmaessigt) ? standardRabattErmaessigt : this.preisprofil.rabattErmaessigt;
  }

  private get rabattMitglied(): number {
    return isNil(this.preisprofil.rabattMitglied) ? standardRabattMitglied : this.preisprofil.rabattMitglied;
  }

  get ermaessigt(): number {
    return Math.max(this.regulaer - Math.abs(this.rabattErmaessigt), 0);
  }

  get mitglied(): number {
    return Math.max(this.regulaer - Math.abs(this.rabattMitglied), 0);
  }

  get eintrittspreisSchnitt() {
    return 0.8 * this.regulaer + 0.1 * this.ermaessigt + 0.1 * this.mitglied;
  }

  get erwarteterEintritt(): number {
    return this.erwarteteBesucher * (this.frei ? 10 : this.eintrittspreisSchnitt);
  }
}
