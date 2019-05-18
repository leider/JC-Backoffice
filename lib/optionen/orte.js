const R = require('ramda');
const sortByNameCaseInsensitive = R.sortBy(
  R.compose(
    R.toLower,
    R.prop('name')
  )
);

class Orte {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'orte';
    this.state.orte = object && sortByNameCaseInsensitive(object.orte || []);
  }

  orte() {
    return this.state.orte;
  }

  alleNamen() {
    return this.orte().map(ort => ort.name);
  }

  forName(name) {
    return this.state.orte.find(ort => ort.name === name);
  }

  addOrt(object) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateOrt(object.name, object);
    }
    this.state.orte.push(object);
    this.state.orte = sortByNameCaseInsensitive(this.orte());
  }

  deleteOrt(name) {
    if (name) {
      this.state.orte = R.reject(R.propEq('name', name))(this.orte());
    }
  }

  updateOrt(name, object) {
    const ort = this.forName(name);
    ort.name = object.name;
    ort.flaeche = object.flaeche;
    ort.presseIn = object.presseIn;
    ort.pressename = object.pressename;
  }

  updateFlaeche(kopf) {
    if (kopf.ort && kopf.flaeche) {
      const existingOrt = this.forName(kopf.ort);
      if (existingOrt) {
        existingOrt.flaeche = kopf.flaeche;
      }
    }
  }
}

module.exports = Orte;
