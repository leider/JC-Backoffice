import reject from "lodash/reject";
import { sortBy, flowRight, toLower, prop } from "lodash/fp";
import Kopf from "../veranstaltungen/object/kopf";

const sortByNameCaseInsensitive = sortBy(flowRight(toLower, prop("name")));

export class Ort {
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

  toJSON(): object {
    return Object.assign({}, this);
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
    return Object.assign({}, this, {
      orte: this.orte.map((o) => o.toJSON()),
    });
  }

  constructor(object?: any) {
    if (object && object.orte) {
      this.orte = sortByNameCaseInsensitive((object.orte || []).map((o: any) => new Ort(o)));
    }
  }

  alleNamen(): string[] {
    return this.orte.map((ort) => ort.name);
  }

  forName(name: string): Ort | undefined {
    return this.orte.find((ort) => ort.name === name);
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
      this.orte = reject(this.orte, { name });
    }
  }

  updateOrt(name: string, object: any): void {
    const ort = this.forName(name);
    if (!ort) {
      return;
    }
    ort.update(object);
  }

  updateFlaeche(kopf: Kopf): void {
    if (kopf.ort && kopf.flaeche) {
      const existingOrt = this.forName(kopf.ort);
      if (existingOrt) {
        existingOrt.flaeche = kopf.flaeche;
      }
    }
  }
}
