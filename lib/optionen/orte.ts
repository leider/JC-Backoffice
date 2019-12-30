import R from 'ramda';

const sortByNameCaseInsensitive = R.sortBy(
  R.compose(R.toLower, R.prop('name'))
);

interface Ort {
  name: string;
  flaeche: string;
  presseIn?: string;
  pressename?: string;
}

export default class Orte {
  id = 'orte';
  orte: Ort[];

  static fromJSON(object: any): Orte {
    return new Orte(object);
  }

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object: any) {
    this.orte = sortByNameCaseInsensitive(object.orte || []);
  }

  alleNamen() {
    return this.orte.map(ort => ort.name);
  }

  forName(name: string): Ort | undefined {
    return this.orte.find(ort => ort.name === name);
  }

  addOrt(object: Ort & { oldname?: string }) {
    delete object.oldname;
    if (this.forName(object.name)) {
      return this.updateOrt(object.name, object);
    }
    this.orte.push(object);
    this.orte = sortByNameCaseInsensitive(this.orte);
  }

  deleteOrt(name?: string) {
    if (name) {
      this.orte = R.reject(R.propEq('name', name))(this.orte);
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
