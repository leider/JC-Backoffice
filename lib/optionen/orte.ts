import R from 'ramda';

const sortByNameCaseInsensitive = R.sortBy(
  R.compose(R.toLower, R.prop('name'))
);

interface Ort {
  name: string;
  flaeche: string;
  presseIn: string;
  pressename: string;
}

export default class Orte {
  state: any;

  constructor(object: any) {
    this.state = object ? object : {};
    this.state.id = 'orte';
    this.state.orte = object && sortByNameCaseInsensitive(object.orte || []);
  }

  orte(): Ort[] {
    return this.state.orte;
  }

  alleNamen() {
    return this.orte().map(ort => ort.name);
  }

  forName(name: string): Ort | undefined {
    return this.orte().find(ort => ort.name === name);
  }

  addOrt(object: any) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateOrt(object.name, object);
    }
    this.state.orte.push(object);
    this.state.orte = sortByNameCaseInsensitive(this.orte());
  }

  deleteOrt(name?: string) {
    if (name) {
      this.state.orte = R.reject(R.propEq('name', name))(this.orte());
    }
  }

  updateOrt(name: string, object: Ort) {
    const ort = this.forName(name);
    if (!ort) {
      return;
    }
    ort.name = object.name;
    ort.flaeche = object.flaeche;
    ort.presseIn = object.presseIn;
    ort.pressename = object.pressename;
  }

  updateFlaeche(kopf: any) {
    if (kopf.ort && kopf.flaeche) {
      const existingOrt = this.forName(kopf.ort);
      if (existingOrt) {
        existingOrt.flaeche = kopf.flaeche;
      }
    }
  }
}
