import DatumUhrzeit from "../commons/DatumUhrzeit";
import Misc from "../commons/misc";

export default class Kasse {
  anfangsbestandEUR = 0;
  ausgabeBankEUR = 0;
  ausgabeCateringEUR = 0;
  ausgabeGageEUR = 0;
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
  kassenfreigabeAm? = new Date();

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      const ak = object.anzahlBesucherAK;
      Object.assign(this, object, {
        kassenfreigabeAm: Misc.stringOrDateToDate(object.kassenfreigabeAm),
        anzahlBesucherAK: typeof ak === "string" ? parseInt(ak) : isNaN(ak) ? 0 : ak,
      });
    }
  }

  ausgabenOhneGage(): number {
    return (
      this.ausgabeCateringEUR + this.ausgabeHelferEUR + this.ausgabeSonstiges1EUR + this.ausgabeSonstiges2EUR + this.ausgabeSonstiges3EUR
    );
  }

  ausgabenTotalEUR(): number {
    return this.ausgabeBankEUR + this.ausgabeGageEUR + this.ausgabenOhneGage();
  }

  einnahmeTotalEUR(): number {
    return this.einnahmeBankEUR + this.einnahmeSonstiges1EUR + this.einnahmeSonstiges2EUR + this.einnahmeTicketsEUR;
  }

  endbestandEUR(): number {
    return this.anfangsbestandEUR + this.einnahmeTotalEUR() - this.ausgabenTotalEUR();
  }

  // FREIGABE

  istFreigegeben(): boolean {
    return !!this.kassenfreigabe;
  }

  freigabeErfolgtDurch(name: string): void {
    this.kassenfreigabe = name;
    this.kassenfreigabeAm = new Date();
  }

  freigabeRueckgaengig(): void {
    this.kassenfreigabe = undefined;
    this.kassenfreigabeAm = undefined;
  }

  freigabeDisplayDatum(): string {
    return this.kassenfreigabeAm ? DatumUhrzeit.forJSDate(this.kassenfreigabeAm).tagMonatJahrLang : "";
  }
}
