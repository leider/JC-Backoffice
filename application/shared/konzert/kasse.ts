import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import isString from "lodash/isString.js";
import keys from "lodash/keys.js";

type MuenzenScheine = {
  "10"?: number;
  "20"?: number;
  "50"?: number;
  "100"?: number;
  "200"?: number;
  "500"?: number;
  "1000"?: number;
  "2000"?: number;
  "5000"?: number;
  "10000"?: number;
};

export default class Kasse {
  anfangsbestandEUR = 0;
  ausgabeBankEUR = 0;
  ausgabeCateringEUR = 0;
  ausgabeHelferEUR = 0;
  ausgabeSonstiges1EUR = 0;
  ausgabeSonstiges2EUR = 0;
  ausgabeSonstiges3EUR = 0;
  einnahmeBankEUR = 0;
  einnahmeSonstiges1EUR = 0;
  einnahmeTicketsEUR = 0;
  einnahmeSonstiges2EUR = 0;
  ausgabeSonstiges1Text = "";
  ausgabeSonstiges2Text = "";
  ausgabeSonstiges3Text = "";
  einnahmeSonstiges1Text = "";
  einnahmeSonstiges2Text = "";
  anzahlBesucherAK = 0;
  kassenfreigabe? = "";
  kassenfreigabeAm?: Date;
  einnahmenReservix = 0; // darf nicht in kassenberechnung
  anzahlReservix = 0; // darf nicht in kassenberechnung
  startinhalt: MuenzenScheine = {
    "10": undefined,
    "20": undefined,
    "50": undefined,
    "100": undefined,
    "200": undefined,
    "500": undefined,
    "1000": undefined,
    "2000": undefined,
    "5000": undefined,
    "10000": undefined,
  };
  endinhalt: MuenzenScheine = {
    "10": undefined,
    "20": undefined,
    "50": undefined,
    "100": undefined,
    "200": undefined,
    "500": undefined,
    "1000": undefined,
    "2000": undefined,
    "5000": undefined,
    "10000": undefined,
  };
  endbestandGezaehltEUR = 0;

  constructor(object?: RecursivePartial<Omit<Kasse, "kassenfreigabeAm"> & { kassenfreigabeAm?: Date | string }>) {
    if (object && keys(object).length !== 0) {
      const ak = object.anzahlBesucherAK ?? 0;
      Object.assign(this, object, {
        kassenfreigabeAm: Misc.stringOrDateToDate(object.kassenfreigabeAm),
        anzahlBesucherAK: isString(ak) ? parseInt(ak) : ak,
        startinhalt: {
          "10": object.startinhalt?.["10"],
          "20": object.startinhalt?.["20"],
          "50": object.startinhalt?.["50"],
          "100": object.startinhalt?.["100"],
          "200": object.startinhalt?.["200"],
          "500": object.startinhalt?.["500"],
          "1000": object.startinhalt?.["1000"],
          "2000": object.startinhalt?.["2000"],
          "5000": object.startinhalt?.["5000"],
          "10000": object.startinhalt?.["10000"],
        },
        endinhalt: {
          "10": object.endinhalt?.["10"],
          "20": object.endinhalt?.["20"],
          "50": object.endinhalt?.["50"],
          "100": object.endinhalt?.["100"],
          "200": object.endinhalt?.["200"],
          "500": object.endinhalt?.["500"],
          "1000": object.endinhalt?.["1000"],
          "2000": object.endinhalt?.["2000"],
          "5000": object.endinhalt?.["5000"],
          "10000": object.endinhalt?.["10000"],
        },
      });
    }
  }

  get ausgabenOhneGage(): number {
    return (
      this.ausgabeCateringEUR + this.ausgabeHelferEUR + this.ausgabeSonstiges1EUR + this.ausgabeSonstiges2EUR + this.ausgabeSonstiges3EUR
    );
  }

  get ausgabenTotalEUR(): number {
    return this.ausgabeBankEUR + this.ausgabenOhneGage;
  }

  get einnahmeOhneBankUndTickets(): number {
    return this.einnahmeSonstiges1EUR + this.einnahmeSonstiges2EUR;
  }

  get einnahmeTotalEUR(): number {
    return this.einnahmeBankEUR + this.einnahmeOhneBankUndTickets + this.einnahmeTicketsEUR;
  }

  get endbestandEUR(): number {
    return this.anfangsbestandEUR + this.einnahmeTotalEUR - this.ausgabenTotalEUR;
  }

  // FREIGABE

  get istFreigegeben(): boolean {
    return !!this.kassenfreigabe;
  }

  get freigabeDisplayDatum(): string {
    return this.kassenfreigabeAm ? DatumUhrzeit.forJSDate(this.kassenfreigabeAm).tagMonatJahrLang : "";
  }
}
