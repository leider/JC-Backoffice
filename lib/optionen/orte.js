const R = require('ramda');

class Orte {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'orte';
    this.state.orte = (object && object.orte) || [];
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

  forNameOrNew(name) {
    return this.forName(name) || {name: 'NEU', flaeche: 0, presseIn: 'NEU', pressename: 'NEU'};
  }

  addOrt(object) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateOrt(object.name, object);
    }
    this.orte().push(object);
  }

  deleteOrt(name) {
    if (name) {
      this.state.orte = R.reject(R.propEq('name', name))(this.orte());
    }
  }

  updateOrt(oldname, object) {
    const ort = this.forName(oldname);
    if (!ort) {
      return this.addOrt(object);
    }
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
