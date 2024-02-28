import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import Misc from "../commons/misc.js";

export default class Unterkunft {
  einzelNum = 0;
  doppelNum = 0;
  suiteNum = 0;
  einzelEUR = 0;
  doppelEUR = 0;
  suiteEUR = 0;
  transportEUR = 0;
  kommentar = "";
  sonstiges: string[] = [];
  angefragt = false;
  bestaetigt = false;
  anreiseDate: Date;
  abreiseDate: Date;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  constructor(object: any | undefined, veranstaltungstagAsDatumUhrzeit: DatumUhrzeit, kuenstlerListe: string[]) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        kommentar: object.kommentar || kuenstlerListe.join("\r\n"),
        sonstiges: Misc.toArray(object.sonstiges),
      });
      this.anreiseDate = Misc.stringOrDateToDate(object.anreiseDate) || veranstaltungstagAsDatumUhrzeit.toJSDate;
      this.abreiseDate = Misc.stringOrDateToDate(object.abreiseDate) || veranstaltungstagAsDatumUhrzeit.plus({ tage: 1 }).toJSDate;
    } else {
      this.anreiseDate = veranstaltungstagAsDatumUhrzeit.toJSDate;
      this.abreiseDate = veranstaltungstagAsDatumUhrzeit.plus({ tage: 1 }).toJSDate;
    }
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
    delete (this as any).transportText;
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
    delete (this as any).name;
  }

  get checked(): boolean {
    return this.bestaetigt;
  }

  get anreiseDisplayDate(): string {
    const date = this.anreiseDate;
    return date ? DatumUhrzeit.forJSDate(date).tagMonatJahrKompakt : "";
  }

  get abreiseDisplayDate(): string {
    const date = this.abreiseDate;
    return date ? DatumUhrzeit.forJSDate(date).tagMonatJahrKompakt : "";
  }

  private get anzahlNaechte(): number {
    const ab = this.abreiseDate;
    const an = this.anreiseDate;
    return ab && an ? DatumUhrzeit.forJSDate(ab).differenzInTagen(DatumUhrzeit.forJSDate(an)) : 0;
  }

  get anzahlZimmer(): number {
    function reallyNumber(val: string | number) {
      return parseInt(val.toString());
    }
    return reallyNumber(this.einzelNum) + reallyNumber(this.doppelNum) + reallyNumber(this.suiteNum);
  }

  get kostenTotalEUR(): number {
    return this.roomsTotalEUR + this.transportEUR;
  }

  get anzNacht(): string {
    const anz = this.anzahlNaechte;
    if (anz < 1) {
      return "";
    }
    return anz === 1 ? "eine Nacht" : `${anz} Nächte`;
  }

  get roomsTotalEUR(): number {
    const naechte = this.anzahlNaechte;
    return this.einzelNum * this.einzelEUR * naechte + this.doppelNum * this.doppelEUR * naechte + this.suiteNum * this.suiteEUR * naechte;
  }

  get zimmerPreise(): { einzelEUR: number; doppelEUR: number; suiteEUR: number } {
    return { einzelEUR: this.einzelEUR, doppelEUR: this.doppelEUR, suiteEUR: this.suiteEUR };
  }
}
