const config = require('simple-configure');
const beans = config.get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');

class Termin {
  constructor(object) {
    this.state = object ? object : {};
    if (!this.state.typ) {
      this.state.typ = Termin.typen()[0];
    }
  }

  static typen() {
    return ['Sonstiges', 'Feiertag', 'Ferien'];
  }

  static colorForType(typ) {
    return {
      Sonstiges: '#d6bdff',
      Feiertag: '#c1c3ff',
      Ferien: '#c1c3ff'
    }[typ];
  }

  fillFromUI(object) {
    this.state.startDate = DatumUhrzeit.forGermanString(
      object.startDate
    ).toJSDate();
    this.state.endDate = DatumUhrzeit.forGermanString(
      object.endDate,
      '12:00'
    ).toJSDate();
    this.state.id = object.id || new DatumUhrzeit().toLocalDateTimeString();
    this.state.beschreibung = object.beschreibung;
    this.state.typ = object.typ || Termin.typen()[0];
    return this;
  }

  id() {
    return this.state.id;
  }

  beschreibung() {
    return this.state.beschreibung;
  }

  startDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.startDate());
  }

  endDatumUhrzeit() {
    return DatumUhrzeit.forJSDate(this.endDate());
  }

  startDate() {
    return this.state.startDate || new DatumUhrzeit().toJSDate();
  }

  endDate() {
    return this.state.endDate || this.startDate();
  }

  typ() {
    return this.state.typ;
  }

  asEvent() {
    return {
      color: Termin.colorForType(this.typ()),
      start: this.startDate().toISOString(),
      end: this.endDate().toISOString(),
      title: this.beschreibung(),
      tooltip: this.beschreibung()
    };
  }
}

module.exports = Termin;
