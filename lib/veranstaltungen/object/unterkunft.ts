import DatumUhrzeit from "../../commons/DatumUhrzeit";
import misc from "../../commons/misc";

function parseToDate(dateString: string, timeString?: string): Date | null {
  if (dateString) {
    return DatumUhrzeit.forGermanString(dateString, timeString)?.toJSDate || null;
  }
  return null;
}

export interface UnterkunftRaw {
  einzelNum: number;
  doppelNum: number;
  suiteNum: number;
  einzelEUR: number;
  doppelEUR: number;
  suiteEUR: number;
  transportEUR: number;
  kommentar: string;
  transportText: string;
  sonstiges: string[];
  angefragt: boolean;
  bestaetigt: boolean;
  anreiseDate?: Date | null;
  abreiseDate?: Date | null;
}

export interface UnterkunftUI {
  anreiseDate: string;
  abreiseDate: string;
  kommentar: string;
  einzelNum: string;
  einzelEUR: string;
  doppelNum: string;
  doppelEUR: string;
  suiteNum: string;
  suiteEUR: string;
  transportText: string;
  transportEUR: string;
  sonstiges?: string[];
  angefragt: string;
  bestaetigt: string;
}

export default class Unterkunft {
  state: UnterkunftRaw;
  private kuenstlerListe: string[];
  private veranstaltungstagAsDatumUhrzeit: DatumUhrzeit;

  toJSON(): UnterkunftRaw {
    return this.state;
  }

  constructor(object: UnterkunftRaw | undefined, veranstaltungstagAsDatumUhrzeit: DatumUhrzeit, kuenstlerListe: string[]) {
    this.state = object || {
      einzelNum: 0,
      doppelNum: 0,
      suiteNum: 0,
      einzelEUR: 0,
      doppelEUR: 0,
      suiteEUR: 0,
      transportEUR: 0,
      kommentar: "",
      transportText: "",
      sonstiges: [],
      angefragt: false,
      bestaetigt: false
    };
    this.kuenstlerListe = kuenstlerListe;
    this.veranstaltungstagAsDatumUhrzeit = veranstaltungstagAsDatumUhrzeit;
    if (!this.state.sonstiges) {
      this.state.sonstiges = [];
    }
    if (!this.state.abreiseDate) {
      this.state.abreiseDate = veranstaltungstagAsDatumUhrzeit.plus({
        tage: 1
      }).toJSDate;
    }
    if (!this.state.anreiseDate) {
      this.state.anreiseDate = veranstaltungstagAsDatumUhrzeit.toJSDate;
    }
  }

  fillFromUI(object: UnterkunftUI): Unterkunft {
    this.state.einzelEUR = parseFloat(object.einzelEUR) || 0;
    this.state.doppelEUR = parseFloat(object.doppelEUR) || 0;
    this.state.suiteEUR = parseFloat(object.suiteEUR) || 0;
    this.state.transportEUR = parseFloat(object.transportEUR) || 0;
    this.state.einzelNum = parseInt(object.einzelNum) || 0;
    this.state.doppelNum = parseInt(object.doppelNum) || 0;
    this.state.suiteNum = parseInt(object.suiteNum) || 0;
    this.state.kommentar = object.kommentar;
    this.state.transportText = object.transportText;
    this.state.sonstiges = misc.toArray(object.sonstiges);
    this.state.angefragt = !!object.angefragt;
    this.state.bestaetigt = !!object.bestaetigt;

    this.state.anreiseDate = parseToDate(object.anreiseDate);
    this.state.abreiseDate = parseToDate(object.abreiseDate);

    return this;
  }

  angefragt(): boolean {
    return this.state.angefragt;
  }

  bestaetigt(): boolean {
    return this.state.bestaetigt;
  }

  checked(): boolean {
    return this.bestaetigt();
  }

  anreiseDate(): Date | null | undefined {
    return this.state.anreiseDate;
  }

  abreiseDate(): Date | null | undefined {
    return this.state.abreiseDate;
  }

  anreiseDisplayDate(): string {
    const date = this.anreiseDate();
    return date ? DatumUhrzeit.forJSDate(date).tagMonatJahrKompakt : "";
  }

  minimalStartForHotel(): string {
    return this.veranstaltungstagAsDatumUhrzeit.minus({ tage: 7 }).tagMonatJahrKompakt;
  }

  abreiseDisplayDate(): string {
    const date = this.abreiseDate();
    return date ? DatumUhrzeit.forJSDate(date).tagMonatJahrKompakt : "";
  }

  kommentar(): string {
    return this.state.kommentar || this.kuenstlerListe.join("\r\n");
  }

  einzelNum(): number {
    return this.state.einzelNum;
  }

  doppelNum(): number {
    return this.state.doppelNum;
  }

  suiteNum(): number {
    return this.state.suiteNum;
  }

  einzelEUR(): number {
    return this.state.einzelEUR;
  }

  doppelEUR(): number {
    return this.state.doppelEUR;
  }

  suiteEUR(): number {
    return this.state.suiteEUR;
  }

  transportEUR(): number {
    return this.state.transportEUR;
  }

  transportText(): string {
    return this.state.transportText;
  }

  sonstiges(): string[] {
    return this.state.sonstiges;
  }

  anzahlNaechte(): number {
    const abreiseDate1 = this.abreiseDate();
    const anreiseDate1 = this.anreiseDate();
    return abreiseDate1 && anreiseDate1 ? DatumUhrzeit.forJSDate(abreiseDate1).differenzInTagen(DatumUhrzeit.forJSDate(anreiseDate1)) : 0;
  }

  anzahlZimmer(): number {
    return this.einzelNum() + this.doppelNum() + this.suiteNum();
  }

  kostenTotalEUR(): number {
    const naechte = this.anzahlNaechte();
    return (
      this.einzelNum() * this.einzelEUR() * naechte +
      this.doppelNum() * this.doppelEUR() * naechte +
      this.suiteNum() * this.suiteEUR() * naechte +
      this.transportEUR()
    );
  }
}
