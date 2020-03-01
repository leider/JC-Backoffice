import R from "ramda";
import { KopfUI } from "../veranstaltungen/object/kopf";

const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop("name")));

class Ort {
  name = "";
  flaeche = "";
  presseIn?: string;
  pressename?: string;

  constructor(object?: any) {
    if (object) {
      delete object._csrf; // Altlast
      Object.assign(this, object);
    }
  }
  update(object: any): void {
    this.name = object.name;
    this.flaeche = object.flaeche;
    this.presseIn = object.presseIn;
    this.pressename = object.pressename;
  }
}

export default class Orte {
  id = "orte";
  orte: Ort[] = [];

  toJSON(): object {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && object.orte) {
      this.orte = sortByNameCaseInsensitive((object.orte || []).map((o: any) => new Ort(o)));
    }
  }

  alleNamen(): string[] {
    return this.orte.map(ort => ort.name);
  }

  forName(name: string): Ort | undefined {
    return this.orte.find(ort => ort.name === name);
  }

  addOrt(object: any & { oldname?: string }): void {
    delete object.oldname;
    if (this.forName(object.name)) {
      this.updateOrt(object.name, object);
      return;
    }
    this.orte.push(new Ort(object));
    this.orte = sortByNameCaseInsensitive(this.orte);
  }

  deleteOrt(name?: string): void {
    if (name) {
      this.orte = R.reject(R.propEq("name", name))(this.orte);
    }
  }

  updateOrt(name: string, object: any): void {
    const ort = this.forName(name);
    if (!ort) {
      return;
    }
    ort.update(object);
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
