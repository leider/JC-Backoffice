import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";

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
  startinhalt: MuenzenScheine = {};
  endinhalt: MuenzenScheine = {};
  endbestandGezaehltEUR = 0;
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      const ak = object.anzahlBesucherAK;
      Object.assign(this, object, {
        kassenfreigabeAm: Misc.stringOrDateToDate(object.kassenfreigabeAm),
        anzahlBesucherAK: typeof ak === "string" ? parseInt(ak) : isNaN(ak) ? 0 : ak,
        startinhalt: {
          "10": object["10"],
          "20": object["20"],
          "50": object["50"],
          "100": object["100"],
          "200": object["200"],
          "500": object["500"],
          "1000": object["1000"],
          "2000": object["2000"],
          "5000": object["5000"],
          "10000": object["10000"],
        },
        endinhalt: {
          "10": object["10"],
          "20": object["20"],
          "50": object["50"],
          "100": object["100"],
          "200": object["200"],
          "500": object["500"],
          "1000": object["1000"],
          "2000": object["2000"],
          "5000": object["5000"],
          "10000": object["10000"],
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

  set endbestandEUR(betrag: number) {
    // no op
  }

  // FREIGABE

  get istFreigegeben(): boolean {
    return !!this.kassenfreigabe;
  }

  get freigabeDisplayDatum(): string {
    return this.kassenfreigabeAm ? DatumUhrzeit.forJSDate(this.kassenfreigabeAm).tagMonatJahrLang : "";
  }
}
