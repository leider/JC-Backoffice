import DatumUhrzeit from '../../commons/DatumUhrzeit';

function floatAmount(textWithNumberOrNull?: string | null): number {
  return parseFloat(textWithNumberOrNull || '') || 0;
}

export interface KasseRaw {
  anfangsbestandEUR: number;
  ausgabeBankEUR: number;
  ausgabeCateringEUR: number;
  ausgabeGageEUR: number;
  ausgabeHelferEUR: number;
  ausgabeSonstiges1EUR: number;
  ausgabeSonstiges2EUR: number;
  ausgabeSonstiges3EUR: number;
  einnahmeBankEUR: number;
  einnahmeSonstiges1EUR: number;
  einnahmeTicketsEUR: number;
  einnahmeSonstiges2EUR: number;
  ausgabeSonstiges1Text: string;
  ausgabeSonstiges2Text: string;
  ausgabeSonstiges3Text: string;
  einnahmeSonstiges1Text: string;
  einnahmeSonstiges2Text: string;
  anzahlBesucherAK: string;
  kassenfreigabe?: string;
  kassenfreigabeAm?: Date;
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
  state: KasseRaw;

  toJSON(): KasseRaw {
    return this.state;
  }

  constructor(object: KasseRaw | undefined) {
    this.state = object || {
      anfangsbestandEUR: 500,
      ausgabeBankEUR: 0,
      ausgabeCateringEUR: 0,
      ausgabeGageEUR: 0,
      ausgabeHelferEUR: 0,
      ausgabeSonstiges1EUR: 0,
      ausgabeSonstiges2EUR: 0,
      ausgabeSonstiges3EUR: 0,
      einnahmeBankEUR: 0,
      einnahmeSonstiges1EUR: 0,
      einnahmeTicketsEUR: 0,
      einnahmeSonstiges2EUR: 0,
      ausgabeSonstiges1Text: '',
      ausgabeSonstiges2Text: '',
      ausgabeSonstiges3Text: '',
      einnahmeSonstiges1Text: '',
      einnahmeSonstiges2Text: '',
      anzahlBesucherAK: ''
    };
  }

  fillFromUI(object: KasseUI): Kasse {
    this.state.anfangsbestandEUR = floatAmount(object.anfangsbestandEUR);
    this.state.ausgabeBankEUR = floatAmount(object.ausgabeBankEUR);
    this.state.ausgabeCateringEUR = floatAmount(object.ausgabeCateringEUR);
    this.state.ausgabeGageEUR = floatAmount(object.ausgabeGageEUR);
    this.state.ausgabeHelferEUR = floatAmount(object.ausgabeHelferEUR);
    this.state.ausgabeSonstiges1EUR = floatAmount(object.ausgabeSonstiges1EUR);
    this.state.ausgabeSonstiges2EUR = floatAmount(object.ausgabeSonstiges2EUR);
    this.state.ausgabeSonstiges3EUR = floatAmount(object.ausgabeSonstiges3EUR);
    this.state.einnahmeBankEUR = floatAmount(object.einnahmeBankEUR);
    this.state.einnahmeSonstiges1EUR = floatAmount(
      object.einnahmeSonstiges1EUR
    );
    this.state.einnahmeSonstiges2EUR = floatAmount(
      object.einnahmeSonstiges2EUR
    );
    this.state.einnahmeTicketsEUR = floatAmount(object.einnahmeTicketsEUR);
    this.state.ausgabeSonstiges1Text = object.ausgabeSonstiges1Text;
    this.state.ausgabeSonstiges2Text = object.ausgabeSonstiges2Text;
    this.state.ausgabeSonstiges3Text = object.ausgabeSonstiges3Text;
    this.state.einnahmeSonstiges1Text = object.einnahmeSonstiges1Text;
    this.state.einnahmeSonstiges2Text = object.einnahmeSonstiges2Text;
    this.state.anzahlBesucherAK = object.anzahlBesucherAK;
    this.state.kassenfreigabe =
      object.kassenfreigabe || this.state.kassenfreigabe; // kann nicht mehr gelöscht werden
    return this;
  }

  anfangsbestandEUR(): number {
    return this.state.anfangsbestandEUR;
  }

  anzahlBesucherAK(): number {
    return parseInt(this.state.anzahlBesucherAK, 10) || 0;
  }

  ausgabeBankEUR(): number {
    return this.state.ausgabeBankEUR;
  }

  ausgabeCateringEUR(): number {
    return this.state.ausgabeCateringEUR;
  }

  ausgabeGageEUR(): number {
    return this.state.ausgabeGageEUR;
  }

  ausgabeHelferEUR(): number {
    return this.state.ausgabeHelferEUR;
  }

  ausgabeSonstiges1EUR(): number {
    return this.state.ausgabeSonstiges1EUR;
  }

  ausgabeSonstiges1Text(): string {
    return this.state.ausgabeSonstiges1Text;
  }

  ausgabeSonstiges2EUR(): number {
    return this.state.ausgabeSonstiges2EUR;
  }

  ausgabeSonstiges2Text(): string {
    return this.state.ausgabeSonstiges2Text;
  }

  ausgabeSonstiges3EUR(): number {
    return this.state.ausgabeSonstiges3EUR;
  }

  ausgabeSonstiges3Text(): string {
    return this.state.ausgabeSonstiges3Text;
  }

  ausgabenOhneGage(): number {
    return (
      this.ausgabeCateringEUR() +
      this.ausgabeHelferEUR() +
      this.ausgabeSonstiges1EUR() +
      this.ausgabeSonstiges2EUR() +
      this.ausgabeSonstiges3EUR()
    );
  }

  ausgabenTotalEUR(): number {
    return (
      this.ausgabeBankEUR() + this.ausgabeGageEUR() + this.ausgabenOhneGage()
    );
  }

  einnahmeBankEUR(): number {
    return this.state.einnahmeBankEUR;
  }

  einnahmeSonstiges1EUR(): number {
    return this.state.einnahmeSonstiges1EUR;
  }

  einnahmeSonstiges1Text(): string {
    return this.state.einnahmeSonstiges1Text;
  }

  einnahmeSonstiges2EUR(): number {
    return this.state.einnahmeSonstiges2EUR;
  }

  einnahmeSonstiges2Text(): string {
    return this.state.einnahmeSonstiges2Text;
  }

  einnahmeTicketsEUR(): number {
    return this.state.einnahmeTicketsEUR;
  }

  einnahmeTotalEUR(): number {
    return (
      this.einnahmeBankEUR() +
      this.einnahmeSonstiges1EUR() +
      this.einnahmeSonstiges2EUR() +
      this.einnahmeTicketsEUR()
    );
  }

  endbestandEUR(): number {
    return (
      this.anfangsbestandEUR() +
      this.einnahmeTotalEUR() -
      this.ausgabenTotalEUR()
    );
  }

  // FREIGABE

  istFreigegeben(): boolean {
    return !!this.state.kassenfreigabe;
  }

  freigabeErfolgtDurch(name: string): void {
    this.state.kassenfreigabe = name;
    this.state.kassenfreigabeAm = new Date();
  }

  freigabeRueckgaengig(): void {
    delete this.state.kassenfreigabe;
    delete this.state.kassenfreigabeAm;
  }

  freigabeDisplayDatum(): string {
    return this.state.kassenfreigabeAm
      ? DatumUhrzeit.forJSDate(this.state.kassenfreigabeAm).tagMonatJahrLang
      : '';
  }
}
