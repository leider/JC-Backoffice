import { sortBy, flowRight, toLower, prop } from "lodash/fp";

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
}
