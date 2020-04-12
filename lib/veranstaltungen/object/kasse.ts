import DatumUhrzeit from "../../commons/DatumUhrzeit";
import Misc from "../../commons/misc";

function floatAmount(textWithNumberOrNull?: string | null): number {
  return parseFloat(textWithNumberOrNull || "") || 0;
}

export interface KasseUI {
  anfangsbestandEUR: string;
  ausgabeBankEUR: string;
  ausgabeCateringEUR: string;
  ausgabeGageEUR: string;
  ausgabeHelferEUR: string;
  ausgabeSonstiges1EUR: string;
  ausgabeSonstiges2EUR: string;
  ausgabeSonstiges3EUR: string;
  einnahmeBankEUR: string;
  einnahmeSonstiges1EUR: string;
  einnahmeTicketsEUR: string;
  einnahmeSonstiges2EUR: string;
  ausgabeSonstiges1Text: string;
  ausgabeSonstiges2Text: string;
  ausgabeSonstiges3Text: string;
  einnahmeSonstiges1Text: string;
  einnahmeSonstiges2Text: string;
  anzahlBesucherAK: string;
  kassenfreigabe?: string;
  kassenfreigabeAm?: Date;
}

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

  fillFromUI(object: KasseUI): Kasse {
    this.anfangsbestandEUR = floatAmount(object.anfangsbestandEUR);
    this.ausgabeBankEUR = floatAmount(object.ausgabeBankEUR);
    this.ausgabeCateringEUR = floatAmount(object.ausgabeCateringEUR);
    this.ausgabeGageEUR = floatAmount(object.ausgabeGageEUR);
    this.ausgabeHelferEUR = floatAmount(object.ausgabeHelferEUR);
    this.ausgabeSonstiges1EUR = floatAmount(object.ausgabeSonstiges1EUR);
    this.ausgabeSonstiges2EUR = floatAmount(object.ausgabeSonstiges2EUR);
    this.ausgabeSonstiges3EUR = floatAmount(object.ausgabeSonstiges3EUR);
    this.einnahmeBankEUR = floatAmount(object.einnahmeBankEUR);
    this.einnahmeSonstiges1EUR = floatAmount(object.einnahmeSonstiges1EUR);
    this.einnahmeSonstiges2EUR = floatAmount(object.einnahmeSonstiges2EUR);
    this.einnahmeTicketsEUR = floatAmount(object.einnahmeTicketsEUR);
    this.ausgabeSonstiges1Text = object.ausgabeSonstiges1Text;
    this.ausgabeSonstiges2Text = object.ausgabeSonstiges2Text;
    this.ausgabeSonstiges3Text = object.ausgabeSonstiges3Text;
    this.einnahmeSonstiges1Text = object.einnahmeSonstiges1Text;
    this.einnahmeSonstiges2Text = object.einnahmeSonstiges2Text;
    this.anzahlBesucherAK = parseInt(object.anzahlBesucherAK);
    this.kassenfreigabe = object.kassenfreigabe || this.kassenfreigabe; // kann nicht mehr gelöscht werden
    return this;
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
    return this.einnahmeTotalEUR() - this.ausgabenTotalEUR();
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
    delete this.kassenfreigabe;
    delete this.kassenfreigabeAm;
  }

  freigabeDisplayDatum(): string {
    return this.kassenfreigabeAm ? DatumUhrzeit.forJSDate(this.kassenfreigabeAm).tagMonatJahrLang : "";
  }
}
