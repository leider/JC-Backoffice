import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";

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

  freigabeErfolgtDurch(name: string): void {
    this.kassenfreigabe = name;
    this.kassenfreigabeAm = new Date();
  }

  freigabeRueckgaengig(): void {
    this.kassenfreigabe = "";
    this.kassenfreigabeAm = undefined;
  }

  get freigabeDisplayDatum(): string {
    return this.kassenfreigabeAm ? DatumUhrzeit.forJSDate(this.kassenfreigabeAm).tagMonatJahrLang : "";
  }
}
