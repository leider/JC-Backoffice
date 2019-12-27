import DatumUhrzeit from '../../commons/DatumUhrzeit';
import fieldHelpers from '../../commons/fieldHelpers';
import misc from '../../commons/misc';

function parseToDate(dateString: string, timeString?: string) {
  if (dateString) {
    return DatumUhrzeit.forGermanString(dateString, timeString)?.toJSDate;
  }
  return null;
}

export default class Unterkunft {
  state: any;
  private kuenstlerListe: string[];
  private veranstaltungstagAsDatumUhrzeit: DatumUhrzeit;

  constructor(object: any, veranstaltungstagAsDatumUhrzeit: DatumUhrzeit, kuenstlerListe: string[]) {
    this.kuenstlerListe = kuenstlerListe;
    this.state = object || {};
    this.veranstaltungstagAsDatumUhrzeit = veranstaltungstagAsDatumUhrzeit;
    if (!this.state.sonstiges) {
      this.state.sonstiges = [];
    }
  }

  fillFromUI(object: any) {
    [
      'einzelNum',
      'doppelNum',
      'suiteNum',
      'einzelEUR',
      'doppelEUR',
      'suiteEUR',
      'transportEUR'
    ].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(
        object[field]
      );
    });
    ['kommentar', 'transportText'].forEach(field => {
      this.state[field] = object[field];
    });

    ['sonstiges'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['angefragt', 'bestaetigt'].forEach(field => {
      this.state[field] = !!object[field];
    });

    this.state.anreiseDate = parseToDate(object.anreiseDate);
    this.state.abreiseDate = parseToDate(object.abreiseDate);

    return this;
  }

  angefragt() {
    return !!this.state.angefragt;
  }

  bestaetigt() {
    return !!this.state.bestaetigt;
  }

  checked() {
    return this.bestaetigt();
  }

  anreiseDate() {
    return this.state.anreiseDate;
  }

  abreiseDate() {
    return this.state.abreiseDate;
  }

  anreiseDisplayDate() {
    return this.anreiseDate()
      ? DatumUhrzeit.forJSDate(this.anreiseDate()).tagMonatJahrKompakt
      : '';
  }

  minimalStartForHotel() {
    return this.veranstaltungstagAsDatumUhrzeit
      .minus({ tage: 7 })
      .tagMonatJahrKompakt;
  }

  abreiseDisplayDate() {
    return this.abreiseDate()
      ? DatumUhrzeit.forJSDate(this.abreiseDate()).tagMonatJahrKompakt
      : '';
  }

  kommentar() {
    return this.state.kommentar || this.kuenstlerListe.join('\r\n');
  }

  einzelNum() {
    return parseInt(this.state.einzelNum, 10) || 0;
  }

  doppelNum() {
    return parseInt(this.state.doppelNum, 10) || 0;
  }

  suiteNum() {
    return parseInt(this.state.suiteNum, 10) || 0;
  }

  einzelEUR() {
    return this.state.einzelEUR || 0;
  }

  doppelEUR() {
    return this.state.doppelEUR || 0;
  }

  suiteEUR() {
    return this.state.suiteEUR || 0;
  }

  transportEUR() {
    return this.state.transportEUR || 0;
  }

  transportText() {
    return this.state.transportText;
  }

  sonstiges() {
    return this.state.sonstiges;
  }

  anzahlNaechte() {
    return (
      DatumUhrzeit.forJSDate(this.abreiseDate()).differenzInTagen(
        DatumUhrzeit.forJSDate(this.anreiseDate())
      ) || 0
    );
  }

  anzahlZimmer() {
    return this.einzelNum() + this.doppelNum() + this.suiteNum();
  }

  kostenTotalEUR() {
    const naechte = this.anzahlNaechte();
    return (
      this.einzelNum() * this.einzelEUR() * naechte +
      this.doppelNum() * this.doppelEUR() * naechte +
      this.suiteNum() * this.suiteEUR() * naechte +
      this.transportEUR()
    );
  }
}
