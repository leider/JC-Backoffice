import DatumUhrzeit from "../../commons/DatumUhrzeit";
import misc from "../../commons/misc";
import Misc from "../../commons/misc";

function parseToDate(dateString: string, timeString?: string): Date | null {
  if (dateString) {
    return DatumUhrzeit.forGermanString(dateString, timeString)?.toJSDate || null;
  }
  return null;
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
  einzelNum = 0;
  doppelNum = 0;
  suiteNum = 0;
  einzelEUR = 0;
  doppelEUR = 0;
  suiteEUR = 0;
  transportEUR = 0;
  kommentar = "";
  transportText = "";
  sonstiges: string[] = [];
  angefragt = false;
  bestaetigt = false;
  anreiseDate: Date;
  abreiseDate: Date;

  private veranstaltungstagAsDatumUhrzeit: DatumUhrzeit;

  toJSON(): any {
    const result = Object.assign({}, this);
    delete result.veranstaltungstagAsDatumUhrzeit;
    return result;
  }

  constructor(object: any | undefined, veranstaltungstagAsDatumUhrzeit: DatumUhrzeit, kuenstlerListe: string[]) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        kommentar: object.kommentar || kuenstlerListe.join("\r\n"),
        sonstiges: misc.toArray(object.sonstiges)
      });
      this.anreiseDate = Misc.stringOrDateToDate(object.anreiseDate) || veranstaltungstagAsDatumUhrzeit.toJSDate;
      this.abreiseDate = Misc.stringOrDateToDate(object.abreiseDate) || veranstaltungstagAsDatumUhrzeit.plus({ tage: 1 }).toJSDate;
    } else {
      this.anreiseDate = veranstaltungstagAsDatumUhrzeit.toJSDate;
      this.abreiseDate = veranstaltungstagAsDatumUhrzeit.plus({ tage: 1 }).toJSDate;
    }
    this.veranstaltungstagAsDatumUhrzeit = veranstaltungstagAsDatumUhrzeit;
  }

  fillFromUI(object: UnterkunftUI): Unterkunft {
    this.einzelEUR = parseFloat(object.einzelEUR || "0") || 0;
    this.doppelEUR = parseFloat(object.doppelEUR || "0") || 0;
    this.suiteEUR = parseFloat(object.suiteEUR || "0") || 0;
    this.transportEUR = parseFloat(object.transportEUR || "0") || 0;
    this.einzelNum = parseInt(object.einzelNum || "0") || 0;
    this.doppelNum = parseInt(object.doppelNum || "0") || 0;
    this.suiteNum = parseInt(object.suiteNum || "0") || 0;
    this.kommentar = object.kommentar;
    this.transportText = object.transportText;
    this.sonstiges = misc.toArray(object.sonstiges);
    this.angefragt = !!object.angefragt;
    this.bestaetigt = !!object.bestaetigt;

    this.anreiseDate = parseToDate(object.anreiseDate) || this.veranstaltungstagAsDatumUhrzeit.toJSDate;
    this.abreiseDate =
      parseToDate(object.abreiseDate) ||
      this.veranstaltungstagAsDatumUhrzeit.plus({
        tage: 1
      }).toJSDate;

    return this;
  }

  checked(): boolean {
    return this.bestaetigt;
  }

  anreiseDisplayDate(): string {
    const date = this.anreiseDate;
    return date ? DatumUhrzeit.forJSDate(date).tagMonatJahrKompakt : "";
  }

  minimalStartForHotel(): string {
    return this.veranstaltungstagAsDatumUhrzeit.minus({ tage: 7 }).tagMonatJahrKompakt;
  }

  abreiseDisplayDate(): string {
    const date = this.abreiseDate;
    return date ? DatumUhrzeit.forJSDate(date).tagMonatJahrKompakt : "";
  }

  anzahlNaechte(): number {
    const abreiseDate1 = this.abreiseDate;
    const anreiseDate1 = this.anreiseDate;
    return abreiseDate1 && anreiseDate1 ? DatumUhrzeit.forJSDate(abreiseDate1).differenzInTagen(DatumUhrzeit.forJSDate(anreiseDate1)) : 0;
  }

  anzahlZimmer(): number {
    return this.einzelNum + this.doppelNum + this.suiteNum;
  }

  kostenTotalEUR(): number {
    const naechte = this.anzahlNaechte();
    return (
      this.einzelNum * this.einzelEUR * naechte +
      this.doppelNum * this.doppelEUR * naechte +
      this.suiteNum * this.suiteEUR * naechte +
      this.transportEUR
    );
  }
}