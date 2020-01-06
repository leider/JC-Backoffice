import R from "ramda";
import { KopfUI } from "../veranstaltungen/object/kopf";

const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop("name")));

interface Kopf {
  flaeche: string;
  ort: string;
}

interface Ort {
  name: string;
  flaeche: string;
  presseIn?: string;
  pressename?: string;
}

export default class Orte {
  id = "orte";
  orte: Ort[];

  static fromJSON(object: { orte: Ort[] }): Orte {
    return new Orte(object);
  }

  toJSON(): object {
    return Object.assign({}, this);
  }

  constructor(object: { orte: Ort[] }) {
    this.orte = sortByNameCaseInsensitive(object.orte || []);
  }

  alleNamen(): string[] {
    return this.orte.map(ort => ort.name);
  }

  forName(name: string): Ort | undefined {
    return this.orte.find(ort => ort.name === name);
  }

  addOrt(object: Ort & { oldname?: string }): void {
    delete object.oldname;
    if (this.forName(object.name)) {
      this.updateOrt(object.name, object);
      return;
    }
    this.orte.push(object);
    this.orte = sortByNameCaseInsensitive(this.orte);
  }

  deleteOrt(name?: string): void {
    if (name) {
      this.orte = R.reject(R.propEq("name", name))(this.orte);
    }
  }

  updateOrt(name: string, object: Ort): void {
    const ort = this.forName(name);
    if (!ort) {
      return;
    }
    ort.name = object.name;
    ort.flaeche = object.flaeche;
    ort.presseIn = object.presseIn;
    ort.pressename = object.pressename;
  }

  updateFlaeche(kopf: KopfUI): void {
    if (kopf.ort && kopf.flaeche) {
      const existingOrt = this.forName(kopf.ort);
      if (existingOrt) {
        existingOrt.flaeche = kopf.flaeche;
      }
    }
  }
}
