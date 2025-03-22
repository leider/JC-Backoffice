/* eslint-disable  @typescript-eslint/no-explicit-any*/

import sortBy from "lodash/fp/sortBy.js";
import flowRight from "lodash/fp/flowRight.js";
import toLower from "lodash/fp/toLower.js";
import prop from "lodash/fp/prop.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import map from "lodash/map.js";

const sortByNameCaseInsensitive = sortBy(flowRight(toLower, prop("name")));

export class Ort {
  name = "";
  flaeche = 0;
  presseIn?: string;
  pressename?: string;

  constructor(object?: Partial<Ort & { _csrf: string }>) {
    if (object) {
      delete object._csrf; // Altlast
      Object.assign(this, object);
    }
  }
}

export default class Orte {
  id = "orte";
  orte: Ort[] = [];

  constructor(object?: RecursivePartial<Orte>) {
    if (object && object.orte) {
      this.orte = sortByNameCaseInsensitive(map(object.orte, (o: any) => new Ort(o)));
    }
  }

  alleNamen(): string[] {
    return map(this.orte, "name");
  }
}
