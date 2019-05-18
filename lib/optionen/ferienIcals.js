const R = require('ramda');

const conf = require('simple-configure');
const beans = conf.get('beans');
const Termin = beans.get('termin');

class FerienIcals {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'ferienIcals';
    this.state.icals = (object && object.icals) || [];
  }

  icals() {
    return this.state.icals;
  }

  forName(name) {
    return this.icals().find(ical => ical.name === name);
  }

  forNameOrNew(name) {
    return this.forName(name) || { name: 'NEU', url: '', typ: 'Ferien' };
  }

  addIcal(object) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateIcal(object.name, object);
    }
    this.icals().push(object);
  }

  deleteIcal(name) {
    if (name) {
      this.state.icals = R.reject(R.propEq('name', name))(this.icals());
    }
  }

  updateIcal(oldname, object) {
    const ical = this.forName(oldname);
    ical.name = object.name;
    ical.url = object.url;
    ical.typ = object.typ;
  }

  forCalendar() {
    return this.icals().map(ical => {
      return {
        color: Termin.colorForType(ical.typ),
        url: '/ical/eventsFromIcalURL/' + encodeURIComponent(ical.url)
      };
    });
  }
}

module.exports = FerienIcals;
